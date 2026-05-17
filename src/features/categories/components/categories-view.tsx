"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, Pencil, Trash2 } from "lucide-react";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { IndustrySheet } from "./categories-sheet";
import { listIndustries, deleteIndustry } from "@/services/industries";
import type { IndustryPublicRead } from "@/types/api";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

function resolveImage(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${url}`;
}

export function CategoriesView() {
  const locale = useLocale();
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  const [industries, setIndustries] = useState<IndustryPublicRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<IndustryPublicRead | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listIndustries({ page: 1, page_size: 100 });
    if (res.Data) {
      setIndustries(res.Data.items ?? []);
    } else {
      setError(res.Message || tCommon("noResults"));
    }
    setLoading(false);
  }, [tCommon]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return industries;
    return industries.filter(
      (ind) =>
        ind.name_en.toLowerCase().includes(q) ||
        ind.name_ar.toLowerCase().includes(q) ||
        ind.name_fr.toLowerCase().includes(q)
    );
  }, [search, industries]);

  const openAdd = () => { setSelected(undefined); setSheetOpen(true); };
  const openView = (ind: IndustryPublicRead) => { setSelected(ind); setSheetOpen(true); };

  const handleSaved = (saved: IndustryPublicRead) => {
    setIndustries((prev) => {
      const idx = prev.findIndex((ind) => ind.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const res = await deleteIndustry(id);
    if (res.status_code >= 200 && res.status_code < 300) {
      setIndustries((prev) => prev.filter((ind) => ind.id !== id));
    }
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-2.5 h-10 bg-slate-50 animate-pulse" />
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-28 rounded bg-slate-100 animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-7 w-20 rounded-lg bg-slate-100 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 flex items-center gap-3 text-red-600">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        actions={<AddButton onClick={openAdd}>{t("addIndustry")}</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> {t("industryCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["industry", "nameFr", "actions"] as const).map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="h-32 text-center text-slate-400 text-sm">
                    {t("noIndustries")}
                  </td>
                </tr>
              ) : (
                filtered.map((ind, i) => (
                  <motion.tr
                    key={ind.id}
                    {...rowAnim(i)}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 cursor-pointer" onClick={() => openView(ind)}>
                      <div className="flex items-center gap-3">
                        {ind.image ? (
                          <img
                            src={resolveImage(ind.image)}
                            alt={ind.name_en}
                            className="h-10 w-10 rounded-lg object-cover shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{ind.name_en}</p>
                          <p
                            className="text-xs text-slate-400"
                            dir="rtl"
                            style={{ fontFamily: "var(--font-arabic)" }}
                          >
                            {ind.name_ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 cursor-pointer" onClick={() => openView(ind)}>
                      <span className="text-slate-600">{ind.name_fr}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openView(ind)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-[#0A3D62] hover:bg-[#EBF3FB] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteId === ind.id ? (
                          <span className="flex items-center gap-1 text-xs">
                            <span className="text-slate-500">{t("confirmDelete")}</span>
                            <button
                              onClick={() => handleDelete(ind.id)}
                              disabled={deleting}
                              className="font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {tCommon("yes")}
                            </button>
                            <span className="text-slate-300">/</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="font-semibold text-slate-500 hover:text-slate-700"
                            >
                              {tCommon("no")}
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(ind.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {industries.length} {t("industryCountLabel")}
        </div>
      </div>

      <IndustrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        industry={selected}
        onSaved={handleSaved}
      />
    </div>
  );
}
