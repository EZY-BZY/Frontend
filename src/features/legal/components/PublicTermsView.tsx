"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FileText, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getPublicTermsByType } from "@/services/terms";
import type { TermPublicRead, TermType } from "@/types/api";

/* ─── Locale content picker ──────────────────────────────────────── */
function pickContent(
  term: TermPublicRead,
  locale: string
): { name: string; description: string } {
  if (locale === "ar") {
    return { name: term.name_ar || term.name_en, description: term.description_ar || term.description_en };
  }
  if (locale === "fr") {
    return { name: term.name_fr || term.name_en, description: term.description_fr || term.description_en };
  }
  return { name: term.name_en, description: term.description_en };
}

/* ─── Loading skeleton ───────────────────────────────────────────── */
function PublicSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 space-y-4 animate-pulse"
        >
          <div className="h-5 w-48 rounded bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-slate-100" />
            <div className="h-3.5 w-5/6 rounded bg-slate-100" />
            <div className="h-3.5 w-4/6 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Expandable section card ────────────────────────────────────── */
function SectionCard({
  term,
  locale,
  index,
}: {
  term: TermPublicRead;
  locale: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const { name, description } = pickContent(term, locale);
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
        dir={isRTL ? "rtl" : "ltr"}
        style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF3FB] text-xs font-bold text-[#0A3D62]">
            {term.order}
          </span>
          <h3 className="font-semibold text-slate-800 text-base leading-snug text-start truncate">
            {name}
          </h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-6 pb-6 pt-1 border-t border-slate-50"
              dir={isRTL ? "rtl" : "ltr"}
              style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
            >
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface PublicTermsViewProps {
  termType: TermType;
}

export function PublicTermsView({ termType }: PublicTermsViewProps) {
  const locale = useLocale();
  const t = useTranslations("legal");
  const isRTL = locale === "ar";

  const title = t(`publicTitle.${termType}`);
  const subtitle = t(`publicSubtitle.${termType}`);

  const [terms, setTerms] = useState<TermPublicRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getPublicTermsByType(termType);
    if (res.Data && res.Data.length > 0) {
      const sorted = [...res.Data].sort((a, b) => a.order - b.order);
      setTerms(sorted);
    } else if (res.Data && res.Data.length === 0) {
      setTerms([]);
    } else {
      setError(res.Message || t("publicNoContent"));
    }
    setLoading(false);
  }, [termType, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-8"
      dir={isRTL ? "rtl" : "ltr"}
      style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
            <FileText className="h-5 w-5 text-[#0A3D62]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-slate-900 leading-tight"
              style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
            >
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="h-px bg-slate-100 mt-4" />
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {loading ? (
        <PublicSkeleton />
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
            <p className="text-sm text-slate-400">{t("publicNoContent")}</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {terms.map((term, i) => (
            <SectionCard key={term.id} term={term} locale={locale} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
