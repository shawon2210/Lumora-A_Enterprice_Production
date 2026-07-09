import { useApiQuery } from './use-api';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'media';
  title: string;
  description: string;
  url: string;
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  return useApiQuery<SearchResult[]>(
    ['search', debouncedQuery],
    `/search?q=${encodeURIComponent(debouncedQuery)}`,
    {
      enabled: debouncedQuery.length >= 2,
    },
  );
}
