const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, cache, next } = options;

  const token = getAccessToken();

  const config: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    ...(next ? { next } : {}),
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Auto-refresh on 401
  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      config.headers = {
        ...config.headers as Record<string, string>,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ==========================================
// Auth API
// ==========================================
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    apiRequest<import('@/types').AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest<import('@/types').AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
    }),

  getProfile: () =>
    apiRequest<import('@/types').User>('/auth/profile'),
};

// ==========================================
// Blog API (Authenticated)
// ==========================================
export const blogApi = {
  getMyBlogs: () =>
    apiRequest<import('@/types').Blog[]>('/blogs'),

  getBlog: (id: string) =>
    apiRequest<import('@/types').Blog>(`/blogs/${id}`),

  createBlog: (data: import('@/types').CreateBlogPayload) =>
    apiRequest<import('@/types').Blog>('/blogs', {
      method: 'POST',
      body: data,
    }),

  updateBlog: (id: string, data: import('@/types').UpdateBlogPayload) =>
    apiRequest<import('@/types').Blog>(`/blogs/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteBlog: (id: string) =>
    apiRequest<{ message: string }>(`/blogs/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// Public API
// ==========================================
export const publicApi = {
  getFeed: (page: number = 1, limit: number = 10) =>
    apiRequest<import('@/types').PaginatedResponse<import('@/types').Blog>>(
      `/public/feed?page=${page}&limit=${limit}`,
    ),

  getBlogBySlug: (slug: string) =>
    apiRequest<import('@/types').Blog>(`/public/blogs/${slug}`),
};

// ==========================================
// Like API
// ==========================================
export const likeApi = {
  like: (blogId: string) =>
    apiRequest<import('@/types').LikeResponse>(`/blogs/${blogId}/like`, {
      method: 'POST',
    }),

  unlike: (blogId: string) =>
    apiRequest<import('@/types').LikeResponse>(`/blogs/${blogId}/like`, {
      method: 'DELETE',
    }),
};

// ==========================================
// Comment API
// ==========================================
export const commentApi = {
  getComments: (blogId: string, page: number = 1) =>
    apiRequest<import('@/types').PaginatedResponse<import('@/types').Comment>>(
      `/blogs/${blogId}/comments?page=${page}&limit=20`,
    ),

  createComment: (blogId: string, content: string) =>
    apiRequest<import('@/types').Comment>(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: { content },
    }),
};

export { ApiError, setTokens, clearTokens, getAccessToken };
