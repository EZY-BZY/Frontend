"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { FilterBar } from "@/components/shared/FilterBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listCompanies } from "@/services/companies";
import { listCompanyBranches } from "@/services/branches";
import { listCompanyEmployees } from "@/services/company-employees";
import type {
  CompanyRead,
  CompanyBranchBeasyRead,
  CompanyEmployeeBeasyRead,
  CompanyServiceType,
  CompanyStatus,
  CompanyBranchType,
  CompanyEmployeeRole,
} from "@/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: CompanyStatus) {
  return status === "active"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-500";
}

function serviceColor(service: CompanyServiceType) {
  switch (service) {
    case "services":             return "bg-blue-50 text-blue-700";
    case "products":             return "bg-violet-50 text-violet-700";
    case "products_and_services": return "bg-teal-50 text-teal-700";
  }
}

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function CompaniesView() {
  const locale = useLocale();
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");

  // ── List state ──────────────────────────────────────────────────────────────
  const [companies, setCompanies] = useState<CompanyRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Sheet state ─────────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyRead | null>(null);

  // ── Lazy-loaded detail data ─────────────────────────────────────────────────
  const [branches, setBranches] = useState<CompanyBranchBeasyRead[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [employees, setEmployees] = useState<CompanyEmployeeBeasyRead[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // ── Fetch list ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    listCompanies()
      .then((res) => {
        if (res.Data) setCompanies(res.Data);
        else setFetchError(res.Message || "Failed to load companies");
      })
      .catch(() => setFetchError("Network error — could not load companies."))
      .finally(() => setLoading(false));
  }, []);

  // ── Open detail sheet ────────────────────────────────────────────────────────
  function openDetail(company: CompanyRead) {
    setSelected(company);
    setBranches([]);
    setEmployees([]);
    setSheetOpen(true);

    // Load branches + employees in parallel
    setBranchesLoading(true);
    listCompanyBranches({ company_id: company.id })
      .then((res) => { if (res.Data) setBranches(res.Data); })
      .finally(() => setBranchesLoading(false));

    setEmployeesLoading(true);
    listCompanyEmployees({ company_id: company.id })
      .then((res) => { if (res.Data) setEmployees(res.Data); })
      .finally(() => setEmployeesLoading(false));
  }

  // ── Client-side search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.company_name_en?.toLowerCase().includes(q) ||
        c.company_name_ar?.toLowerCase().includes(q)
    );
  }, [search, companies]);

  const dateFormatter = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-GB",
      { day: "2-digit", month: "short", year: "numeric" }
    );

  // ── Skeleton rows ─────────────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          {[180, 100, 70, 90, 80].map((w, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
      />

      {/* ── Error banner ────────────────────────────────────────────── */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* ── Table card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong>{" "}
            {t("companyCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["company", "service", "status", "balance", "added"] as const).map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {t(`col.${h}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                    {t("noCompanies")}
                  </td>
                </tr>
              ) : (
                filtered.map((company, i) => (
                  <motion.tr
                    key={company.id}
                    {...rowAnim(i)}
                    onClick={() => openDetail(company)}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors cursor-pointer"
                  >
                    {/* Company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB] text-xl select-none">
                          🏢
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {company.company_name_en ?? company.company_name_ar}
                          </p>
                          <p
                            className="text-xs text-slate-400"
                            dir="rtl"
                          >
                            {company.company_name_ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Service */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${serviceColor(company.service)}`}
                      >
                        {t(`service.${company.service}`)}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(company.status)}`}
                      >
                        {t(`status.${company.status}`)}
                      </span>
                    </td>
                    {/* Balance */}
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                      {company.current_balance.toLocaleString()}
                    </td>
                    {/* Added */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {dateFormatter(company.created_at)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {companies.length} {t("companyCountLabel")}
        </div>
      </div>

      {/* ── Detail Sheet ──────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xl flex flex-col p-0">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB] text-2xl select-none">
                    🏢
                  </div>
                  <div>
                    <SheetTitle className="text-base leading-tight">
                      {selected.company_name_en ?? selected.company_name_ar}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                      {t("viewDesc")}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="mx-6 mt-4 w-auto justify-start rounded-xl bg-slate-100 p-1">
                  <TabsTrigger value="overview" className="rounded-lg text-xs px-4">
                    {t("tabs.overview")}
                  </TabsTrigger>
                  <TabsTrigger value="branches" className="rounded-lg text-xs px-4">
                    {t("tabs.branches")}
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="rounded-lg text-xs px-4">
                    {t("tabs.employees")}
                  </TabsTrigger>
                </TabsList>

                {/* ── Overview tab ─────────────────────────────────── */}
                <TabsContent value="overview" className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label={t("overview.nameEn")} value={selected.company_name_en ?? "—"} />
                    <DetailField label={t("overview.nameAr")} value={selected.company_name_ar} rtl />
                    <DetailField label={t("overview.descAr")} value={selected.company_description_ar} rtl />
                    {selected.company_description_en && (
                      <DetailField label={t("overview.descEn")} value={selected.company_description_en} />
                    )}
                    <DetailField
                      label={t("overview.service")}
                      value={
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${serviceColor(selected.service)}`}>
                          {t(`service.${selected.service}`)}
                        </span>
                      }
                    />
                    <DetailField
                      label={t("overview.status")}
                      value={
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(selected.status)}`}>
                          {t(`status.${selected.status}`)}
                        </span>
                      }
                    />
                    <DetailField
                      label={t("overview.balance")}
                      value={selected.current_balance.toLocaleString()}
                      mono
                    />
                    <DetailField
                      label={t("overview.taxNumber")}
                      value={selected.tax_number ?? "—"}
                      mono
                    />
                    <DetailField
                      label={t("overview.ownerId")}
                      value={selected.owner_id.slice(0, 16) + "…"}
                      mono
                    />
                    <DetailField
                      label={t("overview.showBranches")}
                      value={selected.show_branches ? tCommon("yes") : tCommon("no")}
                    />
                    <DetailField
                      label={t("overview.showProducts")}
                      value={selected.show_products ? tCommon("yes") : tCommon("no")}
                    />
                    <DetailField
                      label={t("overview.showSocial")}
                      value={selected.show_social_media ? tCommon("yes") : tCommon("no")}
                    />
                    <DetailField
                      label={t("overview.showContact")}
                      value={selected.show_contact_info ? tCommon("yes") : tCommon("no")}
                    />
                  </div>
                </TabsContent>

                {/* ── Branches tab ─────────────────────────────────── */}
                <TabsContent value="branches" className="flex-1 overflow-y-auto px-6 py-4">
                  {branchesLoading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin me-2" />
                      {tCommon("loading")}
                    </div>
                  ) : branches.length === 0 ? (
                    <p className="text-center text-slate-400 py-12 text-sm">{t("noBranches")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {(["name", "type", "location", "active"] as const).map((h) => (
                              <th
                                key={h}
                                className="pb-2 text-start font-semibold text-slate-500 uppercase tracking-wide"
                              >
                                {t(`branchCol.${h}`)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map((branch) => (
                            <tr
                              key={branch.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-2.5 pe-3 font-medium text-slate-700">
                                {branch.branch_name}
                              </td>
                              <td className="py-2.5 pe-3">
                                <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">
                                  {t(`branchType.${branch.branch_type as CompanyBranchType}`)}
                                </span>
                              </td>
                              <td className="py-2.5 pe-3 text-slate-400">
                                {branch.branch_location_description ?? "—"}
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`rounded-full px-2 py-0.5 font-medium ${
                                    branch.is_active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {branch.is_active ? tCommon("yes") : tCommon("no")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* ── Employees tab ─────────────────────────────────── */}
                <TabsContent value="employees" className="flex-1 overflow-y-auto px-6 py-4">
                  {employeesLoading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin me-2" />
                      {tCommon("loading")}
                    </div>
                  ) : employees.length === 0 ? (
                    <p className="text-center text-slate-400 py-12 text-sm">{t("noEmployees")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {(["name", "role", "department", "active", "permissions"] as const).map((h) => (
                              <th
                                key={h}
                                className="pb-2 text-start font-semibold text-slate-500 uppercase tracking-wide"
                              >
                                {t(`employeeCol.${h}`)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((emp) => (
                            <tr
                              key={emp.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-2.5 pe-3">
                                <p className="font-medium text-slate-700">{emp.name}</p>
                                {emp.email && (
                                  <p className="text-slate-400 truncate max-w-28">{emp.email}</p>
                                )}
                              </td>
                              <td className="py-2.5 pe-3">
                                <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2 py-0.5 font-medium">
                                  {t(`role.${emp.role as CompanyEmployeeRole}`)}
                                </span>
                              </td>
                              <td className="py-2.5 pe-3 text-slate-400">
                                {emp.department ?? "—"}
                              </td>
                              <td className="py-2.5 pe-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 font-medium ${
                                    emp.is_active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {emp.is_active ? tCommon("yes") : tCommon("no")}
                                </span>
                              </td>
                              <td className="py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {emp.app_permissions
                                    .filter((p) => p.is_active)
                                    .map((p) => (
                                      <span
                                        key={p.id}
                                        className="rounded bg-violet-50 text-violet-700 px-1.5 py-0.5 text-[10px] font-medium"
                                        title={p.app_permission.permission_label}
                                      >
                                        {p.app_permission.permission_key}
                                      </span>
                                    ))}
                                  {emp.app_permissions.filter((p) => p.is_active).length === 0 && (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── DetailField ──────────────────────────────────────────────────────────────

function DetailField({
  label,
  value,
  mono = false,
  rtl = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  rtl?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p
        className={`text-sm text-slate-700 ${mono ? "font-mono" : "font-medium"}`}
        dir={rtl ? "rtl" : undefined}
      >
        {value}
      </p>
    </div>
  );
}
