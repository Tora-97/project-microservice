const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  
  // Set default Content-Type only if it's not a FormData (FormData needs browser to set boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  status: number;
  message: string;
  data: { 
    token: string; 
    role: string; 
    email: string;
    id?: string;
    fullName?: string;
    phone?: string;
    address?: string;
  } | null;
}

export async function register(email: string, password: string, fullName: string, phone: string, address: string) {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, phone, address }),
  });
}

export async function login(email: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Users (Admin) ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export async function getUsers() {
  return request<{ status: number; data: User[] }>("/api/v1/users");
}

export async function updateUser(id: number, data: Partial<User> & { password?: string }) {
  return request<{ status: number; data: User }>(`/api/v1/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number) {
  return request<{ status: number }>(`/api/v1/users/${id}`, { method: "DELETE" });
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stockQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  category?: Category;
  variants: ProductVariant[];
}

export interface ProductsResponse {
  status: number;
  message: string;
  data: Product[];
}

export interface CategoriesResponse {
  status: number;
  message: string;
  data: Category[];
}

export async function getCategories() {
  return request<CategoriesResponse>("/api/v1/categories", {
    method: "GET",
  });
}

export async function createCategory(category: Omit<Category, "id">) {
  return request<{ status: number; data: Category }>("/api/v1/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

export async function updateCategory(id: number, category: Partial<Category>) {
  return request<{ status: number; data: Category }>(`/api/v1/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(category),
  });
}

export async function deleteCategory(id: number) {
  return request<{ status: number }>(`/api/v1/categories/${id}`, { method: "DELETE" });
}

export async function getProducts(query?: string, categoryId?: number) {
  let url = "/api/v1/products";
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  if (categoryId) params.append("categoryId", categoryId.toString());
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  return request<ProductsResponse>(url, { method: "GET" });
}

export async function getProduct(id: number) {
  return request<{ status: number; data: Product }>(`/api/v1/products/${id}`);
}

export async function createProduct(product: Omit<Product, "id">) {
  return request<{ status: number; data: Product }>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: number, product: Partial<Product>) {
  return request<{ status: number; data: Product }>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: number) {
  return request<{ status: number }>(`/api/v1/products/${id}`, { method: "DELETE" });
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ status: number; message: string; data: string }>("/api/v1/products/upload-image", {
    method: "POST",
    body: formData,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  productVariantId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalPrice: number;
  items: OrderItem[];
  discountCode?: string;
  discountAmount?: number;
}

export async function createOrder(
  userId: number,
  items: Omit<OrderItem, "price">[],
  discountCode?: string
) {
  return request<{ status: number; data: Order }>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({ userId, items, discountCode }),
  });
}

export async function getOrders(userId?: number) {
  const url = userId ? `/api/v1/orders/user/${userId}` : `/api/v1/orders`;
  return request<{ status: number; data: Order[] }>(url);
}

export async function updateOrder(id: number, data: Partial<Order>) {
  return request<{ status: number; data: Order }>(`/api/v1/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: number) {
  return request<{ status: number }>(`/api/v1/orders/${id}`, { method: "DELETE" });
}

// ── Vouchers ──────────────────────────────────────────────────────────────────

export interface Discount {
  id: number;
  code: string;
  discountType: string; // PERCENT or FIXED
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: number;
  usageLimit: number;
  usedCount: number;
}

export async function getDiscounts() {
  return request<{ status: number; data: Discount[] }>("/api/v1/discounts");
}

export async function createDiscount(data: Omit<Discount, "id" | "usedCount">) {
  return request<{ status: number; data: Discount }>("/api/v1/discounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDiscount(id: number) {
  return request<{ status: number }>(`/api/v1/discounts/${id}`, {
    method: "DELETE",
  });
}

export async function validateDiscount(code: string, orderAmount: number) {
  return request<{
    status: number;
    data: { valid: boolean; discountAmount: number; message: string };
  }>(`/api/v1/discounts/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
}


