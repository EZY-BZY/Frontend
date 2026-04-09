"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, LayoutGrid, LayoutList, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockProducts } from "../data/mock";
import type { ProductStatus } from "@/types";

const statusConfig: Record<ProductStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-500" },
  archived: { label: "Archived", cls: "bg-red-50 text-red-600" },
};

const categoryColors: Record<string, string> = {
  "Industrial Equipment": "#0A3D62",
  "Control Systems": "#28B8B1",
  "Measurement": "#6366f1",
  "Hydraulics": "#f59e0b",
  "Pneumatics": "#10b981",
  "Electrical": "#ec4899",
};

export function ProductsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "table">("table");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(mockProducts.map((p) => p.category)))],
    []
  );

  const filtered = useMemo(
    () =>
      mockProducts.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        const matchesCat = category === "all" || p.category === category;
        return matchesSearch && matchesCat;
      }),
    [search, category]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 bg-white border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setView("table")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${view === "table" ? "bg-[#0A3D62] text-white" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${view === "grid" ? "bg-[#0A3D62] text-white" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              category === c
                ? "bg-[#0A3D62] text-white border-[#0A3D62]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3D62] hover:text-[#0A3D62]"
            }`}
          >
            {c === "all" ? "All Categories" : c}
          </button>
        ))}
      </div>

      {view === "table" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Product", "SKU", "Category", "Price", "Stock", "Status"].map((col) => (
                    <th key={col} className="px-5 py-3.5 text-start font-semibold text-gray-500 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="h-32 text-center text-gray-400">No products found</td></tr>
                ) : (
                  filtered.map((p, i) => {
                    const s = statusConfig[p.status];
                    const catColor = categoryColors[p.category] ?? "#6b7280";
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: catColor + "20", color: catColor }}
                            >
                              <Package className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-semibold text-gray-800 leading-tight">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{p.sku}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: catColor + "15", color: catColor }}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">${p.price.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : p.stock < 20 ? "text-amber-600" : "text-gray-700"}`}>
                            {p.stock === 0 ? "Out of stock" : p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length} products
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const s = statusConfig[p.status];
            const catColor = categoryColors[p.category] ?? "#6b7280";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                  style={{ backgroundColor: catColor + "18" }}
                >
                  <Package className="h-6 w-6" style={{ color: catColor }} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#0A3D62]">${p.price.toLocaleString()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400 font-mono">{p.sku}</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
