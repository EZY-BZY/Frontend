"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Tag, Package } from "lucide-react";
import type { Category } from "@/types";

const COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

interface CatColumnsOptions {
  locale: string;
  onEdit?: (cat: Category) => void;
  /** All categories — used to resolve parent names */
  allCategories?: Category[];
}

export function getCategoryColumns({ locale, onEdit, allCategories = [] }: CatColumnsOptions): ColumnDef<Category>[] {
  const nameKey = locale === "ar" ? "name_ar" : locale === "fr" ? "name_fr" : "name_en";

  const parentMap = Object.fromEntries(allCategories.map((c) => [c.id, c]));

  return [
    {
      id: "name",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</span>
      ),
      cell: ({ row, table }) => {
        const idx = table.getRowModel().rows.findIndex((r) => r.id === row.id);
        const color = COLORS[idx % COLORS.length];
        const parent = row.original.parentId ? parentMap[row.original.parentId] : undefined;
        return (
          <div className="flex items-center gap-3">
            {/* Icon: emoji if available, else colored Tag */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: color + "18" }}
            >
              {row.original.iconEmoji ? (
                row.original.iconEmoji
              ) : (
                <Tag className="h-4 w-4" style={{ color }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{row.original[nameKey]}</p>
                {parent && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    ↳ {parent[nameKey]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-64">
                {row.original[locale === "ar" ? "description_ar" : locale === "fr" ? "description_fr" : "description_en"]}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-400">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "productCount",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Products</span>
      ),
      cell: ({ row, table }) => {
        const idx = table.getRowModel().rows.findIndex((r) => r.id === row.id);
        const color = COLORS[idx % COLORS.length];
        return (
          <div className="flex items-center gap-2.5 min-w-32">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: color + "18", color }}
            >
              <Package className="h-3 w-3" />
              {row.original.productCount}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (row.original.productCount / 50) * 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(row.original.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    ...(onEdit
      ? [{
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }: { row: { original: Category } }) => (
            <button
              onClick={() => onEdit(row.original)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
            >
              Edit
            </button>
          ),
        } satisfies ColumnDef<Category>]
      : []),
  ];
}
