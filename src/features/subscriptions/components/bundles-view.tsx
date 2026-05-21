"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, Archive, Eye, XCircle, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight, CheckCircle2,
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
import type { BundleAbilitiesRead, BundleRead, BundleType, CountryRead } from "@/types/api";

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

/* ─── Ability helpers ────────────────────────────────────────────── */
type AbilitiesTranslator = (
  key: "abilities.products" | "abilities.branches" | "abilities.employees" | "abilities.financialAccounts",
  values: { count: number }
) => string;

function abilityLabels(abilities: BundleAbilitiesRead, t: AbilitiesTranslator): string[] {
  return [
    t("abilities.products", { count: abilities.number_of_products }),
    t("abilities.branches", { count: abilities.number_of_branches }),
    t("abilities.employees", { count: abilities.number_of_employees }),
    t("abilities.financialAccounts", { count: abilities.number_of_financial_accounts }),
  ];
}

function currencyShortcut(country: CountryRead, locale: string): string {
  if (locale === "ar") return country.currency_shortcut_ar;
  if (locale === "fr") return country.currency_shortcut_fr;
  return country.currency_shortcut_en;
}

function AbilityTags({
  abilities,
  t,
  max = 3,
}: {
  abilities: BundleAbilitiesRead;
  t: AbilitiesTranslator;
  max?: number;
}) {
  const labels = abilityLabels(abilities, t);
  const visible = labels.slice(0, max);
  const extra = labels.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((a, i) => (
        <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 leading-snug">
          {a}
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

  /* ── Countries for multi-select ─────────────────────────────── */
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
        label:
          locale === "ar" ? c.name_ar : locale === "fr" ? c.name_fr : c.name_en,
        flag: c.flag_emoji,
      })),
    [countriesData, locale]
  );

  const currencyOptions = useMemo(
    () =>
      (countriesData ?? []).map((c) => {
        const name = locale === "ar" ? c.name_ar : locale === "fr" ? c.name_fr : c.name_en;
        const code = currencyShortcut(c, locale);
        return {
          value: c.id,
          label: `${c.flag_emoji} ${code} — ${name}`,
        };
      }),
    [countriesData, locale]
  );

  const currencyById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of countriesData ?? []) {
      map.set(c.id, currencyShortcut(c, locale));
    }
    return map;
  }, [countriesData, locale]);

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

  /* ── Derived filtered lists (client-side search on loaded page) ─ */
  const activeBundles = useMemo(() => {
    const items = activeQuery.data?.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((b) => {
      const labels = abilityLabels(b.abilities, (key, values) => t(key, values));
      return (
        b.name_ar.includes(q) ||
        b.name_other_lang.toLowerCase().includes(q) ||
        labels.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [activeQuery.data, search, t]);

  const historyBundles = useMemo(() => {
    const items = historyQuery.data?.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (b) =>
        b.name_ar.includes(q) ||
        b.name_other_lang.toLowerCase().includes(q)
    );
  }, [historyQuery.data, search]);

  /* ── Helpers ─────────────────────────────────────────────────── */
  const dName = (b: BundleRead) => (locale === "ar" ? b.name_ar : b.name_other_lang);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const fmtPrice = (b: BundleRead) => {
    if (b.price === 0) return null;
    const currency = currencyById.get(b.currency_id) ?? b.currency_id;
    return `${b.price.toLocaleString()} ${currency}`;
  };

  /* ── Create form schema ──────────────────────────────────────── */
  const abilityField = z.coerce.number().int().min(0, t("validation.abilityMin"));

  const createSchema = z.object({
    name_ar: z.string().min(2, t("validation.nameArRequired")),
    name_other_lang: z.string().min(2, t("validation.nameEnRequired")),
    type: z.enum(["monthly", "yearly"], {
      error: t("validation.typeRequired"),
    }),
    price: z.coerce.number().min(0, t("validation.priceMin")),
    currency_id: z.string().min(1, t("validation.currencyRequired")),
    country_ids: z.array(z.string()).min(1, t("validation.countryRequired")),
    number_of_products: abilityField,
    number_of_branches: abilityField,
    number_of_employees: abilityField,
    number_of_financial_accounts: abilityField,
  });
  type CreateFormInput = z.input<typeof createSchema>;

  const {
    register: regC,
    handleSubmit: hsC,
    reset: resetC,
    control,
    setValue: setC,
    formState: { errors: errC, isSubmitting: isCreating },
  } = useForm<CreateFormInput>({ resolver: zodResolver(createSchema) });

  /* ── Mutations ───────────────────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: async (data: CreateFormInput) => {
      const res = await createBundle({
        name_ar: data.name_ar,
        name_other_lang: data.name_other_lang,
        type: data.type as BundleType,
        price: Number(data.price),
        currency_id: data.currency_id,
        country_ids: data.country_ids,
        abilities: {
          number_of_products: Number(data.number_of_products),
          number_of_branches: Number(data.number_of_branches),
          number_of_employees: Number(data.number_of_employees),
          number_of_financial_accounts: Number(data.number_of_financial_accounts),
        },
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
                      {(["bundleName", "price", "type", "abilities", "status", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuery.isError ? (
                      <tr><td colSpan={6} className="h-32 text-center text-red-400 text-sm">{tCommon("error")}</td></tr>
                    ) : activeBundles.length === 0 && !activeQuery.isFetching ? (
                      <tr><td colSpan={6} className="h-32 text-center text-slate-400 text-sm">{t("noActiveBundles")}</td></tr>
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
                            {bundle.price === 0 ? (
                              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold border border-emerald-100">
                                {t("free")}
                              </span>
                            ) : (
                              <span className="text-slate-700">
                                <span className="font-semibold">{bundle.price.toLocaleString()}</span>
                                <span className="ms-1 text-xs text-slate-400">
                                  {currencyById.get(bundle.currency_id) ?? bundle.currency_id}
                                </span>
                              </span>
                            )}
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              {t(`form.type${bundle.type.charAt(0).toUpperCase()}${bundle.type.slice(1)}` as Parameters<typeof t>[0])}
                            </span>
                          </td>
                          {/* Abilities */}
                          <td className="px-5 py-3.5 max-w-60">
                            <AbilityTags
                              abilities={bundle.abilities}
                              t={(key, values) => t(key, values)}
                              max={3}
                            />
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {t("status.active")}
                            </span>
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
                    {activeQuery.isFetching && activeBundles.length === 0 && <SkeletonRows cols={6} />}
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
                      {(["bundleName", "price", "type", "status", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.isError ? (
                      <tr><td colSpan={5} className="h-32 text-center text-red-400 text-sm">{tCommon("error")}</td></tr>
                    ) : historyBundles.length === 0 && !historyQuery.isFetching ? (
                      <tr><td colSpan={5} className="h-32 text-center text-slate-400 text-sm">{t("noPreviousBundles")}</td></tr>
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
                            {fmtPrice(bundle) ?? <span className="text-emerald-600 font-semibold">{t("free")}</span>}
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                              {t(`form.type${bundle.type.charAt(0).toUpperCase()}${bundle.type.slice(1)}` as Parameters<typeof t>[0])}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              {t("status.deactivated")}
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
                    {historyQuery.isFetching && historyBundles.length === 0 && <SkeletonRows cols={5} />}
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
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#0A3D62]" />
              {t("sheet.createTitle")}
            </SheetTitle>
            <SheetDescription>{t("sheet.createDesc")}</SheetDescription>
          </SheetHeader>

          <form
            onSubmit={hsC((data) => createMutation.mutate(data))}
            className="flex flex-col gap-5 px-6 py-6"
          >
            {/* Name: other lang + Arabic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-nameOther">{t("form.nameOtherLang")}</Label>
                <Input
                  id="b-nameOther"
                  placeholder="e.g. Starter"
                  dir="ltr"
                  {...regC("name_other_lang")}
                  className={errC.name_other_lang ? "border-red-400" : ""}
                />
                {errC.name_other_lang && <p className="text-xs text-red-500">{errC.name_other_lang.message}</p>}
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

            {/* Type + Price */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <Label htmlFor="b-price">{t("form.price")}</Label>
                <Input
                  id="b-price"
                  type="number"
                  min={0}
                  placeholder="299"
                  dir="ltr"
                  {...regC("price")}
                  className={errC.price ? "border-red-400" : ""}
                />
                {errC.price && <p className="text-xs text-red-500">{errC.price.message}</p>}
              </div>
            </div>

            {/* Currency (country UUID) */}
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

            {/* Countries multi-select */}
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

            {/* Abilities limits */}
            <div className="space-y-3">
              <Label>{t("form.abilities")}</Label>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["number_of_products", "form.numberOfProducts"],
                    ["number_of_branches", "form.numberOfBranches"],
                    ["number_of_employees", "form.numberOfEmployees"],
                    ["number_of_financial_accounts", "form.numberOfFinancialAccounts"],
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
      {/* View Details Sheet                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Sheet open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null); }}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
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
            <div className="px-6 py-6 space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-3">
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
              </div>

              {/* Names */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                <div dir="ltr">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("sheet.otherLangName")}</p>
                  <p className="font-semibold text-slate-800">{viewTarget.name_other_lang}</p>
                </div>
                <div dir="rtl" style={{ fontFamily: "var(--font-tajawal)" }}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("sheet.arabicName")}</p>
                  <p className="font-semibold text-slate-800">{viewTarget.name_ar}</p>
                </div>
              </div>

              {/* Price + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("col.price")}</p>
                  {viewTarget.price === 0 ? (
                    <span className="font-semibold text-emerald-600">{t("free")}</span>
                  ) : (
                    <p className="font-semibold text-slate-800" dir="ltr">
                      {viewTarget.price.toLocaleString()}{" "}
                      {currencyById.get(viewTarget.currency_id) ?? viewTarget.currency_id}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("col.type")}</p>
                  <p className="font-semibold text-slate-800 capitalize">{viewTarget.type}</p>
                </div>
              </div>

              {/* Abilities */}
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{t("col.abilities")}</p>
                <div className="flex flex-col gap-2">
                  {abilityLabels(viewTarget.abilities, (key, values) => t(key, values)).map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#28B8B1] shrink-0" />
                      <span className="text-sm text-slate-700">{a}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400">
                {t("sheet.createdLabel")}{" "}
                <span className="font-mono">{fmtDate(viewTarget.created_at)}</span>
              </p>
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
