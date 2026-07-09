import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { api, ApiClientError } from '@/services/api-client';

type QueryKey = readonly unknown[];

export function useApiQuery<T>(
  key: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<T, ApiClientError, T, QueryKey>, 'queryKey' | 'queryFn'> & {
    params?: Record<string, string | number | undefined>;
  },
) {
  const { params, ...queryOptions } = options || {};
  return useQuery<T, ApiClientError>({
    queryKey: params ? [...key, params] : key,
    queryFn: ({ signal }) => api.get<T>(url, { params, signal }),
    ...queryOptions,
  });
}

export function useApiMutation<TData, TVariables = void>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: UseMutationOptions<TData, ApiClientError, TVariables>,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: (variables) =>
      (api[method] as (url: string, body?: unknown) => Promise<TData>)(
        url,
        variables as unknown as Record<string, unknown>,
      ),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(...args);
    },
  });
}

export function useApiMutationWithUrl<TData, TVariables = void>(
  method: 'post' | 'put' | 'patch' | 'delete',
  urlFn: (variables: TVariables) => string,
  options?: UseMutationOptions<TData, ApiClientError, TVariables>,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: (variables) =>
      (api[method] as (url: string, body?: unknown) => Promise<TData>)(
        urlFn(variables),
        variables as unknown as Record<string, unknown>,
      ),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(...args);
    },
  });
}
