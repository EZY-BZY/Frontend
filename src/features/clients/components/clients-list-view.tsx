"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/shared/FilterBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { listOwners, changeOwnerStatus } from "@/services/owners";
import { listCompanies } from "@/services/companies";
import type {
  CompanyOwnerAdminRead,
  CompanyRead,
  OwnerAccountStatus,
  CompanyServiceType,
  CompanyStatus,
} from "@/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

function avatarInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function ownerStatusColor(status: OwnerAccountStatus): string {
  switch (status) {
    case "active":               return "bg-emerald-50 text-emerald-700";
    case "pending_verification": return "bg-amber-50 text-amber-700";
    case "suspended":            return "bg-orange-50 text-orange-700";
    case "blocked":              return "bg-red-50 text-red-600";
    case "deleted":              return "bg-slate-100 text-slate-400";
  }
}

function serviceColor(service: CompanyServiceType): string {
  switch (service) {
    case "services":              return "bg-blue-50 text-blue-700";
    case "products":              return "bg-violet-50 text-violet-700";
    case "products_and_services": return "bg-teal-50 text-teal-700";
  }
}

function companyStatusColor(status: CompanyStatus): string {
  return status === "active"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-500";
}

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

const OWNER_STATUSES: OwnerAccountStatus[] = [
  "active",
  "pending_verification",
  "suspended",
  "blocked",
  "deleted",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientsListView() {
  const locale = useLocale();
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const tCompanies = useTranslations("companies");

  const [search, setSearch] = useState("");

  // ── Owners state ────────────────────────────────────────────────────────────
  const [owners, setOwners] = useState<CompanyOwnerAdminRead[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState<string | null>(null);

  // ── Companies state ─────────────────────────────────────────────────────────
  const [companies, setCompanies] = useState<CompanyRead[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // ── Owner sheet state ────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<CompanyOwnerAdminRead | null>(null);
  const [newStatus, setNewStatus] = useState<OwnerAccountStatus>("active");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  // ── Fetch data in parallel ───────────────────────────────────────────────────
  useEffect(() => {
    setOwnersLoading(true);
    listOwners()
      .then((res) => {
        if (res.Data) setOwners(res.Data);
        else setOwnersError(res.Message || "Failed to load owners");
      })
      .catch(() => setOwnersError("Network error — could not load owners."))
      .finally(() => setOwnersLoading(false));

    setCompaniesLoading(true);
    listCompanies()
      .then((res) => {
        if (res.Data) setCompanies(res.Data);
        else setCompaniesError(res.Message || "Failed to load companies");
      })
      .catch(() => setCompaniesError("Network error — could not load companies."))
      .finally(() => setCompaniesLoading(false));
  }, []);

  // ── Filtered data ────────────────────────────────────────────────────────────
  const filteredOwners = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return owners;
    return owners.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.email?.toLowerCase().includes(q)
    );
  }, [search, owners]);

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.company_name_en?.toLowerCase().includes(q) ||
        c.company_name_ar?.toLowerCase().includes(q)
    );
  }, [search, companies]);

  // ── Open owner sheet ──────────────────────────────────────────────────────────
  function openOwnerSheet(owner: CompanyOwnerAdminRead) {
    setSelectedOwner(owner);
    setNewStatus(owner.account_status);
    setStatusError("");
    setSheetOpen(true);
  }

  // ── Change owner status ───────────────────────────────────────────────────────
  async function handleChangeStatus() {
    if (!selectedOwner) return;
    setStatusSaving(true);
    setStatusError("");
    try {
      const res = await changeOwnerStatus(selectedOwner.id, {
        account_status: newStatus,
      });
      if (res.Data) {
        setOwners((prev) =>
          prev.map((o) => (o.id === res.Data!.id ? res.Data! : o))
        );
        setSelectedOwner(res.Data);
      } else {
        setStatusError(res.Message || "Failed to update status");
      }
    } catch {
      setStatusError("Network error — please try again.");
    } finally {
      setStatusSaving(false);
    }
  }

  const dateFormatter = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-GB",
      { day: "2-digit", month: "short", year: "numeric" }
    );

  // ── Skeleton rows ─────────────────────────────────────────────────────────────
  const SkeletonOwnerRows = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          {[160, 110, 70, 90, 80].map((w, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const SkeletonCompanyRows = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
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
      {/* ── Shared FilterBar ──────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
      />

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="owners">
        <TabsList>
          <TabsTrigger value="owners">
            <Users className="h-4 w-4" />
            {t("personalAccounts")}
            <span className="ms-1 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {filteredOwners.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="h-4 w-4" />
            {t("workAccounts")}
            <span className="ms-1 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {filteredCompanies.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Owners ────────────────────────────────────── */}
        <TabsContent value="owners">
          {ownersError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {ownersError}
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      t("col.client"),
                      t("col.phone"),
                      t("col.verified"),
                      t("col.joinedDate"),
                      t("col.status"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ownersLoading ? (
                    <SkeletonOwnerRows />
                  ) : filteredOwners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    filteredOwners.map((owner, i) => (
                      <motion.tr
                        key={owner.id}
                        {...rowAnim(i)}
                        onClick={() => openOwnerSheet(owner)}
                        className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 cursor-pointer transition-colors group"
                      >
                        {/* Name + avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold select-none"
                              style={{ backgroundColor: avatarColor(owner.id) }}
                            >
                              {avatarInitials(owner.name)}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-[#0A3D62] transition-colors leading-tight">
                                {owner.name}
                              </p>
                              {owner.email && (
                                <p className="text-xs text-slate-400 truncate max-w-36">
                                  {owner.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Phone */}
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap" dir="ltr">
                          {owner.phone}
                        </td>
                        {/* Verified */}
                        <td className="px-5 py-3.5">
                          {owner.is_verified_phone ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t("verifiedPhone")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                              <XCircle className="h-3.5 w-3.5" />
                              {t("notVerified")}
                            </span>
                          )}
                        </td>
                        {/* Join date */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                          {dateFormatter(owner.join_date)}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ownerStatusColor(owner.account_status)}`}
                          >
                            {t(`ownerStatus.${owner.account_status}`)}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
              {filteredOwners.length}{" "}
              {tCommon("of")}{" "}
              {owners.length}{" "}
              {t("personalAccounts").toLowerCase()}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Companies ──────────────────────────────────── */}
        <TabsContent value="companies">
          {companiesError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {companiesError}
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      t("col.company"),
                      t("col.service"),
                      t("col.status"),
                      tCompanies("col.balance"),
                      t("col.createdDate"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companiesLoading ? (
                    <SkeletonCompanyRows />
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company, i) => (
                      <motion.tr
                        key={company.id}
                        {...rowAnim(i)}
                        className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors"
                      >
                        {/* Company name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB] text-lg select-none">
                              🏢
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 leading-tight">
                                {company.company_name_en ?? company.company_name_ar}
                              </p>
                              <p className="text-xs text-slate-400" dir="rtl">
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
                            {tCompanies(`service.${company.service}`)}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${companyStatusColor(company.status)}`}
                          >
                            {tCompanies(`status.${company.status}`)}
                          </span>
                        </td>
                        {/* Balance */}
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {company.current_balance.toLocaleString()}
                        </td>
                        {/* Created */}
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
              {filteredCompanies.length}{" "}
              {tCommon("of")}{" "}
              {companies.length}{" "}
              {t("workAccounts").toLowerCase()}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Owner Detail Sheet ────────────────────────────────────── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(v) => {
          if (!v) { setSheetOpen(false); setStatusError(""); }
        }}
      >
        <SheetContent side="right" className="w-full max-w-md flex flex-col">
          {selectedOwner && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3 pe-8">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-base font-bold select-none"
                    style={{ backgroundColor: avatarColor(selectedOwner.id) }}
                  >
                    {avatarInitials(selectedOwner.name)}
                  </span>
                  <div>
                    <SheetTitle>{selectedOwner.name}</SheetTitle>
                    <SheetDescription>{t("viewDesc")}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <OwnerField label={t("col.phone")} value={selectedOwner.phone} mono dir="ltr" />
                  {selectedOwner.email && (
                    <OwnerField label={t("col.email")} value={selectedOwner.email} mono />
                  )}
                  <OwnerField label={t("col.joinedDate")} value={dateFormatter(selectedOwner.join_date)} />
                  <OwnerField
                    label={t("col.verified")}
                    value={
                      selectedOwner.is_verified_phone ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("verifiedPhone")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          {t("notVerified")}
                        </span>
                      )
                    }
                  />
                  <OwnerField
                    label={t("col.status")}
                    value={
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ownerStatusColor(selectedOwner.account_status)}`}>
                        {t(`ownerStatus.${selectedOwner.account_status}`)}
                      </span>
                    }
                  />
                </div>

                {/* Change status */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {t("changeStatus")}
                  </p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OwnerAccountStatus)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {OWNER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`ownerStatus.${s}`)}
                      </option>
                    ))}
                  </select>

                  {statusError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {statusError}
                    </div>
                  )}
                </div>
              </div>

              <SheetFooter className="px-6 py-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  className="flex-1"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={handleChangeStatus}
                  disabled={statusSaving || newStatus === selectedOwner.account_status}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {statusSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tCommon("saving")}
                    </span>
                  ) : (
                    tCommon("saveChanges")
                  )}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── OwnerField ───────────────────────────────────────────────────────────────

function OwnerField({
  label,
  value,
  mono = false,
  dir,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-slate-700 ${mono ? "font-mono" : "font-medium"}`} dir={dir}>
        {value}
      </p>
    </div>
  );
}
