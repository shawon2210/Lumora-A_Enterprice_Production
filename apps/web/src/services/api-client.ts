import { useAuthStore } from '@/store/auth-store';

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
  }

  private getAccessToken(): string | null {
    return useAuthStore.getState().accessToken;
  }

  private async refreshSession(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        useAuthStore.getState().logout();
        return false;
      }

      const json = await res.json();
      const newAccessToken = json.data?.accessToken || json.accessToken;
      if (newAccessToken) {
        useAuthStore.getState().setAccessToken(newAccessToken);
      }
      return true;
    } catch {
      useAuthStore.getState().logout();
      return false;
    }
  }

  private async request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const accessToken = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let url = `${this.baseUrl}${path}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
      credentials: 'include',
    });

    if (res.status === 401 && accessToken) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshSession();
      }
      const refreshed = await this.refreshPromise;
      this.refreshPromise = null;

      if (refreshed) {
        const newToken = this.getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        const retryRes = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: options?.signal,
          credentials: 'include',
        });
        const retryData = await retryRes.json();
        if (!retryRes.ok) {
          throw new ApiClientError(
            retryRes.status,
            retryData.error?.code || 'UNKNOWN_ERROR',
            retryData.error?.message || 'Something went wrong',
            retryData.error?.details,
          );
        }
        return retryData.data !== undefined ? retryData.data : retryData;
      }

      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new ApiClientError(401, 'UNAUTHORIZED', 'Session expired');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new ApiClientError(
        res.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'Something went wrong',
        data.error?.details,
      );
    }

    return data.data !== undefined ? data.data : data;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

export const api = new ApiClient();
