const API_BASE = import.meta.env.VITE_API_BASE_URL;

function buildApiUrl(endpoint: string): string {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');

  const queryIndex = endpoint.indexOf('?');
  const path = queryIndex === -1 ? endpoint : endpoint.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : endpoint.slice(queryIndex);
  const normalizedPath = `${path.replace(/^\/+|\/+$/g, '')}/`;
  const base = `${API_BASE.replace(/\/+$/, '')}/`;

  return new URL(`${normalizedPath}${query}`, base).toString();
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('hera_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildApiUrl(endpoint), {
    method: options.method || 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      error.detail ||
      (typeof error === 'object' ? Object.values(error).flat().join(' ') : '') ||
      `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (data: { username: string; password: string }) =>
    request<{ access: string; refresh: string }>('/token/', { method: 'POST', body: data }),
  register: (data: { username: string; email: string; password: string }) =>
    request<{ id: number; username: string; email: string }>('/auth/register/', { method: 'POST', body: data }),
  profile: () => request<User>('/auth/me/'),
  updateProfile: (data: Partial<User>) => request<User>('/auth/me/', { method: 'PUT', body: data }),
};

// Products
export const products = {
  list: async (params?: string) => {
    const response = await request<Product[] | PaginatedResponse<Product>>(`/products/${params || ''}`);
    return Array.isArray(response) ? response : response.results;
  },
  detail: (slug: string) => request<Product>(`/products/${slug}/`),
  reviews: (slug: string) => request<Review[]>(`/products/${slug}/reviews/`),
  categories: () => request<Category[]>('/categories/'),
};

// Cart
export const cart = {
  get: () => request<CartResponse>('/cart/'),
  add: (productId: number, quantity: number = 1) =>
    request<CartResponse>('/cart/', { method: 'POST', body: { product_id: productId, quantity } }),
  update: (itemId: number, quantity: number) =>
    request<CartResponse>(`/cart/${itemId}/`, { method: 'PUT', body: { quantity } }),
  remove: (itemId: number) =>
    request<CartResponse>(`/cart/${itemId}/`, { method: 'DELETE' }),
  clear: () => request<CartResponse>('/cart/', { method: 'DELETE' }),
};

// Orders
export const orders = {
  list: () => request<Order[]>('/orders/'),
  detail: (id: number) => request<Order>(`/orders/${id}/`),
  create: (data: { shipping_address: string; city: string; zip_code: string; phone?: string; notes?: string }) =>
    request<Order>('/orders/', { method: 'POST', body: data }),
};

// Wishlist
export const wishlist = {
  list: () => request<WishlistItemType[]>('/wishlist/'),
  toggle: (productId: number) =>
    request<{ action: string }>('/wishlist/', { method: 'POST', body: { product_id: productId } }),
};

// Contact
export const contact = {
  send: (data: { name: string; email: string; message: string }) =>
    request<{ message: string }>('/contact/', { method: 'POST', body: data }),
};

// Newsletter
export const newsletter = {
  subscribe: (email: string) =>
    request<{ message: string }>('/newsletter/', { method: 'POST', body: { email } }),
};
export const payment = {
  initialize: (orderId: number) =>
    request<{ authorization_url: string; reference: string }>(
      '/payments/initialize/',
      { method: 'POST', body: { order_id: orderId } }
    ),
};

// Types
export interface Product {
  id: number; name: string; slug: string; category: number; category_name: string; category_slug?: string;
  price: number; compare_price?: number | null; image: string; image_extra?: string;
  description: string; stock: number; featured: boolean; badge?: string;
  average_rating?: number | null; created_at: string;
}

export interface Category {
  id: number; name: string; slug: string; image?: string; product_count: number;
}

export interface Review {
  id: number; user: number; user_name: string; rating: number; comment: string; created_at: string;
}

export interface CartItemType {
  id: number; product: Product; quantity: number; total: number;
}

export interface CartResponse {
  id: number; items: CartItemType[]; total: number;
}

export interface Order {
  id: number; items: OrderItem[]; total: number; status: string;
  shipping_address: string; city: string; zip_code: string; phone: string;
  created_at: string;
}

export interface OrderItem {
  product_name: string; product_price: number; quantity: number; total: number;
}

export interface WishlistItemType {
  id: number; product: number; product_detail: Product;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
