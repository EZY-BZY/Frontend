"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, FileText, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockCatalogItems } from "../data/mock";

const langConfig: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  ar: { label: "العربية", flag: "🇸🇦" },
  fr: { label: "Français", flag: "🇫🇷" },
};

const COLORS = ["#0A3D62", "#28B8B1", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export function ECatalogView() {
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");

  const filtered = useMemo(
    () =>
      mockCatalogItems.filter((item) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        const matchesLang = lang === "all" || item.language === lang;
        return matchesSearch && matchesLang;
      }),
    [search, lang]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search catalogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 bg-white border-gray-200"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "en", "ar", "fr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                lang === l
                  ? "bg-[#0A3D62] text-white border-[#0A3D62]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3D62]"
              }`}
            >
              {l !== "all" && <span>{langConfig[l]?.flag}</span>}
              {l === "all" ? "All Languages" : langConfig[l]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item, i) => {
          const color = COLORS[i % COLORS.length];
          const lc = langConfig[item.language];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card header */}
              <div
                className="h-28 flex items-center justify-center relative"
                style={{ backgroundColor: color + "12" }}
              >
                <BookOpen className="h-12 w-12" style={{ color }} />
                {/* Pages badge */}
                <span className="absolute top-2 inset-e-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-600 flex items-center gap-1 shadow-sm">
                  <FileText className="h-3 w-3" />
                  {item.pages}p
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{item.title}</h3>
                  <span className="shrink-0 text-sm">{lc?.flag}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: color + "15", color }}
                  >
                    {item.category}
                  </span>
                  <button className="flex items-center gap-1 text-xs font-medium text-[#28B8B1] hover:text-[#0A3D62] transition-colors">
                    <Globe className="h-3 w-3" />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-xs text-gray-400">
        {filtered.length} catalog items
      </div>
    </div>
  );
}
