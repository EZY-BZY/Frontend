"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, Archive, Eye, XCircle, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight, CheckCircle2,
  Globe, Zap, Star, Calendar, User,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { listBundles, createBundle, moveBundleToHistory } from "@/services/bundles";
import { listCountries } from "@/services/countries";
import type {
  BundleAbilitiesCreate, BundleRead, BundleType, CountryRead,
} from "@/types/api";

/* ─── Query keys ─────────────────────────────────────────────────── */
export const BUNDLES_QUERY_KEY = ["bundles"] as const;

const PAGE_SIZE = 10;

/* ─── Animation helpers ──────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.2, ease: EASE },
});

const tabPane = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.18, ease: EASE },
};

/* ─── Toast ──────────────────────────────────────────────────────── */
type ToastItem = { id: number; type: "success" | "error"; message: string };

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 inset-e-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "border-emerald-100 bg-white text-emerald-700"
                : "border-red-100 bg-white text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Countries column cell ──────────────────────────────────────── */
function CountryTags({
  countries,
  locale,
  max = 3,
}: {
  countries: BundleRead["countries"];
  locale: string;
  max?: number;
}) {
  const visible = countries.slice(0, max);
  const extra = countries.length - max;
  if (countries.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 leading-snug"
        >
          <span>{c.flag_emoji}</span>
          {locale === "ar" ? c.name_ar : locale === "fr" ? c.name_fr : c.name_en}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full bg-[#EBF3FB] px-2 py-0.5 text-[11px] font-semibold text-[#0A3D62] leading-snug">
          +{extra}
        </span>
      )}
    </div>
  );
}

/* ─── Skeleton rows ──────────────────────────────────────────────── */
function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-b border-slate-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-4 rounded bg-slate-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Detail row helper (used inside View Details sheet) ─────────── */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-medium text-slate-800">{children}</div>
    </div>
  );
}

/* ─── Shared textarea style ──────────────────────────────────────── */
const textareaClass =
  "flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none";

