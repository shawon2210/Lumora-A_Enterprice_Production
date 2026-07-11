import { useApiQuery, useApiMutationWithUrl } from './use-api';
import type { MediaFile, PaginationMeta } from '@lumora/shared';

interface MediaResponse {
  media: MediaFile[];
  meta: PaginationMeta;
}

export function useMedia(params?: { page?: number; type?: string; search?: string }) {
  return useApiQuery<MediaResponse>(['media'], '/media', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function useDeleteMedia() {
  return useApiMutationWithUrl<void, { id: string }>('delete', (vars) => `/media/${vars.id}`, {
    invalidationKey: ['media'],
  });
}
