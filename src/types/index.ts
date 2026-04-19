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
export type EmployeePosition = "Admin" | "Support";

/* ─── Contact Request ────────────────────────────────────────── */
export interface ContactRequest {
  id: string;
  clientName: string;
  /** E.164 country dial code e.g. "+971" */
  countryCode: string;
  /** Local phone number without country code */
  phone: string;
  companyName: string;
  status: RequestStatus;
  date: string;
  message: string;
}

/* ─── Employee ───────────────────────────────────────────────── */
export interface Employee {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  email: string;
  phone: string;
  /** Hardcoded to "Admin" | "Support" */
  position: EmployeePosition;
  status: EmployeeStatus;
  joinDate: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
}

/* ─── Category ───────────────────────────────────────────────── */
export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  productCount: number;
  parentId?: string;
  /** Emoji icon displayed in the table and UI, e.g. "⚙️" */
  iconEmoji?: string;
  createdAt: string;
}

/* ─── Country ────────────────────────────────────────────────── */
export interface Country {
  id: string;
  /** ISO 3166-1 alpha-2 code, e.g. "AE" */
  iso: string;
  name_en: string;
  name_ar: string;
  /** Currency name in English, e.g. "UAE Dirham" */
  currencyEn: string;
  /** Currency name in Arabic, e.g. "درهم إماراتي" */
  currencyAr: string;
  /** Currency name in French, e.g. "Dirham des Émirats arabes unis" */
  currencyFr: string;
  /** Unicode flag emoji, e.g. "🇦🇪" */
  flag: string;
  /** Phone country dial code, e.g. "+971" */
  phoneCode: string;
  /** Phone number validation regex pattern */
  regex: string;
  createdAt: string;
}

/** Administrative region within a Country */
export interface Governorate {
  id: string;
  name_en: string;
  name_ar: string;
  /** Foreign key → Country.id */
  countryId: string;
  createdAt: string;
}

/* ─── Bundles ────────────────────────────────────────────────── */
export interface Bundle {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  currency: string;
  durationEn: string;
  durationAr: string;
  featuresEn: string[];
  featuresAr: string[];
  /** true = live catalog; false = deactivated/archived */
  isActive: boolean;
  createdAt: string;
  deactivatedAt?: string;
  deactivationReasonEn?: string;
  deactivationReasonAr?: string;
}

/* ─── Company ────────────────────────────────────────────────── */
export interface Company {
  id: string;
  name_en: string;
  name_ar: string;
  /** Emoji or URL; used as a logo placeholder */
  logo?: string;
  /** Array of Country.id values where this company operates */
  operatingIn: string[];
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

/* ─── Subscription Ledger ────────────────────────────────────── */
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

export interface Subscription {
  id: string;
  clientName: string;
  plan: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
}

/* ─── Clients Module ─────────────────────────────────────────── */
export type WorkAccountStatus = "active" | "inactive";
export type ClientSubscriptionStatus = "active" | "expired" | "cancelled";

/** A business entity owned by a PersonalClient */
export interface WorkAccount {
  id: string;
  name: string;
  industry: string;
  status: WorkAccountStatus;
  /** Foreign key → PersonalClient.id */
  ownerId: string;
  createdAt: string;
  employeesCount: number;
  productsCount: number;
}

/** A subscription purchase tied to a specific WorkAccount */
export interface ClientSubscription {
  id: string;
  /** Foreign key → WorkAccount.id */
  workAccountId: string;
  workAccountName: string;
  bundleType: string;
  startDate: string;
  endDate: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  status: ClientSubscriptionStatus;
}

/** A personal (individual) client who owns one or more WorkAccounts */
export interface PersonalClient {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  joinDate: string;
  avatarColor: string;
  avatarInitials: string;
  workAccounts: WorkAccount[];
  subscriptions: ClientSubscription[];
}

/* ─── Nav Item ───────────────────────────────────────────────── */
export interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
