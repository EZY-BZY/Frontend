"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  Package, Archive, Eye, Copy, XCircle, AlertTriangle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockBundles as initialBundles } from "../data/mock-bundles";
import type { Bundle } from "@/types";

type DeactivateForm = { reasonEn: string; reasonAr: string };

/* ─── Animation helpers ──────────────────────────────────────────── */
const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.2, ease: EASE },
});

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const tabPane = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.18, ease: EASE },
};

/* ─── Feature tags ───────────────────────────────────────────────── */
function FeatureTags({ features, max = 3 }: { features: string[]; max?: number }) {
  const visible = features.slice(0, max);
  const extra = features.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((f) => (
        <span key={f} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 leading-snug">
          {f}
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

/* ══════════════════════════════════════════════════════════════════ */
export function BundlesView() {
  const locale = useLocale();
  const t = useTranslations("bundles");
  const tCommon = useTranslations("common");

  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "previous">("active");

  /* ── Sheet states ────────────────────────────────────────────── */
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Bundle | null>(null);
  const [viewTarget, setViewTarget] = useState<Bundle | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Derived lists ───────────────────────────────────────────── */
  const activeBundles = useMemo(() => {
    const q = search.toLowerCase();
    return bundles.filter(
      (b) =>
        b.isActive &&
        (!q ||
          b.nameEn.toLowerCase().includes(q) ||
          b.nameAr.includes(q) ||
          b.durationEn.toLowerCase().includes(q) ||
          b.featuresEn.some((f) => f.toLowerCase().includes(q)))
    );
  }, [bundles, search]);

  const previousBundles = useMemo(() => {
    const q = search.toLowerCase();
    return bundles.filter(
      (b) =>
        !b.isActive &&
        (!q ||
          b.nameEn.toLowerCase().includes(q) ||
          b.nameAr.includes(q) ||
          (b.deactivationReasonEn ?? "").toLowerCase().includes(q))
    );
  }, [bundles, search]);

  /* ── Helpers ─────────────────────────────────────────────────── */
  /* Build Zod schemas inside render to capture translated messages */
  const createSchema = z.object({
    nameEn:       z.string().min(2, t("validation.nameEnRequired")),
    nameAr:       z.string().min(2, t("validation.nameArRequired")),
    price:        z.coerce.number().min(0, t("validation.priceMin")),
    currency:     z.string().min(1).max(4),
    durationEn:   z.string().min(2, t("validation.durationRequired")),
    durationAr:   z.string().min(2, t("validation.durationRequired")),
    featuresEnRaw: z.string().min(3, t("validation.featuresEnRequired")),
    featuresArRaw: z.string().min(3, t("validation.featuresArRequired")),
  });
  type CreateFormInput = z.input<typeof createSchema>;
  type CreateForm = z.output<typeof createSchema>;

  const deactivateSchema = z.object({
    reasonEn: z.string().min(5, t("validation.reasonEnRequired")),
    reasonAr: z.string().min(5, t("validation.reasonArRequired")),
  });

  const dName = (b: Bundle) => (locale === "ar" ? b.nameAr : b.nameEn);
  const dDuration = (b: Bundle) => (locale === "ar" ? b.durationAr : b.durationEn);
  const dFeatures = (b: Bundle) => (locale === "ar" ? b.featuresAr : b.featuresEn);
  const dReason = (b: Bundle) =>
    (locale === "ar" ? b.deactivationReasonAr : b.deactivationReasonEn) ?? "—";

  const fmtDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  /* ── Create form ─────────────────────────────────────────────── */
  const {
    register: regC,
    handleSubmit: hsC,
    reset: resetC,
    setValue: setC,
    formState: { errors: errC },
  } = useForm<CreateFormInput, unknown, CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { currency: "USD" },
  });

  /* ── Deactivate form ─────────────────────────────────────────── */
  const {
    register: regD,
    handleSubmit: hsD,
    reset: resetD,
    formState: { errors: errD },
  } = useForm<DeactivateForm>({ resolver: zodResolver(deactivateSchema) });

  /* ── Submit: create ──────────────────────────────────────────── */
  const onCreateSubmit = async (data: CreateForm) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 480));
    const newBundle: Bundle = {
      id: `BND-${String(Date.now()).slice(-4)}`,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      price: data.price,
      currency: data.currency.toUpperCase(),
      durationEn: data.durationEn,
      durationAr: data.durationAr,
      featuresEn: data.featuresEnRaw.split(",").map((f) => f.trim()).filter(Boolean),
      featuresAr: data.featuresArRaw.split(/[,،]/).map((f) => f.trim()).filter(Boolean),
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBundles((prev) => [newBundle, ...prev]);
    setCreateOpen(false);
    resetC();
    setSaving(false);
  };

  /* ── Submit: deactivate ──────────────────────────────────────── */
  const onDeactivateSubmit = async (data: DeactivateForm) => {
    if (!deactivateTarget) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setBundles((prev) =>
      prev.map((b) =>
        b.id === deactivateTarget.id
          ? {
              ...b,
              isActive: false,
              deactivatedAt: new Date().toISOString().slice(0, 10),
              deactivationReasonEn: data.reasonEn,
              deactivationReasonAr: data.reasonAr,
            }
          : b
      )
    );
    setDeactivateTarget(null);
    resetD();
    setSaving(false);
    setActiveTab("previous");
  };

  /* ── Duplicate to new ────────────────────────────────────────── */
  const openDuplicate = (b: Bundle) => {
    resetC();
    setC("nameEn", b.nameEn + " (Copy)");
    setC("nameAr", b.nameAr + " (نسخة)");
    setC("price", b.price);
    setC("currency", b.currency);
    setC("durationEn", b.durationEn);
    setC("durationAr", b.durationAr);
    setC("featuresEnRaw", b.featuresEn.join(", "));
    setC("featuresArRaw", b.featuresAr.join("، "));
    setCreateOpen(true);
  };

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* ── FilterBar ────────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        actions={
          <AddButton onClick={() => { resetC(); setCreateOpen(true); }}>
            {t("createBundle")}
          </AddButton>
        }
      />

      {/* ── Tab buttons ──────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="active">
            <Package className="h-4 w-4" />
            {t("tabs.active")}
            <span className="ms-1.5 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {activeBundles.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="previous">
            <Archive className="h-4 w-4" />
            {t("tabs.previous")}
            <span className="ms-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums">
              {previousBundles.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Animated tab content ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "active" ? (
          <motion.div key="active-pane" {...tabPane}>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {(["bundleName", "price", "duration", "features", "status", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeBundles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="h-32 text-center text-slate-400 text-sm">{t("noActiveBundles")}</td>
                      </tr>
                    ) : (
                      activeBundles.map((bundle, i) => (
                        <motion.tr key={bundle.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
                                <Package className="h-4 w-4 text-[#0A3D62]" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 leading-tight">{dName(bundle)}</p>
                                <p className="text-xs text-slate-400 font-mono">{bundle.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono whitespace-nowrap" dir="ltr">
                            {bundle.price === 0 ? (
                              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold border border-emerald-100">
                                {t("free")}
                              </span>
                            ) : (
                              <span className="text-slate-700">
                                <span className="font-semibold">{bundle.price.toLocaleString()}</span>
                                <span className="ms-1 text-xs text-slate-400">{bundle.currency}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              {dDuration(bundle)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 max-w-60">
                            <FeatureTags features={dFeatures(bundle)} max={3} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {t("status.active")}
                            </span>
                          </td>
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
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
                {t("activeBundlesFooter", { shown: activeBundles.length, total: bundles.filter((b) => b.isActive).length })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="previous-pane" {...tabPane}>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {(["bundleName", "price", "duration", "deactivatedOn", "reason", "actions"] as const).map((h) => (
                        <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {t(`col.${h}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previousBundles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="h-32 text-center text-slate-400 text-sm">{t("noPreviousBundles")}</td>
                      </tr>
                    ) : (
                      previousBundles.map((bundle, i) => (
                        <motion.tr key={bundle.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors opacity-90">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <Archive className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-500 leading-tight">{dName(bundle)}</p>
                                <p className="text-xs text-slate-400 font-mono">{bundle.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400 text-xs whitespace-nowrap" dir="ltr">
                            {bundle.price.toLocaleString()} {bundle.currency}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                              {dDuration(bundle)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-red-50 border border-red-100 text-red-500 px-2.5 py-0.5 text-xs font-mono">
                              {fmtDate(bundle.deactivatedAt)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs max-w-72">
                            <p className="truncate" title={dReason(bundle)}>{dReason(bundle)}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewTarget(bundle)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 whitespace-nowrap hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {tCommon("view")}
                              </button>
                              <button
                                onClick={() => openDuplicate(bundle)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#28B8B1]/30 bg-[#E6F7F7] px-2.5 py-1.5 text-xs font-medium text-[#28B8B1] hover:bg-[#28B8B1]/20 transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                {t("duplicateToNew")}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
                {t("previousBundlesFooter", { shown: previousBundles.length, total: bundles.filter((b) => !b.isActive).length })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Create / Duplicate Sheet                                   */}
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

          <form onSubmit={hsC(onCreateSubmit)} className="flex flex-col gap-5 px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-nameEn">{t("form.nameEn")}</Label>
                <Input id="b-nameEn" placeholder="e.g. Starter" {...regC("nameEn")} className={errC.nameEn ? "border-red-400" : ""} />
                {errC.nameEn && <p className="text-xs text-red-500">{errC.nameEn.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-nameAr">{t("form.nameAr")}</Label>
                <Input id="b-nameAr" placeholder="مثلاً: المبتدئ" dir="rtl" {...regC("nameAr")} className={errC.nameAr ? "border-red-400" : ""} />
                {errC.nameAr && <p className="text-xs text-red-500">{errC.nameAr.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-price">{t("form.price")}</Label>
                <Input id="b-price" type="number" min={0} placeholder="299" dir="ltr" {...regC("price")} className={errC.price ? "border-red-400" : ""} />
                {errC.price && <p className="text-xs text-red-500">{errC.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-currency">{t("form.currency")}</Label>
                <Input id="b-currency" placeholder="USD" {...regC("currency")} className={`uppercase ${errC.currency ? "border-red-400" : ""}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-durEn">{t("form.durationEn")}</Label>
                <Input id="b-durEn" placeholder="12 months" {...regC("durationEn")} className={errC.durationEn ? "border-red-400" : ""} />
                {errC.durationEn && <p className="text-xs text-red-500">{errC.durationEn.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-durAr">{t("form.durationAr")}</Label>
                <Input id="b-durAr" placeholder="١٢ شهراً" dir="rtl" {...regC("durationAr")} className={errC.durationAr ? "border-red-400" : ""} />
                {errC.durationAr && <p className="text-xs text-red-500">{errC.durationAr.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="b-featEn">{t("form.featuresEn")}</Label>
              <Input id="b-featEn" placeholder="Up to 5 users, 10 GB storage, Basic support" {...regC("featuresEnRaw")} className={errC.featuresEnRaw ? "border-red-400" : ""} />
              <p className="text-[11px] text-slate-400">{t("form.separateWithCommas")}</p>
              {errC.featuresEnRaw && <p className="text-xs text-red-500">{errC.featuresEnRaw.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="b-featAr">{t("form.featuresAr")}</Label>
              <Input id="b-featAr" placeholder="حتى ٥ مستخدمين، ١٠ جيجابايت تخزين" dir="rtl" {...regC("featuresArRaw")} className={errC.featuresArRaw ? "border-red-400" : ""} />
              <p className="text-[11px] text-slate-400">{t("form.separateWithArabicComma")}</p>
              {errC.featuresArRaw && <p className="text-xs text-red-500">{errC.featuresArRaw.message}</p>}
            </div>
          </form>

          <SheetFooter className="px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetC(); }} className="flex-1">
                {tCommon("cancel")}
              </Button>
            </SheetClose>
            <Button onClick={hsC(onCreateSubmit)} disabled={saving} className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {tCommon("saving")}
                </span>
              ) : t("sheet.createTitle")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Deactivate Sheet                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Sheet open={!!deactivateTarget} onOpenChange={(v) => { if (!v) { setDeactivateTarget(null); resetD(); } }}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {t("sheet.deactivateTitle")}
            </SheetTitle>
            <SheetDescription>
              {deactivateTarget && (
                <span>{t("sheet.deactivateWillMove", { name: deactivateTarget.nameEn })}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mx-6 mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">{t("sheet.deactivateWarning")}</p>
          </div>

          <form onSubmit={hsD(onDeactivateSubmit)} className="flex flex-col gap-5 px-6 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="d-reasonEn">{t("form.deactivationReasonEn")}</Label>
              <Input id="d-reasonEn" placeholder="e.g. Superseded by the Pro bundle" {...regD("reasonEn")} className={errD.reasonEn ? "border-red-400" : ""} />
              {errD.reasonEn && <p className="text-xs text-red-500">{errD.reasonEn.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-reasonAr">{t("form.deactivationReasonAr")}</Label>
              <Input id="d-reasonAr" placeholder="مثلاً: تم الاستعاضة عنها بباقة المحترف" dir="rtl" {...regD("reasonAr")} className={errD.reasonAr ? "border-red-400" : ""} />
              {errD.reasonAr && <p className="text-xs text-red-500">{errD.reasonAr.message}</p>}
            </div>
          </form>

          <SheetFooter className="px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" onClick={() => { setDeactivateTarget(null); resetD(); }} className="flex-1">
                {tCommon("cancel")}
              </Button>
            </SheetClose>
            <Button onClick={hsD(onDeactivateSubmit)} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("deactivating")}
                </span>
              ) : t("confirmDeactivation")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* View Details Sheet                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Sheet open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null); }}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {viewTarget?.isActive ? (
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
              <div className="flex items-center gap-3">
                {viewTarget.isActive ? (
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
                <span className="font-mono text-xs text-slate-400">{viewTarget.id}</span>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("sheet.englishName")}</p>
                  <p className="font-semibold text-slate-800">{viewTarget.nameEn}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("sheet.arabicName")}</p>
                  <p className="font-semibold text-slate-800" dir="rtl">{viewTarget.nameAr}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("col.price")}</p>
                  {viewTarget.price === 0 ? (
                    <span className="font-semibold text-emerald-600">{t("free")}</span>
                  ) : (
                    <p className="font-semibold text-slate-800" dir="ltr">
                      {viewTarget.price.toLocaleString()} {viewTarget.currency}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("col.duration")}</p>
                  <p className="font-semibold text-slate-800">{dDuration(viewTarget)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{t("col.features")}</p>
                <div className="flex flex-col gap-2">
                  {dFeatures(viewTarget).map((f, i) => (
                    <motion.div key={f} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#28B8B1] shrink-0" />
                      <span className="text-sm text-slate-700">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {!viewTarget.isActive && viewTarget.deactivatedAt && (
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">{t("sheet.deactivationInfo")}</p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{t("col.deactivatedOn")}: </span>
                    {fmtDate(viewTarget.deactivatedAt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{t("col.reason")}: </span>
                    {dReason(viewTarget)}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400">
                {t("sheet.createdLabel")} <span className="font-mono">{fmtDate(viewTarget.createdAt)}</span>
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
    </div>
  );
}
