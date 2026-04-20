"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GovernorateSheet } from "./governorate-sheet";
import { mockGovernorates } from "@/features/governorates/data/mock";
import { mockCountries } from "@/features/countries/data/mock";
import type { Country, Governorate } from "@/types";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

export function GovernoratesView() {
  const t = useTranslations("governorates");
  const tCommon = useTranslations("common");

  const [governorates, setGovernorates] = useState<Governorate[]>([...mockGovernorates]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Governorate | undefined>(undefined);

  const countryMap = useMemo(
    () => Object.fromEntries(mockCountries.map((c) => [c.id, c])) as Record<string, Country>,
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return governorates.filter((g) => {
      const matchesSearch = !q || g.name_en.toLowerCase().includes(q) || g.name_ar.toLowerCase().includes(q);
      const matchesCountry = countryFilter === "all" || g.countryId === countryFilter;
      return matchesSearch && matchesCountry;
    });
  }, [search, countryFilter, governorates]);

  const openAdd = () => { setEditing(undefined); setSheetOpen(true); };
  const openEdit = (g: Governorate) => { setEditing(g); setSheetOpen(true); };

  const handleSaved = (saved: Governorate) => {
    setGovernorates((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="h-10 w-44">
              <SelectValue placeholder={t("allCountries")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCountries")}</SelectItem>
              {mockCountries.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name_en}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actions={<AddButton onClick={openAdd}>{t("addGovernorates")}</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> {t("governorateCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["governorate", "country", "added", "actions"] as const).map((h) => (
                  <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {t(`col.${h}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center text-slate-400 text-sm">{t("noGovernorates")}</td>
                </tr>
              ) : (
                filtered.map((gov, i) => {
                  const country = countryMap[gov.countryId];
                  return (
                    <motion.tr key={gov.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{gov.name_en}</p>
                        <p className="text-xs text-slate-400" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>{gov.name_ar}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {country ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            <span>{country.flag}</span>
                            {country.name_en}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(gov.createdAt).toLocaleDateString(useLocale() === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openEdit(gov)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
                        >
                          {tCommon("edit")}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {governorates.length} {t("governorateCountLabel")}
        </div>
      </div>

      <GovernorateSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        governorate={editing}
        countries={mockCountries}
        onSaved={handleSaved}
      />
    </div>
  );
}
