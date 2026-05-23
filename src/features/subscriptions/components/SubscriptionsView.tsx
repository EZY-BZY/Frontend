"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CreditCard,
  Building2,
  Package,
  CalendarDays,
  Hash,
  BadgeCheck,
  XCircle,
  X,
} from "lucide-react";
import { FilterBar } from "@/components/shared/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { listSubscriptions, getSubscription } from "@/services/subscriptions";
import type {
  SubscriptionRead,
  SubscriptionDetailRead,
  SubscriptionPaymentMethod,
} from "@/types/api";

/* ─── Constants ──────────────────────────────────────────────────── */

export const SUBSCRIPTIONS_QUERY_KEY = ["subscriptions"] as const;

const PAGE_SIZE = 10;

const PAYMENT_METHODS: SubscriptionPaymentMethod[] = ["paymob", "paytabs", "bank"];

/* ─── Animation helpers ──────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.035, duration: 0.2, ease: EASE },
});

/* ─── Helpers ────────────────────────────────────────────────────── */

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(
    locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric" }
  );
}

function companyName(
  company: SubscriptionRead["company"],
  locale: string
): string {
  return (locale === "ar" ? company.company_name_ar : company.company_name_en)
    ?? company.company_name_ar;
}

function bundleName(
  bundle: SubscriptionRead["bundle"],
  locale: string
): string {
  if (locale === "ar") return bundle.name_ar;
  if (locale === "fr") return bundle.name_fr;
  return bundle.name_en;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── Badge components ───────────────────────────────────────────── */

const PAYMENT_COLORS: Record<SubscriptionPaymentMethod, string> = {
  paymob:  "bg-violet-50 text-violet-700 border-violet-100",
  paytabs: "bg-sky-50    text-sky-700    border-sky-100",
  bank:    "bg-amber-50  text-amber-700  border-amber-100",
};

function PaymentBadge({
  method,
  label,
}: {
  method: SubscriptionPaymentMethod;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_COLORS[method]}`}
    >
      <CreditCard className="h-3 w-3" />
      {label}
    </span>
  );
}

function ActiveBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      {inactiveLabel}
    </span>
  );
}

/* ─── Date input ─────────────────────────────────────────────────── */

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-slate-500">{label}</Label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#28B8B1]/50 focus:border-[#28B8B1]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-y-0 end-2 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton rows ──────────────────────────────────────────────── */

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-b border-slate-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className="h-4 rounded-lg bg-slate-100 animate-pulse"
                style={{ width: j === 0 ? "60%" : j === cols - 1 ? "40%" : "75%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Detail Sheet ───────────────────────────────────────────────── */

function SubscriptionDetailSheet({
  subscriptionId,
  open,
  onOpenChange,
}: {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("subscriptions");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { data: sub, isFetching, isError } = useQuery<SubscriptionDetailRead>({
    queryKey: [...SUBSCRIPTIONS_QUERY_KEY, "detail", subscriptionId],
    queryFn: async () => {
      const res = await getSubscription(subscriptionId!);
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    enabled: open && !!subscriptionId,
    staleTime: 30_000,
  });

  const compName = sub ? companyName(sub.company, locale) : "";
  const bndName  = sub ? bundleName(sub.bundle, locale) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#0A3D62]">
            <CreditCard className="h-4 w-4" />
            {t("detail.title")}
          </SheetTitle>
          <SheetDescription>{t("detail.desc")}</SheetDescription>
        </SheetHeader>

        {/* ── Loading state ── */}
        {isFetching && !sub && (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#28B8B1]" />
          </div>
        )}

        {/* ── Error state ── */}
        {isError && !sub && (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-red-500">
            <XCircle className="h-8 w-8" />
            <p className="text-sm">{tCommon("error")}</p>
          </div>
        )}

        {/* ── Content ── */}
        {sub && (
          <div className="px-6 py-6 space-y-5">
            {/* Status + dates row */}
            <div className="flex items-center justify-between">
              <ActiveBadge
                active={sub.is_active}
                activeLabel={t("statuses.active")}
                inactiveLabel={t("statuses.inactive")}
              />
              {sub.payment_method && (
                <PaymentBadge
                  method={sub.payment_method}
                  label={t(`paymentMethods.${sub.payment_method}` as Parameters<typeof t>[0])}
                />
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {t("detail.subscriptionDate")}
                </p>
                <p className="font-mono text-sm text-slate-700">
                  {fmtDate(sub.subscription_date, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {t("detail.expiryDate")}
                </p>
                <p className="font-mono text-sm text-slate-700">
                  {fmtDate(sub.expiry_date, locale)}
                </p>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Hash className="h-3 w-3" />
                {t("detail.transactionId")}
              </p>
              {sub.transaction_id ? (
                <p className="break-all font-mono text-sm text-slate-700">
                  {sub.transaction_id}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">{t("detail.noTransaction")}</p>
              )}
            </div>

            <Separator />

            {/* Bundle card */}
            <div className="rounded-xl border border-slate-100 p-4 space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A3D62]">
                <Package className="h-3.5 w-3.5" />
                {t("detail.bundleSection")}
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">
                    {t("col.bundle")}
                  </p>
                  <p className="font-semibold text-slate-800">{bndName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">
                      {t("detail.bundleType")}
                    </p>
                    <span className="rounded-full bg-[#EBF3FB] px-2.5 py-0.5 text-xs font-semibold text-[#0A3D62]">
                      {t(`bundleTypes.${sub.bundle.type}` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">
                      {t("detail.bundlePrice")}
                    </p>
                    <p className="font-mono font-semibold text-slate-700">
                      {sub.bundle.price}
                      {sub.bundle.currency && (
                        <span className="ms-1 text-xs text-slate-400">
                          {locale === "ar"
                            ? sub.bundle.currency.shortcut_ar
                            : locale === "fr"
                            ? sub.bundle.currency.shortcut_fr
                            : sub.bundle.currency.shortcut_en}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company card */}
            <div className="rounded-xl border border-slate-100 p-4 space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A3D62]">
                <Building2 className="h-3.5 w-3.5" />
                {t("detail.companySection")}
              </p>
              <div className="flex items-center gap-3">
                {sub.company.image ? (
                  <img
                    src={sub.company.image}
                    alt={compName}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-100"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB] text-[#0A3D62] text-sm font-bold select-none">
                    {initials(compName)}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{compName}</p>
                  <p className="text-xs text-slate-400">
                    {t(`serviceTypes.${sub.company.service}` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <SheetFooter className="px-6 py-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {tCommon("close")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */

export function SubscriptionsView() {
  const t = useTranslations("subscriptions");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  /* ── Filter state ── */
  const [transactionId, setTransactionId] = useState("");
  const [companyId,     setCompanyId]     = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [activeFilter,  setActiveFilter]  = useState<string>("all");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [page,          setPage]          = useState(1);

  /* ── Detail sheet ── */
  const [viewId,     setViewId]     = useState<string | null>(null);
  const [sheetOpen,  setSheetOpen]  = useState(false);

  const openDetail = useCallback((id: string) => {
    setViewId(id);
    setSheetOpen(true);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  /* ── Query ── */
  const { data, isFetching, isError } = useQuery({
    queryKey: [
      ...SUBSCRIPTIONS_QUERY_KEY,
      { transactionId, companyId, paymentMethod, activeFilter, dateFrom, dateTo, page },
    ],
    queryFn: async () => {
      const res = await listSubscriptions({
        transaction_id:        transactionId  || null,
        company_id:            companyId      || null,
        payment_method:        paymentMethod  !== "all" ? (paymentMethod as SubscriptionPaymentMethod) : null,
        is_active:             activeFilter   !== "all" ? activeFilter === "active" : null,
        subscription_date_from: dateFrom      || null,
        subscription_date_to:   dateTo        || null,
        page,
        page_size: PAGE_SIZE,
      });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    placeholderData: (prev) => prev,
  });

  const subscriptions = data?.items ?? [];
  const totalPages    = data?.pages  ?? 1;
  const total         = data?.total  ?? 0;

  /* ── Column count (for skeletons / colspan) ── */
  const COL_COUNT = 8;

  /* ── Derived helpers ── */
  const fmt = (d: string) => fmtDate(d, locale);

  /* ── Filter bar extras ── */
  const filters = (
    <>
      {/* Active status */}
      <Select
        value={activeFilter}
        onValueChange={(v) => { setActiveFilter(v); resetPage(); }}
      >
        <SelectTrigger className="h-10 w-36">
          <SelectValue placeholder={t("statuses.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("statuses.all")}</SelectItem>
          <SelectItem value="active">{t("statuses.active")}</SelectItem>
          <SelectItem value="inactive">{t("statuses.inactive")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment method */}
      <Select
        value={paymentMethod}
        onValueChange={(v) => { setPaymentMethod(v); resetPage(); }}
      >
        <SelectTrigger className="h-10 w-36">
          <SelectValue placeholder={t("filters.allMethods")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allMethods")}</SelectItem>
          {PAYMENT_METHODS.map((m) => (
            <SelectItem key={m} value={m}>
              {t(`paymentMethods.${m}` as Parameters<typeof t>[0])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Company ID text filter */}
      <div className="relative">
        <Input
          value={companyId}
          onChange={(e) => { setCompanyId(e.target.value); resetPage(); }}
          placeholder={t("filters.companyIdPlaceholder")}
          className="h-10 w-44 border-slate-200 text-sm focus-visible:ring-[#28B8B1]"
        />
        {companyId && (
          <button
            type="button"
            onClick={() => { setCompanyId(""); resetPage(); }}
            className="absolute inset-y-0 end-2 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Date range */}
      <DateInput
        label={t("filters.dateFrom")}
        value={dateFrom}
        onChange={(v) => { setDateFrom(v); resetPage(); }}
      />
      <DateInput
        label={t("filters.dateTo")}
        value={dateTo}
        onChange={(v) => { setDateTo(v); resetPage(); }}
      />
    </>
  );

  /* ───────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <FilterBar
        search={transactionId}
        onSearchChange={(v) => { setTransactionId(v); resetPage(); }}
        searchPlaceholder={t("searchPlaceholder")}
        filters={filters}
      />

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Results header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            {isFetching ? (
              <Loader2 className="inline h-3 w-3 animate-spin" />
            ) : (
              <>
                <strong className="text-slate-700">{total}</strong>{" "}
                {t("totalSubscriptions")}
              </>
            )}
          </span>
          {isFetching && data && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#28B8B1]" />
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(
                  [
                    "company",
                    "bundle",
                    "transactionId",
                    "paymentMethod",
                    "subscriptionDate",
                    "expiryDate",
                    "status",
                    "actions",
                  ] as const
                ).map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {t(`col.${col}` as Parameters<typeof t>[0])}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* ── Error ── */}
              {isError && (
                <tr>
                  <td colSpan={COL_COUNT} className="h-32 text-center text-sm text-red-400">
                    {tCommon("error")}
                  </td>
                </tr>
              )}

              {/* ── First-load skeletons ── */}
              {isFetching && subscriptions.length === 0 && !isError && (
                <SkeletonRows cols={COL_COUNT} />
              )}

              {/* ── Empty ── */}
              {!isFetching && !isError && subscriptions.length === 0 && (
                <tr>
                  <td colSpan={COL_COUNT} className="h-32 text-center text-sm text-slate-400">
                    {t("noSubscriptions")}
                  </td>
                </tr>
              )}

              {/* ── Data rows ── */}
              {subscriptions.map((sub, i) => {
                const cName = companyName(sub.company, locale);
                const bName = bundleName(sub.bundle, locale);
                return (
                  <motion.tr
                    key={sub.id}
                    {...rowAnim(i)}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetail(sub.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail(sub.id);
                      }
                    }}
                    className="cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-[#EBF3FB]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#28B8B1]/40"
                  >
                    {/* Company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {sub.company.image ? (
                          <img
                            src={sub.company.image}
                            alt={cName}
                            className="h-7 w-7 shrink-0 rounded-lg object-cover border border-slate-100"
                          />
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB] text-[#0A3D62] text-[10px] font-bold select-none">
                            {initials(cName)}
                          </span>
                        )}
                        <span className="font-medium text-slate-800">{cName}</span>
                      </div>
                    </td>

                    {/* Bundle */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-700">{bName}</span>
                        <span className="rounded-full bg-[#EBF3FB] px-2 py-0.5 text-[10px] font-semibold text-[#0A3D62] w-fit">
                          {t(`bundleTypes.${sub.bundle.type}` as Parameters<typeof t>[0])}
                        </span>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="px-5 py-3.5">
                      {sub.transaction_id ? (
                        <span className="font-mono text-xs text-slate-500 truncate block max-w-[140px]" title={sub.transaction_id}>
                          {sub.transaction_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Payment method */}
                    <td className="px-5 py-3.5">
                      {sub.payment_method ? (
                        <PaymentBadge
                          method={sub.payment_method}
                          label={t(`paymentMethods.${sub.payment_method}` as Parameters<typeof t>[0])}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Subscription date */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500" dir="ltr">
                      {fmt(sub.subscription_date)}
                    </td>

                    {/* Expiry date */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500" dir="ltr">
                      {fmt(sub.expiry_date)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <ActiveBadge
                        active={sub.is_active}
                        activeLabel={t("statuses.active")}
                        inactiveLabel={t("statuses.inactive")}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openDetail(sub.id); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-[#28B8B1] hover:text-[#28B8B1] transition-colors"
                        title={t("detail.title")}
                        aria-label={t("detail.title")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 rounded-b-2xl bg-[#0A3D62] px-5 py-2.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={tCommon("previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <motion.button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  whileTap={{ scale: 0.9 }}
                  className={`h-7 min-w-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                    pageNum === page
                      ? "bg-white text-[#0A3D62]"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={tCommon("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detail sheet */}
      <SubscriptionDetailSheet
        subscriptionId={viewId}
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setViewId(null);
        }}
      />
    </div>
  );
}
