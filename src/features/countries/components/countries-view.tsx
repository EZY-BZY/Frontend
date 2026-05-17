"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { CountrySheet } from "./country-sheet";
import { apiClient } from "@/lib/api-client";
import type { CountryRead, PaginatedResponse } from "@/types/api";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

export function CountriesView() {
  const locale = useLocale();
  const t = useTranslations("countries");
  const tCommon = useTranslations("common");

  const [countries, setCountries] = useState<CountryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<CountryRead | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiClient.get<PaginatedResponse<CountryRead>>(
      "/api/v1/public/countries",
      { params: { page: 1, page_size: 100 } }
    );
    if (res.Data) {
      setCountries(res.Data.items ?? []);
    } else {
      setError(res.Message || tCommon("noResults"));
    }
    setLoading(false);
  }, [tCommon]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_ar.toLowerCase().includes(q) ||
        c.name_fr.toLowerCase().includes(q) ||
        c.phone_code.includes(q) ||
        c.currency_name_en.toLowerCase().includes(q)
    );
  }, [search, countries]);

  const openAdd = () => { setSelected(undefined); setSheetOpen(true); };
  const openView = (country: CountryRead) => { setSelected(country); setSheetOpen(true); };

  const handleSaved = (saved: CountryRead) => {
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

  const currencyKey =
    locale === "ar" ? "currency_name_ar" :
    locale === "fr" ? "currency_name_fr" :
    "currency_name_en";

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
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-100 animate-pulse" style={{ width: `${55 + (j * 12) % 40}%` }} />
                    </td>
                  ))}
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
        actions={<AddButton onClick={openAdd}>{t("addCountry")}</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> {t("countryCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["flagName", "phoneCode", "currency", "regexField", "added"] as const).map((h) => (
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
                  <td colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                    {t("noCountries")}
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{country.flag_emoji}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{country.name_en}</p>
                          <p
                            className="text-xs text-slate-400"
                            dir="rtl"
                            style={{ fontFamily: "var(--font-arabic)" }}
                          >
                            {country.name_ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="rounded-full bg-[#E6F7F7] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#28B8B1]"
                        dir="ltr"
                      >
                        {country.phone_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#EBF3FB] px-2.5 py-0.5 text-xs font-semibold text-[#0A3D62]">
                        {country[currencyKey]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-xs text-slate-400 truncate max-w-32 block"
                        title={country.phone_regex}
                      >
                        {country.phone_regex}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(country.created_at).toLocaleDateString(
                        locale === "ar" ? "ar-EG" : "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {countries.length} {t("countryCountLabel")}
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
