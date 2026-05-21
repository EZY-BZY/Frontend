"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LegalSectionSheet } from "./legal-section-sheet";
import { listTermsByType, deleteTerm, listTermHistory } from "@/services/terms";
import type {
  TermRead,
  TermType,
  TermHistoryDayGroupRead,
  TermHistoryVersionRead,
  TermSnapshotItem,
} from "@/types/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/* ─── Doc type mapping ───────────────────────────────────────────── */
type LegalDocType =
  | "privacy-policy"
  | "terms-conditions"
  | "delivery-terms"
  | "refund-terms";

const TERM_TYPE_MAP: Record<LegalDocType, TermType> = {
  "privacy-policy": "privacy_policy",
  "terms-conditions": "terms_of_use",
  "delivery-terms": "delivery_terms",
  "refund-terms": "refund_terms",
};

const DOC_META: Record<
  LegalDocType,
  { titleEn: string; titleFr: string; titleAr: string }
> = {
  "privacy-policy": {
    titleEn: "Privacy Policy",
    titleFr: "Politique de confidentialité",
    titleAr: "سياسة الخصوصية",
  },
  "terms-conditions": {
    titleEn: "Terms & Conditions",
    titleFr: "Conditions générales",
    titleAr: "الشروط والأحكام",
  },
  "delivery-terms": {
    titleEn: "Delivery Terms",
    titleFr: "Conditions de livraison",
    titleAr: "شروط التوصيل",
  },
  "refund-terms": {
    titleEn: "Refund Terms",
    titleFr: "Conditions de remboursement",
    titleAr: "شروط الاسترداد",
  },
};

/* ─── Animation helpers ──────────────────────────────────────────── */
const cardAnim = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.28 },
});

