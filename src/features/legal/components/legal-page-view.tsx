"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, FileText, AlertCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LegalSectionSheet } from "./legal-section-sheet";
import { listTermsByType, deleteTerm } from "@/services/terms";
import type { TermRead, TermType } from "@/types/api";

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

const DOC_META: Record<LegalDocType, { titleEn: string; titleFr: string; titleAr: string }> = {
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
        <span className="text-xs text-red-500 font-medium">{t("confirmDelete")}</span>
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

  useEffect(() => { load(); }, [load]);

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
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
            <FileText className="h-5 w-5 text-[#0A3D62]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {locale === "ar" ? meta.titleAr : locale === "fr" ? meta.titleFr : meta.titleEn}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === "en" ? meta.titleFr : meta.titleEn}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t("addSection")}
        </Button>
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
                      <p className="text-sm text-slate-500 leading-relaxed">{term.description_en}</p>
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
                      <p className="text-sm text-slate-500 leading-relaxed">{term.description_fr}</p>
                    </div>

                    {/* Arabic */}
                    <div
                      className="px-5 py-5 bg-slate-50/50 md:col-span-2 xl:col-span-1"
                      dir="rtl"
                      style={{ fontFamily: "var(--font-tajawal)" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#E6F7F7] px-2 py-0.5 text-[10px] font-semibold text-[#28B8B1] uppercase tracking-wide">
                          AR
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {term.name_ar}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{term.description_ar}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Sheet ────────────────────────────────────────────────── */}
      <LegalSectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        term={editingTerm}
        termType={termType}
        onSaved={handleSaved}
      />
    </div>
  );
}
