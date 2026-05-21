// ─── Shared wrappers ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status_code: number;
  Message: string;
  details?: string;
  Data: T | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface MessageResponse {
  message: string;
  detail?: string | null;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AccountStatus = "active" | "inactive" | "suspended" | "blocked";

export type AccountType = "super_user" | "admin" | "member";

export type OwnerAccountStatus =
  | "active"
  | "pending_verification"
  | "suspended"
  | "blocked"
  | "deleted";

export type BankWalletType = "bank" | "wallet" | "app";

export type CompanyBranchType =
  | "factory"
  | "warehouse"
  | "showroom"
  | "office";

export type CompanyServiceType =
  | "services"
  | "products"
  | "products_and_services";

export type CompanyStatus = "active" | "inactive";

export type TermType =
  | "privacy_policy"
  | "terms_of_use"
  | "refund_terms"
  | "delivery_terms";

export type HistoryAction = "created" | "updated" | "deleted";

export type Weekday =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

// ─── Authentication ───────────────────────────────────────────────────────────

export interface DashboardLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Employees ────────────────────────────────────────────────────────────────

export interface BEasyEmployeeRead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  account_type: string;
  account_status: string;
  created_at: string;
  updated_at: string;
  created_by_id: string | null;
  updated_by_id: string | null;
}

