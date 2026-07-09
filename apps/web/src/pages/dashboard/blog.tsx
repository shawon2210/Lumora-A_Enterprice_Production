import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, FileText, RefreshCw } from 'lucide-react';
import { useBlogPosts, useDeletePost, useDebounce } from '@/hooks';
import {
  Card,
  Button,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lumora/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import type { BlogPost } from '@lumora/shared';

const T = ['All', 'Published', 'Drafts', 'Archived'] as const;
const B: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400',
  DRAFT: 'bg-amber-500/10 text-amber-400',
  ARCHIVED: 'bg-neutral-500/10 text-neutral-400',
};

function BlogContent() {
  const nav = useNavigate();
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [pg, setPg] = useState(1);
  const [del, setDel] = useState<BlogPost | null>(null);
  const status = tab === 'All' ? undefined : tab.toUpperCase();
  const { data, isLoading, error, refetch } = useBlogPosts({
    page: pg,
    limit: 10,
    status,
    search: useDebounce(q, 400) || undefined,
  });
  const delM = useDeletePost();
  const p = data?.posts || [];
  const m = data?.meta;

  if (error)
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-text-secondary text-sm">Failed to load posts</p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
              <Skeleton className="mt-4 h-6 w-20 rounded-full" />
            </Card>
          ))}
        </div>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-text-primary text-2xl font-semibold">Blog</h1>
        <Button className="gap-2" onClick={() => nav('/dashboard/blog/new')}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-surface-secondary flex gap-1 rounded-xl p-1">
          {T.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPg(1);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${tab === t ? 'bg-surface-primary text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search posts..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPg(1);
            }}
            className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-1"
          />
        </div>
      </div>
      {p.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="text-text-tertiary h-12 w-12" />
          <h3 className="text-text-primary mt-4 text-lg font-medium">No posts yet</h3>
          <p className="text-text-secondary mt-1 text-sm">
            Get started by creating your first blog post.
          </p>
          <Button className="mt-6 gap-2" onClick={() => nav('/dashboard/blog/new')}>
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="group cursor-pointer transition-all hover:brightness-110">
                <div className="from-primary-500/20 to-primary-600/10 relative h-40 overflow-hidden rounded-t-2xl bg-gradient-to-br">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="text-primary-400/40 h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white/80 transition-colors hover:bg-black/40">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => nav(`/dashboard/blog/${post.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-error" onClick={() => setDel(post)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${B[post.status] || ''}`}
                    >
                      {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                    </span>
                    {post.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="bg-primary-500/10 text-primary-400 rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-text-primary mt-3 line-clamp-2 text-sm font-medium">
                    {post.title}
                  </h3>
                  <p className="text-text-tertiary mt-1 line-clamp-2 text-xs">{post.excerpt}</p>
                  <div className="border-border-secondary mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-text-tertiary text-xs">
                      {post.author?.name || 'Unknown'}
                    </span>
                    <span className="text-text-tertiary text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {m && m.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPg((p) => Math.max(1, p - 1))}
            disabled={!m.hasPrev}
            className="border-border-secondary text-text-secondary hover:bg-surface-secondary rounded-xl border px-4 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-text-secondary px-4 text-sm">
            Page {m.page} of {m.totalPages}
          </span>
          <button
            onClick={() => setPg((p) => p + 1)}
            disabled={!m.hasNext}
            className="border-border-secondary text-text-secondary hover:bg-surface-secondary rounded-xl border px-4 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      <Dialog
        open={!!del}
        onOpenChange={(o) => {
          if (!o) setDel(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{del?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDel(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await delM.mutateAsync({ id: del!.id });
                setDel(null);
              }}
              disabled={delM.isPending}
            >
              {delM.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function BlogPage() {
  return (
    <ErrorBoundary>
      <BlogContent />
    </ErrorBoundary>
  );
}
