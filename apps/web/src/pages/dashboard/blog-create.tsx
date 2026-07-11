import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreatePost, useUpdatePost, useBlogPostById } from '@/hooks';
import { Button, Skeleton, toast } from '@lumora/ui';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existingPost, isLoading: loadingPost } = useBlogPostById(id || '');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt);
      setContent(existingPost.content);
      setCoverImage(existingPost.coverImage || '');
      setTags(existingPost.tags.join(', '));
      setStatus(existingPost.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
    }
  }, [existingPost]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) setSlug(slugify(value));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!slug.trim()) errs.slug = 'Slug is required';
    if (!excerpt.trim()) errs.excerpt = 'Excerpt is required';
    if (!content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    };

    try {
      if (isEdit) {
        await updatePost.mutateAsync({ id: id!, ...payload });
        toast({ title: 'Post updated', variant: 'success' });
      } else {
        await createPost.mutateAsync(payload as unknown as Record<string, unknown>);
        toast({ title: 'Post created', variant: 'success' });
      }
      navigate('/dashboard/blog');
    } catch {
      toast({
        title: isEdit ? 'Failed to update post' : 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;

  if (isEdit && loadingPost) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/blog')}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-text-primary text-2xl font-semibold">{isEdit ? 'Edit Post' : 'New Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-1"
            placeholder="Enter post title"
          />
          {errors.title && <p className="text-error mt-1 text-xs">{errors.title}</p>}
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-1"
            placeholder="post-url-slug"
          />
          {errors.slug && <p className="text-error mt-1 text-xs">{errors.slug}</p>}
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-1"
            placeholder="Brief description of the post"
          />
          {errors.excerpt && <p className="text-error mt-1 text-xs">{errors.excerpt}</p>}
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full resize-y rounded-xl border px-4 py-2.5 font-mono text-sm outline-none focus:ring-1"
            placeholder="Write your post content here..."
          />
          {errors.content && <p className="text-error mt-1 text-xs">{errors.content}</p>}
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Cover Image URL</label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-1"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-1"
            placeholder="react, typescript, web"
          />
        </div>

        <div className="border-border-secondary bg-surface-secondary flex items-center gap-4 rounded-xl border p-4">
          <span className="text-text-primary text-sm font-medium">Status</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('DRAFT')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('PUBLISHED')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                status === 'PUBLISHED'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Published
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" className="gap-2" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/blog')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
