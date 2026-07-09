import { useApiQuery, useApiMutation, useApiMutationWithUrl } from './use-api';
import type { BlogPost, PaginationMeta } from '@lumora/shared';

interface BlogPostsResponse {
  posts: BlogPost[];
  meta: PaginationMeta;
}

export function useBlogPosts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useApiQuery<BlogPostsResponse>(['blog', 'posts'], '/blog/posts', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function useBlogPost(slug: string) {
  return useApiQuery<BlogPost>(['blog', 'post', slug], `/blog/posts/${slug}`, {
    enabled: !!slug,
  });
}

export function useCreatePost() {
  return useApiMutation<BlogPost, Record<string, unknown>>('post', '/blog/posts');
}

export function useUpdatePost() {
  return useApiMutationWithUrl<BlogPost, { id: string } & Record<string, unknown>>(
    'put',
    (vars) => `/blog/posts/${vars.id}`,
  );
}

export function useDeletePost() {
  return useApiMutationWithUrl<void, { id: string }>('delete', (vars) => `/blog/posts/${vars.id}`);
}
