import type { UserRole, SubscriptionStatus, ContentStatus, NotificationType, MediaType } from '../enums';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  subscription: SubscriptionStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  status: ContentStatus;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: MediaType;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}
