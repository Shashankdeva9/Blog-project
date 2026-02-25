// ==========================================
// Shared Types for Blog Platform
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt?: string;
  _count?: {
    blogs: number;
  };
}

export interface Blog {
  id: string;
  userId: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email?: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  isLikedByUser?: boolean;
}

export interface Comment {
  id: string;
  blogId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  isPublished?: boolean;
}
