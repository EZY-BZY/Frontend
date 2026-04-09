/* ─── Locale ─────────────────────────────────────────────────── */
export type Locale = "en" | "ar" | "fr";
export type Direction = "ltr" | "rtl";

/* ─── User / Auth ────────────────────────────────────────────── */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  avatarUrl?: string;
}

/* ─── Pagination ─────────────────────────────────────────────── */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ─── Table ──────────────────────────────────────────────────── */
export type SortDirection = "asc" | "desc";
export interface SortState {
  column: string;
  direction: SortDirection;
}

/* ─── Status ─────────────────────────────────────────────────── */
export type RequestStatus = "new" | "inProgress" | "resolved" | "closed";
export type EmployeeStatus = "active" | "inactive" | "onLeave";
export type ProductStatus = "active" | "draft" | "archived";

/* ─── Contact Request ────────────────────────────────────────── */
export interface ContactRequest {
  id: string;
  clientName: string;
  email: string;
  companyName: string;
  status: RequestStatus;
  date: string;
  message: string;
}

/* ─── Employee ───────────────────────────────────────────────── */
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  joinDate: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
}

/* ─── Product ────────────────────────────────────────────────── */
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
  description: string;
  createdAt: string;
}

/* ─── Category ───────────────────────────────────────────────── */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  parentId?: string;
  createdAt: string;
}

/* ─── E-Catalog Item ─────────────────────────────────────────── */
export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  fileUrl?: string;
  language: string;
  publishedAt: string;
  pages: number;
}

/* ─── Nav Item ───────────────────────────────────────────────── */
export interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