export interface BEasySuperUserCreate {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface BEasyMemberCreate {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  account_type?: AccountType;
  account_status?: AccountStatus;
}

export interface BEasyMemberUpdate {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  account_type?: AccountType | null;
  account_status?: AccountStatus | null;
}

export interface ListEmployeesParams {
  account_status?: AccountStatus | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  page?: number;
  page_size?: number;
}

// ─── Media Uploads ────────────────────────────────────────────────────────────

export interface MediaUploadResponse {
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: "image" | "video" | "file";
  file_size: number;
}

export interface MediaBatchItemResponse {
  original_filename?: string | null;
  success: boolean;
  detail?: MediaUploadResponse | null;
  error?: string | null;
}

// ─── Countries ────────────────────────────────────────────────────────────────

export interface CountryCreate {
  phone_code: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  phone_regex: string;
  currency_shortcut_en: string;
  currency_shortcut_ar: string;
  currency_shortcut_fr: string;
  currency_name_en: string;
  currency_name_ar: string;
  currency_name_fr: string;
  flag_emoji: string;
}

export interface CountryUpdate {
  phone_code?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  phone_regex?: string | null;
  currency_shortcut_en?: string | null;
  currency_shortcut_ar?: string | null;
  currency_shortcut_fr?: string | null;
  currency_name_en?: string | null;
  currency_name_ar?: string | null;
  currency_name_fr?: string | null;
  flag_emoji?: string | null;
}

export interface CountryRead {
  id: string;
  phone_code: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  phone_regex: string;
  currency_shortcut_en: string;
  currency_shortcut_ar: string;
  currency_shortcut_fr: string;
  currency_name_en: string;
  currency_name_ar: string;
  currency_name_fr: string;
  flag_emoji: string;
  created_date: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

// ─── Industries ───────────────────────────────────────────────────────────────

export interface IndustryCreate {
  name_en: string;
  name_ar: string;
  name_fr: string;
  image: string;
}

export interface IndustryUpdate {
  name_en?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  image?: string | null;
}

export interface IndustryPublicRead {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  image: string;
}

export interface ListIndustriesParams {
  page?: number;
  page_size?: number;
}

export interface IndustryRead {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  image: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

// ─── App Permissions ──────────────────────────────────────────────────────────

export interface AppPermissionCreate {
  permission_tag: string;
  permission_label: string;
  permission_key: string;
  description?: string | null;
  is_active?: boolean;
}

export interface AppPermissionUpdate {
  permission_tag?: string | null;
  permission_label?: string | null;
  permission_key?: string | null;
  description?: string | null;
  is_active?: boolean | null;
}

export interface AppPermissionRead {
  id: string;
  permission_tag: string;
  permission_label: string;
  permission_key: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppPermissionHistoryRead {
  id: string;
  app_permission_id: string | null;
  permission_key: string;
  action: string;
  performed_by: string | null;
  performed_at: string;
  snapshot: Record<string, unknown>;
}

// ─── Terms ────────────────────────────────────────────────────────────────────

export interface TermCreate {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  type: TermType;
  order?: number | null;
}

export interface TermUpdate {
  name_en?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  description_fr?: string | null;
  order?: number | null;
}

export interface TermRead {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  type: TermType;
  order: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TermSnapshotItem {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  type: TermType;
  order: number;
  is_changed: boolean;
}

export interface TermHistoryVersionRead {
  version_date: string;
  action_type: HistoryAction;
  performed_by: string | null;
  changed_term_id: string;
  terms_snapshot: TermSnapshotItem[];
}

export interface TermHistoryDayGroupRead {
  day: string;
  versions: TermHistoryVersionRead[];
}

export interface ListTermHistoryParams {
  page?: number;
  page_size?: number;
}

export interface TermPublicRead {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  type: TermType;
  order: number;
}

// ─── Owners ───────────────────────────────────────────────────────────────────

export interface CompanyOwnerAdminRead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  last_accepted_terms_date: string | null;
  is_verified_phone: boolean;
  join_date: string;
  account_status: OwnerAccountStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface OwnerStatusUpdateRequest {
  account_status: OwnerAccountStatus;
}

export interface ListOwnersParams {
  account_status?: OwnerAccountStatus | null;
  is_verified_phone?: boolean | null;
  join_date_from?: string | null;
  join_date_to?: string | null;
}

// ─── Companies ────────────────────────────────────────────────────────────────

export interface CompanyRead {
  id: string;
  owner_id: string;
  company_name_ar: string;
  company_name_en: string | null;
  company_description_ar: string;
  company_description_en: string | null;
  show_branches: boolean;
  show_products: boolean;
  show_social_media: boolean;
  show_contact_info: boolean;
  status: CompanyStatus;
  image: string | null;
  service: CompanyServiceType;
  current_balance: number;
  tax_number: string | null;
  industry_ids: string[];
  created_at: string;
  updated_at: string;
}

// ─── Banks & Wallets ──────────────────────────────────────────────────────────

export interface BankAndWalletCreate {
  name_ar: string;
  name_en: string;
  image: string;
  country_id: string;
  kind: BankWalletType;
}

export interface BankAndWalletUpdate {
  name_ar?: string | null;
  name_en?: string | null;
  image?: string | null;
  country_id?: string | null;
  kind?: BankWalletType | null;
  is_active?: boolean | null;
}

export interface BankAndWalletRead {
  id: string;
  name_ar: string;
  name_en: string;
  image: string;
  country_id: string;
  kind: BankWalletType;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListBanksWalletsParams {
  kind?: BankWalletType | null;
  is_active?: boolean | null;
}

// ─── Company Branches (Beasy read-only) ───────────────────────────────────────

export interface CompanyBranchContactRead {
  id: string;
  branch_id: string;
  contact_name: string;
  phone_number: string;
  is_primary: boolean;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyBranchWorkingHoursRead {
  id: string;
  branch_id: string;
  day_of_week: Weekday;
  is_day_off: boolean;
  opening_time: string | null;
  closing_time: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyBranchBeasyRead {
  id: string;
  company_id: string;
  branch_name: string;
  branch_location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  branch_type: CompanyBranchType;
  is_active: boolean;
  is_visible_to_clients: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  contacts: CompanyBranchContactRead[];
  working_hours: CompanyBranchWorkingHoursRead[];
}

export interface ListBranchesParams {
  company_id?: string | null;
  branch_type?: CompanyBranchType | null;
  is_active?: boolean | null;
}

// ─── Company Employees (Beasy read-only) ──────────────────────────────────────

export type CompanyEmployeeRole =
  | "admin"
  | "employee"
  | "inventory_manager"
  | "finance";

export type CompanySalarySystem = "monthly" | "weekly" | "yearly" | "daily";

export interface CompanyEmployeePhoneRead {
  id: string;
  employee_id: string;
  phone_number: string;
  is_primary: boolean;
  is_active: boolean;
  created_by_type: string;
  created_by_id: string | null;
  updated_by_type: string;
  updated_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppPermissionNestedRead {
  id: string;
  permission_tag: string;
  permission_label: string;
  permission_key: string;
  is_active: boolean;
}

export interface EmployeeAppPermissionRead {
  id: string;
  employee_id: string;
  app_permission_id: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by_type: string;
  assigned_by_id: string | null;
  updated_at: string;
  updated_by_type: string;
  updated_by_id: string | null;
  app_permission: AppPermissionNestedRead;
}

export interface CompanyEmployeeBeasyRead {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  salary: number | null;
  bonus_amount: number;
  salary_system: CompanySalarySystem | null;
  department: string | null;
  role: CompanyEmployeeRole;
  is_active: boolean;
  created_by_type: string;
  created_by_id: string | null;
  updated_by_type: string;
  updated_by_id: string | null;
  created_at: string;
  updated_at: string;
  phones: CompanyEmployeePhoneRead[];
  app_permissions: EmployeeAppPermissionRead[];
}

export interface ListCompanyEmployeesParams {
  company_id?: string | null;
  role?: CompanyEmployeeRole | null;
  department?: string | null;
  is_active?: boolean | null;
}

// ─── Bundles ──────────────────────────────────────────────────────────────────

export type BundleType = "monthly" | "yearly";
export type BundleStatus = "active" | "history";

export interface BundleAbilitiesCreate {
  number_of_products: number;
  number_of_branches: number;
  number_of_employees: number;
  number_of_financial_accounts: number;
}

export type BundleAbilitiesRead = BundleAbilitiesCreate;

export interface BundleCreate {
  name_ar: string;
  name_other_lang: string;
  type: BundleType;
  price: number;
  currency_id: string;
  country_ids: string[];
  abilities: BundleAbilitiesCreate;
}

export interface BundleRead {
  id: string;
  name_ar: string;
  name_other_lang: string;
  type: BundleType;
  price: number;
  currency_id: string;
  country_ids: string[];
  abilities: BundleAbilitiesRead;
  status: BundleStatus;
  created_at: string;
  updated_at: string;
}

export interface ListBundlesParams {
  type?: BundleType | null;
  status?: BundleStatus | null;
  country_id?: string | null;
  page?: number;
  page_size?: number;
}

// ─── Contact Requests ─────────────────────────────────────────────────────────

export type ContactRequestApiStatus = "new" | "seen" | "solved";

export type ContactRequestType =
  | "contact_request"
  | "report_issue"
  | "suggestion"
  | "other";

export interface ContactRequestLandingCreate {
  request_type: ContactRequestType;
  requester_name: string;
  company_name?: string | null;
  business_category?: string | null;
  message?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ContactRequestRead {
  id: string;
  requester_name: string;
  phone: string;
  company_name: string | null;
  request_type: string | null;
  message: string | null;
  status: ContactRequestApiStatus;
  created_at: string;
}

export interface ListContactRequestsParams {
  status?: ContactRequestApiStatus | null;
  request_type?: string | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoryPublicRead {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string | null;
  description_ar: string | null;
  description_fr: string | null;
  image: string | null;
  is_active: boolean;
  is_global: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name_en: string;
  name_ar: string;
  name_fr?: string;
  description_en?: string;
  description_ar?: string;
  description_fr?: string;
  company_id?: string;
  image?: File;
}

export interface CategoryUpdate {
  name_en?: string | null;
  name_ar?: string | null;
  name_fr?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  description_fr?: string | null;
  image?: string | null;
  is_active?: boolean | null;
}

export interface ListCategoriesParams {
  company_id?: string | null;
  is_active?: boolean | null;
  is_global?: boolean | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}
