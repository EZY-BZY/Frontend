"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { CompanySheet } from "./company-sheet";
import { mockCompanies } from "@/features/companies/data/mock";
import { mockCountries } from "@/features/countries/data/mock";
import type { Company, Country } from "@/types";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

export function CompaniesView() {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");

  const [companies, setCompanies] = useState<Company[]>([...mockCompanies]);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Company | undefined>(undefined);

  const countryMap = useMemo(
    () => Object.fromEntries(mockCountries.map((c) => [c.id, c])) as Record<string, Country>,
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) => c.name_en.toLowerCase().includes(q) || c.name_ar.toLowerCase().includes(q)
    );
  }, [search, companies]);

  const openAdd = () => { setEditing(undefined); setSheetOpen(true); };
  const openEdit = (company: Company) => { setEditing(company); setSheetOpen(true); };

  const handleSaved = (saved: Company) => {
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
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
        actions={<AddButton onClick={openAdd}>{t("addCompany")}</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> {t("companyCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["company", "operatingIn", "added", "actions"] as const).map((h) => (
                  <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {t(`col.${h}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center text-slate-400 text-sm">{t("noCompanies")}</td>
                </tr>
              ) : (
                filtered.map((company, i) => (
                  <motion.tr key={company.id} {...rowAnim(i)} className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB] text-xl">
                          {company.logo ?? "🏢"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{company.name_en}</p>
                          <p className="text-xs text-slate-400" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>{company.name_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {company.operatingIn.map((cid) => {
                          const country = countryMap[cid];
                          if (!country) return null;
                          return (
                            <span key={cid} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              <span>{country.flag}</span>
                              {country.iso}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(company.createdAt).toLocaleDateString(useLocale() === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openEdit(company)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
                      >
                        {tCommon("edit")}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {companies.length} {t("companyCountLabel")}
        </div>
      </div>

      <CompanySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={editing}
        countries={mockCountries}
        onSaved={handleSaved}
      />
    </div>
  );
}
