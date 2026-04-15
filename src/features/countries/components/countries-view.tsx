"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { CountrySheet } from "./country-sheet";
import { mockCountries } from "@/features/countries/data/mock";
import type { Country } from "@/types";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

export function CountriesView() {
  const locale = useLocale();
  const [countries, setCountries] = useState<Country[]>([...mockCountries]);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Country | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_ar.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.currencyEn.toLowerCase().includes(q) ||
        c.phoneCode.includes(q)
    );
  }, [search, countries]);

  const openAdd = () => { setSelected(undefined); setSheetOpen(true); };
  const openView = (country: Country) => { setSelected(country); setSheetOpen(true); };

  const handleSaved = (saved: Country) => {
    setCountries((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const currencyKey = locale === "ar" ? "currencyAr" : locale === "fr" ? "currencyFr" : "currencyEn";

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, ISO, phone code or currency…"
        actions={<AddButton onClick={openAdd}>Add Country</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Summary */}
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> countries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Flag & Name", "ISO", "Phone Code", "Currency", "Regex Field", "Added"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                    No countries found
                  </td>
                </tr>
              ) : (
                filtered.map((country, i) => (
                  <motion.tr
                    key={country.id}
                    {...rowAnim(i)}
                    onClick={() => openView(country)}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 cursor-pointer transition-colors"
                  >
                    {/* Flag + Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{country.flag}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{country.name_en}</p>
                          <p className="text-xs text-slate-400" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>
                            {country.name_ar}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ISO */}
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {country.iso}
                      </span>
                    </td>

                    {/* Phone Code */}
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#E6F7F7] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#28B8B1]" dir="ltr">
                        {country.phoneCode}
                      </span>
                    </td>

                    {/* Currency */}
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#EBF3FB] px-2.5 py-0.5 text-xs font-semibold text-[#0A3D62]">
                        {country[currencyKey]}
                      </span>
                    </td>

                    {/* Regex */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-400 truncate max-w-32 block" title={country.regex}>
                        {country.regex}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(country.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} of {countries.length} countries
        </div>
      </div>

      <CountrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        country={selected}
        onSaved={handleSaved}
      />
    </div>
  );
}