/* ─── Loading skeleton ───────────────────────────────────────────── */
function SectionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden animate-pulse"
        >
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3">
            <div className="h-3 w-16 rounded bg-slate-100" />
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded-lg bg-slate-100" />
              <div className="h-8 w-8 rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
            {[1, 2, 3].map((j) => (
              <div key={j} className="px-5 py-5 space-y-3">
                <div className="h-3 w-8 rounded-full bg-slate-100" />
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-4/5 rounded bg-slate-100" />
                  <div className="h-3 w-3/5 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Delete confirmation ────────────────────────────────────────── */
function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-red-500 font-medium">
          {t("confirmDelete")}
        </span>
        <button
          onClick={onConfirm}
          className="rounded px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          {tCommon("yes")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          {tCommon("no")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      title={t("deleteSection")}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

/* ─── History snapshot item ──────────────────────────────────────── */
function SnapshotItem({ item }: { item: TermSnapshotItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-xs transition-colors",
        item.is_changed
          ? "border-amber-200 bg-amber-50"
          : "border-slate-100 bg-slate-50/50"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          {item.is_changed && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
              changed
            </span>
          )}
          <span className="truncate font-medium text-slate-700">
            {item.name_en}
          </span>
          <span className="shrink-0 text-slate-400">§{item.order}</span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <p className="text-slate-600 leading-relaxed">{item.description_en}</p>
          {item.name_fr && (
            <p className="text-slate-500 italic">{item.name_fr}</p>
          )}
          {item.name_ar && (
            <p
              className="text-slate-500"
              dir="rtl"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              {item.name_ar}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── History version card ───────────────────────────────────────── */
function VersionCard({
  version,
  locale,
  t,
}: {
  version: TermHistoryVersionRead;
  locale: string;
  t: ReturnType<typeof useTranslations<"legal">>;
}) {
  const actionColors = {
    created: "bg-emerald-50 text-emerald-700",
    updated: "bg-amber-50 text-amber-700",
    deleted: "bg-red-50 text-red-600",
  } as const;

  const dateStr = new Date(version.version_date).toLocaleString(
    locale === "ar" ? "ar-EG" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            actionColors[version.action_type] ?? "bg-slate-100 text-slate-600"
          )}
        >
          {t(`historyAction.${version.action_type}`)}
        </span>
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {dateStr}
        </span>
      </div>

      {version.performed_by && (
        <p className="text-xs text-slate-500">
          {t("performedBy")}:{" "}
          <span className="font-mono text-slate-700">{version.performed_by}</span>
        </p>
      )}

      {version.terms_snapshot.length > 0 && (
        <div className="space-y-2">
          {version.terms_snapshot.map((item, idx) => (
            <SnapshotItem key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── History Sheet ──────────────────────────────────────────────── */
function HistorySheet({
  open,
  onOpenChange,
  termType,
  locale,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  termType: TermType;
  locale: string;
}) {
  const t = useTranslations("legal");
  const [groups, setGroups] = useState<TermHistoryDayGroupRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;

  const load = useCallback(
    async (p: number, reset: boolean) => {
      setLoading(true);
      const res = await listTermHistory(termType, { page: p, page_size: PAGE_SIZE });
      if (res.Data) {
        const { items, pages } = res.Data;
        setGroups((prev) => (reset ? items : [...prev, ...items]));
        setHasMore(p < pages);
      }
      setLoading(false);
    },
    [termType]
  );

  useEffect(() => {
    if (open) {
      setPage(1);
      setGroups([]);
      setHasMore(true);
      load(1, true);
    }
  }, [open, load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#28B8B1]" />
            {t("historyTitle")}
          </SheetTitle>
          <SheetDescription>{t("historyDesc")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading && groups.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 p-4 space-y-2 animate-pulse"
                >
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-3 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
              <Clock className="h-8 w-8" />
              <p className="text-sm">{t("noHistory")}</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.day}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {new Date(group.day).toLocaleDateString(
                    locale === "ar" ? "ar-EG" : "en-GB",
                    { day: "2-digit", month: "long", year: "numeric" }
                  )}
                </p>
                <div className="space-y-3">
                  {group.versions.map((version, i) => (
                    <motion.div
                      key={`${version.version_date}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <VersionCard version={version} locale={locale} t={t} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}

          {hasMore && !loading && groups.length > 0 && (
            <button
              onClick={loadMore}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              Load more
            </button>
          )}

          {loading && groups.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#28B8B1]" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface LegalPageViewProps {
  docType: LegalDocType;
}

export function LegalPageView({ docType }: LegalPageViewProps) {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const meta = DOC_META[docType];
  const termType = TERM_TYPE_MAP[docType];

  const [terms, setTerms] = useState<TermRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermRead | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listTermsByType(termType);
    if (res.Data) {
      setTerms(res.Data);
    } else {
      setError(res.Message || tCommon("noResults"));
    }
    setLoading(false);
  }, [termType, tCommon]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditingTerm(undefined);
    setSheetOpen(true);
  };

  const handleEdit = (term: TermRead) => {
    setEditingTerm(term);
    setSheetOpen(true);
  };

  const handleSaved = (saved: TermRead) => {
    setTerms((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDelete = async (termId: string) => {
    const res = await deleteTerm(termId);
    if (res.status_code >= 200 && res.status_code < 300) {
      setTerms((prev) => prev.filter((t) => t.id !== termId));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
            <FileText className="h-5 w-5 text-[#0A3D62]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {locale === "ar"
                ? meta.titleAr
                : locale === "fr"
                ? meta.titleFr
                : meta.titleEn}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === "en" ? meta.titleFr : meta.titleEn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="gap-2 border-[#28B8B1] text-[#28B8B1] hover:bg-[#E6F7F7] hover:text-[#28B8B1] hover:border-[#28B8B1]"
          >
            <Clock className="h-4 w-4" />
            {t("historyBtn")}
          </Button>
          <Button
            onClick={handleAdd}
            className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t("addSection")}
          </Button>
        </div>
      </motion.div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      {loading ? (
        <SectionSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      ) : terms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50"
        >
          <div className="text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">{t("noSections")}</p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {terms.map((term, i) => (
              <motion.div
                key={term.id}
                {...cardAnim(i)}
                layout
                exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
              >
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  {/* Card header: order + actions */}
                  <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t("sectionPrefix")} {term.order}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(term)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#EBF3FB] hover:text-[#0A3D62] transition-colors"
                        title={t("editSectionBtn")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <DeleteButton onConfirm={() => handleDelete(term.id)} />
                    </div>
                  </div>

                  {/* Trilingual split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                    {/* English */}
                    <div className="px-5 py-5" dir="ltr">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#EBF3FB] px-2 py-0.5 text-[10px] font-semibold text-[#0A3D62] uppercase tracking-wide">
                          EN
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {term.name_en}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {term.description_en}
                      </p>
                    </div>

                    {/* French */}
                    <div className="px-5 py-5 bg-slate-50/40" dir="ltr">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
                          FR
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {term.name_fr}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {term.description_fr}
                      </p>
                    </div>

                    {/* Arabic */}
                    <div
                      className="px-5 py-5 bg-slate-50/50 md:col-span-2 xl:col-span-1"
                      dir="rtl"
                      style={{ fontFamily: "var(--font-cairo)" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#E6F7F7] px-2 py-0.5 text-[10px] font-semibold text-[#28B8B1] uppercase tracking-wide">
                          AR
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {term.name_ar}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {term.description_ar}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Section Sheet (add / edit) ────────────────────────────── */}
      <LegalSectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        term={editingTerm}
        termType={termType}
        onSaved={handleSaved}
      />

      {/* ── History Sheet ─────────────────────────────────────────── */}
      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        termType={termType}
        locale={locale}
      />
    </div>
  );
}
