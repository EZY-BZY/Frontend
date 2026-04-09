"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Tag, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockCategories } from "../data/mock";

const COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

export function CategoriesView() {
  const [search, setSearch] = useState("");

  const filtered = mockCategories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 bg-white border-gray-200"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cat, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
            >
              {/* Icon */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-105"
                style={{ backgroundColor: color + "15" }}
              >
                <Tag className="h-5 w-5" style={{ color }} />
              </div>

              <h3 className="font-semibold text-gray-800 leading-tight mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{cat.description}</p>

              {/* Product count */}
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
                <Package className="h-3.5 w-3.5" />
                <span>{cat.productCount} products</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (cat.productCount / 50) * 100)}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          <strong className="text-gray-800">{filtered.length}</strong> categories
        </span>
        <span className="text-gray-500">
          Total products:{" "}
          <strong className="text-[#0A3D62]">
            {filtered.reduce((s, c) => s + c.productCount, 0)}
          </strong>
        </span>
      </div>
    </div>
  );
}
