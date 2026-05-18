"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FilterBar } from "@/components/shared/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockCategoriesByUsers,
  mockCategoriesByAdmins,
} from "../data/categories-tabs-mock";
import type { Category } from "@/types";

const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

function CategoryTable({
  data,
  emptyKey,
}: {
  data: Category[];
  emptyKey: "noCategoriesByUsers" | "noCategoriesByAdmins";
}) {
  const locale = useLocale();
  const t = useTranslations("userCategories");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_ar.toLowerCase().includes(q) ||
        c.name_fr.toLowerCase().includes(q)
    );
  }, [search, data]);

  const dateFormatter = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-GB",
      { day: "2-digit", month: "short", year: "numeric" }
    );

  return (
    <div className="space-y-4 pt-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong>{" "}
            {t("categoryCountLabel")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["category", "description", "products", "createdAt"] as const).map((h) => (
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
                  <td colSpan={4} className="h-32 text-center text-slate-400 text-sm">
                    {t(emptyKey)}
                  </td>
                </tr>
              ) : (
                filtered.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    {...rowAnim(i)}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl select-none">
                          {cat.iconEmoji}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{cat.name_en}</p>
                          <p
                            className="text-xs text-slate-400"
                            dir="rtl"
                          >
                            {cat.name_ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-xs truncate">
                      {cat.description_en}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-semibold">
                        {cat.productCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {dateFormatter(cat.createdAt)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
          {filtered.length} {tCommon("of")} {data.length} {t("categoryCountLabel")}
        </div>
      </div>
    </div>
  );
}

export function CategoriesTabsView() {
  const t = useTranslations("userCategories");

  return (
    <Tabs defaultValue="byUsers">
      <TabsList className="rounded-xl bg-slate-100 p-1">
        <TabsTrigger value="byUsers" className="rounded-lg text-sm px-5">
          {t("tabsByUsers")}
        </TabsTrigger>
        <TabsTrigger value="byAdmins" className="rounded-lg text-sm px-5">
          {t("tabsByAdmins")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="byUsers">
        <CategoryTable
          data={mockCategoriesByUsers}
          emptyKey="noCategoriesByUsers"
        />
      </TabsContent>

      <TabsContent value="byAdmins">
        <CategoryTable
          data={mockCategoriesByAdmins}
          emptyKey="noCategoriesByAdmins"
        />
      </TabsContent>
    </Tabs>
  );
}