/* ══════════════════════════════════════════════════════════════════ */
export function BundlesView() {
  const locale = useLocale();
  const t = useTranslations("bundles");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  /* ── Sheet states ────────────────────────────────────────────── */
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<BundleRead | null>(null);
  const [viewTarget, setViewTarget] = useState<BundleRead | null>(null);

  /* ── Toast ───────────────────────────────────────────────────── */
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ── Countries for create-form multi-select ─────────────────── */
  const { data: countriesData } = useQuery({
    queryKey: ["countries-list"],
    queryFn: async () => {
      const res = await listCountries({ page: 1, page_size: 100 });
      return res.Data?.items ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const countryOptions = useMemo(
    () =>
      (countriesData ?? []).map((c) => ({
        value: c.id,
        label: locale === "ar" ? c.name_ar : locale === "fr" ? c.name_fr : c.name_en,
        flag: c.flag_emoji,
      })),
    [countriesData, locale]
  );

  const currencyOptions = useMemo(
    () =>
      (countriesData ?? []).map((c: CountryRead) => {
        const name = locale === "ar" ? c.name_ar : locale === "fr" ? c.name_fr : c.name_en;
        const code =
          locale === "ar" ? c.currency_shortcut_ar
          : locale === "fr" ? c.currency_shortcut_fr
          : c.currency_shortcut_en;
        return { value: c.id, label: `${c.flag_emoji} ${code} — ${name}` };
      }),
    [countriesData, locale]
  );

  /* ── Active bundles query ────────────────────────────────────── */
  const activeQuery = useQuery({
    queryKey: [...BUNDLES_QUERY_KEY, "active", activePage],
    queryFn: async () => {
      const res = await listBundles({ status: "active", page: activePage, page_size: PAGE_SIZE });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    placeholderData: (prev) => prev,
  });

  /* ── History bundles query ───────────────────────────────────── */
  const historyQuery = useQuery({
    queryKey: [...BUNDLES_QUERY_KEY, "history", historyPage],
    queryFn: async () => {
      const res = await listBundles({ status: "history", page: historyPage, page_size: PAGE_SIZE });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    placeholderData: (prev) => prev,
  });

  /* ── Search filter ───────────────────────────────────────────── */
  const activeBundles = useMemo(() => {
    const items = activeQuery.data?.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (b) =>
        b.name_ar.includes(q) ||
        b.name_en.toLowerCase().includes(q) ||
        b.name_fr.toLowerCase().includes(q)
    );
  }, [activeQuery.data, search]);

  const historyBundles = useMemo(() => {
    const items = historyQuery.data?.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (b) =>
        b.name_ar.includes(q) ||
        b.name_en.toLowerCase().includes(q) ||
        b.name_fr.toLowerCase().includes(q)
    );
  }, [historyQuery.data, search]);

  /* ── Helpers ─────────────────────────────────────────────────── */
  const dName = (b: BundleRead) =>
    locale === "ar" ? b.name_ar : locale === "fr" ? b.name_fr : b.name_en;

  const dDesc = (b: BundleRead) =>
    locale === "ar" ? b.description_ar : locale === "fr" ? b.description_fr : b.description_en;

  const currencyShortcut = (b: BundleRead) =>
    locale === "ar" ? b.currency.shortcut_ar
    : locale === "fr" ? b.currency.shortcut_fr
    : b.currency.shortcut_en;

  const currencyName = (b: BundleRead) =>
    locale === "ar" ? b.currency.name_ar
    : locale === "fr" ? b.currency.name_fr
    : b.currency.name_en;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    });

  const priceDisplay = (b: BundleRead) => {
    const priceNum = parseFloat(b.price);
    if (!priceNum || priceNum === 0) return null;
    return `${priceNum.toLocaleString()} ${currencyShortcut(b)}`;
  };

  /* ── Create form schema ──────────────────────────────────────── */
  const abilityField = z.coerce.number().int().min(0, t("validation.abilityMin"));

  const createSchema = z.object({
    /* Names (trilingual) */
    name_en: z.string().min(2, t("validation.nameEnRequired")),
    name_ar: z.string().min(2, t("validation.nameArRequired")),
    name_fr: z.string().min(2, t("validation.nameFrRequired")),
    /* Descriptions (optional) */
    description_en: z.string().optional().default(""),
    description_ar: z.string().optional().default(""),
    description_fr: z.string().optional().default(""),
    /* Type + Pricing */
    type: z.enum(["monthly", "yearly"], { error: t("validation.typeRequired") }),
    price: z.coerce.number().min(0, t("validation.priceMin")),
    price_before_discount: z.coerce.number().min(0).optional(),
    /* Currency & Countries */
    currency_id: z.string().min(1, t("validation.currencyRequired")),
    country_ids: z.array(z.string()).min(1, t("validation.countryRequired")),
    /* Abilities */
    number_of_products: abilityField,
    number_of_branches: abilityField,
    number_of_employees: abilityField,
    number_of_financial_accounts: abilityField,
    archived_items: abilityField,
    posts: abilityField,
  });
  type CreateFormInput = z.input<typeof createSchema>;

  const {
    register: regC,
    handleSubmit: hsC,
    reset: resetC,
    control,
    formState: { errors: errC, isSubmitting: isCreating },
  } = useForm<CreateFormInput>({ resolver: zodResolver(createSchema) });

  /* ── Mutations ───────────────────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: async (data: CreateFormInput) => {
      const res = await createBundle({
        name_en: data.name_en,
        name_ar: data.name_ar,
        name_fr: data.name_fr,
        description_en: data.description_en || undefined,
        description_ar: data.description_ar || undefined,
        description_fr: data.description_fr || undefined,
        type: data.type as BundleType,
        price: Number(data.price),
        price_before_discount: data.price_before_discount
          ? Number(data.price_before_discount)
          : undefined,
        currency_id: data.currency_id,
        country_ids: data.country_ids,
        abilities: {
          number_of_products: Number(data.number_of_products),
          number_of_branches: Number(data.number_of_branches),
          number_of_employees: Number(data.number_of_employees),
          number_of_financial_accounts: Number(data.number_of_financial_accounts),
          archived_items: Number(data.archived_items),
          posts: Number(data.posts),
        } as BundleAbilitiesCreate,
      });
      if (res.status_code >= 400 || !res.Data) throw new Error(res.Message);
      return res.Data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUNDLES_QUERY_KEY });
      setCreateOpen(false);
      resetC();
      addToast("success", t("toast.createSuccess"));
    },
    onError: (err: Error) => addToast("error", err.message || t("toast.createError")),
  });

  const moveMutation = useMutation({
    mutationFn: async (bundleId: string) => {
      const res = await moveBundleToHistory(bundleId);
      if (res.status_code >= 400) throw new Error(res.Message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUNDLES_QUERY_KEY });
      setDeactivateTarget(null);
      addToast("success", t("toast.deactivateSuccess"));
    },
    onError: (err: Error) => {
      addToast("error", err.message || t("toast.deactivateError"));
      setDeactivateTarget(null);
    },
  });

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* ── FilterBar ──────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setActivePage(1); setHistoryPage(1); }}
        searchPlaceholder={t("searchPlaceholder")}
        actions={
          <AddButton onClick={() => { resetC(); setCreateOpen(true); }}>
            {t("createBundle")}
          </AddButton>
        }
      />

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="active">
            <Package className="h-4 w-4" />
            {t("tabs.active")}
            <span className="ms-1.5 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {activeQuery.data?.total ?? 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <Archive className="h-4 w-4" />
            {t("tabs.previous")}
            <span className="ms-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums">
              {historyQuery.data?.total ?? 0}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Animated tab content ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ═══ Active tab ═══════════════════════════════════════ */}
        {activeTab === "active" && (
          <motion.div key="active-pane" {...tabPane}>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {(["bundleName", "price", "type", "countries", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuery.isError ? (
                      <tr><td colSpan={5} className="h-32 text-center text-red-400 text-sm">{tCommon("error")}</td></tr>
                    ) : activeBundles.length === 0 && !activeQuery.isFetching ? (
                      <tr><td colSpan={5} className="h-32 text-center text-slate-400 text-sm">{t("noActiveBundles")}</td></tr>
                    ) : (
                      activeBundles.map((bundle, i) => (
                        <motion.tr key={bundle.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors">
                          {/* Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
                                <Package className="h-4 w-4 text-[#0A3D62]" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 leading-tight">{dName(bundle)}</p>
                                {locale !== "ar" && (
                                  <p className="text-xs text-slate-400" dir="rtl" style={{ fontFamily: "var(--font-tajawal)" }}>
                                    {bundle.name_ar}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-5 py-3.5 font-mono whitespace-nowrap" dir="ltr">
                            {!priceDisplay(bundle) ? (
                              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold border border-emerald-100">
                                {t("free")}
                              </span>
                            ) : (
                              <span className="text-slate-700">
                                <span className="font-semibold">{parseFloat(bundle.price).toLocaleString()}</span>
                                <span className="ms-1 text-xs text-slate-400">{currencyShortcut(bundle)}</span>
                              </span>
                            )}
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              {t(`form.type${bundle.type.charAt(0).toUpperCase()}${bundle.type.slice(1)}` as Parameters<typeof t>[0])}
                            </span>
                          </td>
                          {/* Countries — replaces the old Abilities column */}
                          <td className="px-5 py-3.5 max-w-56">
                            <CountryTags countries={bundle.countries} locale={locale} max={3} />
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewTarget(bundle)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 whitespace-nowrap hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t("viewDetails")}
                              </button>
                              <button
                                onClick={() => setDeactivateTarget(bundle)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                {t("deactivate")}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                    {activeQuery.isFetching && activeBundles.length === 0 && <SkeletonRows cols={5} />}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(activeQuery.data?.pages ?? 0) > 1 && (
                <div className="flex items-center justify-between border-t border-slate-50 px-5 py-3">
                  <span className="text-xs text-slate-400">
                    {tCommon("page")} {activePage} {tCommon("of")} {activeQuery.data?.pages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                      disabled={activePage === 1 || activeQuery.isFetching}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActivePage((p) => Math.min(activeQuery.data!.pages, p + 1))}
                      disabled={activePage >= (activeQuery.data?.pages ?? 1) || activeQuery.isFetching}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ History tab ══════════════════════════════════════ */}
        {activeTab === "history" && (
          <motion.div key="history-pane" {...tabPane}>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {(["bundleName", "price", "type", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.isError ? (
                      <tr><td colSpan={4} className="h-32 text-center text-red-400 text-sm">{tCommon("error")}</td></tr>
                    ) : historyBundles.length === 0 && !historyQuery.isFetching ? (
                      <tr><td colSpan={4} className="h-32 text-center text-slate-400 text-sm">{t("noPreviousBundles")}</td></tr>
                    ) : (
                      historyBundles.map((bundle, i) => (
                        <motion.tr key={bundle.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors opacity-90">
                          {/* Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <Archive className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-500 leading-tight">{dName(bundle)}</p>
                                {locale !== "ar" && (
                                  <p className="text-xs text-slate-400" dir="rtl" style={{ fontFamily: "var(--font-tajawal)" }}>
                                    {bundle.name_ar}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-5 py-3.5 font-mono text-slate-400 text-xs whitespace-nowrap" dir="ltr">
                            {priceDisplay(bundle) ?? (
                              <span className="text-emerald-600 font-semibold">{t("free")}</span>
                            )}
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                              {t(`form.type${bundle.type.charAt(0).toUpperCase()}${bundle.type.slice(1)}` as Parameters<typeof t>[0])}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setViewTarget(bundle)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 whitespace-nowrap hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {tCommon("view")}
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                    {historyQuery.isFetching && historyBundles.length === 0 && <SkeletonRows cols={4} />}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(historyQuery.data?.pages ?? 0) > 1 && (
                <div className="flex items-center justify-between border-t border-slate-50 px-5 py-3">
                  <span className="text-xs text-slate-400">
                    {tCommon("page")} {historyPage} {tCommon("of")} {historyQuery.data?.pages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1 || historyQuery.isFetching}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setHistoryPage((p) => Math.min(historyQuery.data!.pages, p + 1))}
                      disabled={historyPage >= (historyQuery.data?.pages ?? 1) || historyQuery.isFetching}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Create Bundle Sheet                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Sheet open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetC(); }}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#0A3D62]" />
              {t("sheet.createTitle")}
            </SheetTitle>
            <SheetDescription>{t("sheet.createDesc")}</SheetDescription>
          </SheetHeader>

          <form
            onSubmit={hsC((data) => createMutation.mutate(data))}
            className="flex flex-col gap-6 px-6 py-6"
          >

            {/* ── Section: Names (trilingual) ──────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Bundle Names
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                {/* EN + AR side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-nameEn">{t("form.nameEn")}</Label>
                    <Input
                      id="b-nameEn"
                      placeholder="e.g. Starter"
                      dir="ltr"
                      {...regC("name_en")}
                      className={errC.name_en ? "border-red-400" : ""}
                    />
                    {errC.name_en && <p className="text-xs text-red-500">{errC.name_en.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-nameAr">{t("form.nameAr")}</Label>
                    <Input
                      id="b-nameAr"
                      placeholder="مثلاً: المبتدئ"
                      dir="rtl"
                      style={{ fontFamily: "var(--font-tajawal)" }}
                      {...regC("name_ar")}
                      className={errC.name_ar ? "border-red-400" : ""}
                    />
                    {errC.name_ar && <p className="text-xs text-red-500">{errC.name_ar.message}</p>}
                  </div>
                </div>
                {/* FR full width */}
                <div className="space-y-1.5">
                  <Label htmlFor="b-nameFr">{t("form.nameFr")}</Label>
                  <Input
                    id="b-nameFr"
                    placeholder="ex. Débutant"
                    dir="ltr"
                    {...regC("name_fr")}
                    className={errC.name_fr ? "border-red-400" : ""}
                  />
                  {errC.name_fr && <p className="text-xs text-red-500">{errC.name_fr.message}</p>}
                </div>
              </div>
            </div>

            {/* ── Section: Descriptions (optional, trilingual) ─── */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Descriptions <span className="normal-case font-normal text-slate-400">(optional)</span>
              </span>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="b-descEn">{t("form.descriptionEn")}</Label>
                  <textarea
                    id="b-descEn"
                    placeholder="Short English description…"
                    dir="ltr"
                    {...regC("description_en")}
                    className={`${textareaClass} ${errC.description_en ? "border-red-400" : "border-input"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-descAr">{t("form.descriptionAr")}</Label>
                  <textarea
                    id="b-descAr"
                    placeholder="وصف قصير بالعربية…"
                    dir="rtl"
                    style={{ fontFamily: "var(--font-tajawal)" }}
                    {...regC("description_ar")}
                    className={`${textareaClass} ${errC.description_ar ? "border-red-400" : "border-input"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-descFr">{t("form.descriptionFr")}</Label>
                  <textarea
                    id="b-descFr"
                    placeholder="Courte description en français…"
                    dir="ltr"
                    {...regC("description_fr")}
                    className={`${textareaClass} ${errC.description_fr ? "border-red-400" : "border-input"}`}
                  />
                </div>
              </div>
            </div>

            {/* ── Section: Type + Pricing ───────────────────────── */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Pricing
              </span>
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <Label>{t("form.bundleType")}</Label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errC.type ? "border-red-400" : ""}>
                          <SelectValue placeholder={t("form.bundleType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t("form.typeMonthly")}</SelectItem>
                          <SelectItem value="yearly">{t("form.typeYearly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errC.type && <p className="text-xs text-red-500">{errC.type.message}</p>}
                </div>
                {/* Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="b-price">{t("form.price")}</Label>
                  <Input
                    id="b-price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="299"
                    dir="ltr"
                    {...regC("price")}
                    className={errC.price ? "border-red-400" : ""}
                  />
                  {errC.price && <p className="text-xs text-red-500">{errC.price.message}</p>}
                </div>
              </div>
              {/* Price before discount */}
              <div className="space-y-1.5">
                <Label htmlFor="b-pbd">{t("form.priceBeforeDiscount")}</Label>
                <Input
                  id="b-pbd"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="399"
                  dir="ltr"
                  {...regC("price_before_discount")}
                  className={errC.price_before_discount ? "border-red-400" : ""}
                />
                {errC.price_before_discount && (
                  <p className="text-xs text-red-500">{errC.price_before_discount.message}</p>
                )}
              </div>
            </div>

            {/* ── Currency ─────────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label>{t("form.currencyId")}</Label>
              <Controller
                control={control}
                name="currency_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errC.currency_id ? "border-red-400" : ""}>
                      <SelectValue placeholder={t("form.selectCurrency")} />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errC.currency_id && <p className="text-xs text-red-500">{errC.currency_id.message}</p>}
            </div>

            {/* ── Countries multi-select ────────────────────────── */}
            <div className="space-y-1.5">
              <Label>{t("form.countryIds")}</Label>
              <Controller
                control={control}
                name="country_ids"
                defaultValue={[]}
                render={({ field }) => (
                  <MultiSelect
                    options={countryOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder={t("form.selectCountries")}
                  />
                )}
              />
              {errC.country_ids && <p className="text-xs text-red-500">{errC.country_ids.message}</p>}
            </div>

            {/* ── Abilities limits ──────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-slate-400" />
                <Label>{t("form.abilities")}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["number_of_products",          "form.numberOfProducts"],
                    ["number_of_branches",           "form.numberOfBranches"],
                    ["number_of_employees",          "form.numberOfEmployees"],
                    ["number_of_financial_accounts", "form.numberOfFinancialAccounts"],
                    ["archived_items",               "form.numberOfArchivedItems"],
                    ["posts",                        "form.numberOfPosts"],
                  ] as const
                ).map(([field, labelKey]) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={`b-${field}`}>{t(labelKey)}</Label>
                    <Input
                      id={`b-${field}`}
                      type="number"
                      min={0}
                      step={1}
                      dir="ltr"
                      {...regC(field)}
                      className={errC[field] ? "border-red-400" : ""}
                    />
                    {errC[field] && (
                      <p className="text-xs text-red-500">{errC[field]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </form>

          <SheetFooter className="px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" disabled={isCreating} className="flex-1">
                {tCommon("cancel")}
              </Button>
            </SheetClose>
            <Button
              onClick={hsC((data) => createMutation.mutate(data))}
              disabled={isCreating || createMutation.isPending}
              className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
            >
              {(isCreating || createMutation.isPending) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tCommon("saving")}
                </span>
              ) : t("sheet.createTitle")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Deactivate confirmation                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deactivateTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{t("sheet.deactivateTitle")}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("sheet.deactivateWillMove", { name: dName(deactivateTarget) })}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-5">
                <p className="text-xs text-amber-700 leading-relaxed">{t("sheet.deactivateWarning")}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeactivateTarget(null)}
                  disabled={moveMutation.isPending}
                  className="flex-1"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={() => moveMutation.mutate(deactivateTarget.id)}
                  disabled={moveMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {moveMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("deactivating")}
                    </span>
                  ) : t("confirmDeactivation")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* View Details Sheet — full new API data                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Sheet open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null); }}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {viewTarget?.status === "active" ? (
                <Package className="h-4 w-4 text-[#0A3D62]" />
              ) : (
                <Archive className="h-4 w-4 text-slate-400" />
              )}
              {viewTarget ? dName(viewTarget) : ""}
            </SheetTitle>
            <SheetDescription>{t("sheet.bundleDetailsDesc")}</SheetDescription>
          </SheetHeader>

          {viewTarget && (
            <div className="px-6 py-6 space-y-6">

              {/* ── Status + Type badges ──────────────────────── */}
              <div className="flex flex-wrap items-center gap-2">
                {viewTarget.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {t("status.active")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    {t("status.deactivated")}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 capitalize">
                  {t(`form.type${viewTarget.type.charAt(0).toUpperCase()}${viewTarget.type.slice(1)}` as Parameters<typeof t>[0])}
                </span>
              </div>

              {/* ── Names (EN / AR / FR) ─────────────────────── */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Bundle Names
                </p>
                <div className="grid grid-cols-1 gap-3 divide-y divide-slate-100">
                  <DetailRow label={t("sheet.nameEn")}>
                    <span dir="ltr">{viewTarget.name_en || "—"}</span>
                  </DetailRow>
                  <div className="pt-3">
                    <DetailRow label={t("sheet.nameAr")}>
                      <span dir="rtl" style={{ fontFamily: "var(--font-tajawal)" }}>{viewTarget.name_ar || "—"}</span>
                    </DetailRow>
                  </div>
                  <div className="pt-3">
                    <DetailRow label={t("sheet.nameFr")}>
                      <span dir="ltr">{viewTarget.name_fr || "—"}</span>
                    </DetailRow>
                  </div>
                </div>
              </div>

              {/* ── Descriptions (EN / AR / FR) ──────────────── */}
              {(viewTarget.description_en || viewTarget.description_ar || viewTarget.description_fr) && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Descriptions
                  </p>
                  <div className="space-y-3 divide-y divide-slate-100">
                    {viewTarget.description_en && (
                      <DetailRow label={t("sheet.descEn")}>
                        <span className="font-normal text-slate-600 leading-relaxed" dir="ltr">
                          {viewTarget.description_en}
                        </span>
                      </DetailRow>
                    )}
                    {viewTarget.description_ar && (
                      <div className="pt-3">
                        <DetailRow label={t("sheet.descAr")}>
                          <span className="font-normal text-slate-600 leading-relaxed" dir="rtl" style={{ fontFamily: "var(--font-tajawal)" }}>
                            {viewTarget.description_ar}
                          </span>
                        </DetailRow>
                      </div>
                    )}
                    {viewTarget.description_fr && (
                      <div className="pt-3">
                        <DetailRow label={t("sheet.descFr")}>
                          <span className="font-normal text-slate-600 leading-relaxed" dir="ltr">
                            {viewTarget.description_fr}
                          </span>
                        </DetailRow>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Price & Currency ─────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                {/* Price */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{t("col.price")}</p>
                  {!priceDisplay(viewTarget) ? (
                    <span className="font-semibold text-emerald-600">{t("free")}</span>
                  ) : (
                    <p className="font-semibold text-slate-800" dir="ltr">
                      {parseFloat(viewTarget.price).toLocaleString()}{" "}
                      <span className="text-slate-500 font-medium">{currencyShortcut(viewTarget)}</span>
                    </p>
                  )}
                  {viewTarget.price_before_discount && parseFloat(viewTarget.price_before_discount) > 0 && (
                    <p className="mt-1 text-xs text-slate-400 line-through" dir="ltr">
                      {t("sheet.priceBeforeDiscount")}: {parseFloat(viewTarget.price_before_discount).toLocaleString()}
                    </p>
                  )}
                </div>
                {/* Currency */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{t("sheet.currency")}</p>
                  <p className="font-semibold text-slate-800">{currencyShortcut(viewTarget)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{currencyName(viewTarget)}</p>
                </div>
              </div>

              {/* ── Countries ────────────────────────────────── */}
              {viewTarget.countries.length > 0 && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {t("sheet.countries")} ({viewTarget.countries.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewTarget.countries.map((country) => (
                      <span
                        key={country.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        <span>{country.flag_emoji}</span>
                        {locale === "ar" ? country.name_ar : locale === "fr" ? country.name_fr : country.name_en}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Bullet Points / Highlights ───────────────── */}
              {viewTarget.bullet_points.length > 0 && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    {t("sheet.bulletPoints")}
                  </p>
                  <div className="space-y-2">
                    {viewTarget.bullet_points
                      .sort((a, b) => a.order - b.order)
                      .map((bp, i) => {
                        const text =
                          locale === "ar" ? bp.text_ar
                          : locale === "fr" ? bp.text_fr
                          : bp.text_en;
                        return (
                          <motion.div
                            key={bp.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#28B8B1]" />
                            <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ── Abilities ────────────────────────────────── */}
              {viewTarget.abilities.length > 0 && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    {t("col.abilities")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewTarget.abilities.map((ability, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <span className="text-xs text-slate-500 capitalize">
                          {ability.ability_key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-semibold text-[#0A3D62]">
                          {ability.unlimited ? (
                            <span className="text-[#28B8B1]">∞</span>
                          ) : (
                            ability.ability_value.toLocaleString()
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Meta info ────────────────────────────────── */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600">{t("sheet.createdLabel")}</span>
                  <span className="font-mono">{fmtDate(viewTarget.created_at)}</span>
                </div>
                {viewTarget.created_by && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">{t("sheet.createdBy")}</span>
                    <span className="font-mono text-slate-700">{viewTarget.created_by}</span>
                  </div>
                )}
                {viewTarget.updated_at && viewTarget.updated_at !== viewTarget.created_at && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Updated: <span className="font-mono">{fmtDate(viewTarget.updated_at)}</span></span>
                  </div>
                )}
              </div>

            </div>
          )}

          <SheetFooter className="px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">{t("closeBtn")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ToastStack toasts={toasts} />
    </div>
  );
}
