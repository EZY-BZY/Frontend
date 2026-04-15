"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { getCategoryColumns } from "./categories-table";
import { CategorySheet } from "./categories-sheet";
import { mockCategories } from "../data/mock";
import type { Category } from "@/types";

export function CategoriesView() {
  const locale = useLocale();

  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        !search ||
        c.name_en.toLowerCase().includes(q) ||
        c.name_ar.toLowerCase().includes(q) ||
        c.description_en.toLowerCase().includes(q)
    );
  }, [search, categories]);

  const columns = useMemo(
    () => getCategoryColumns({ locale, allCategories: categories, onEdit: (cat) => { setEditing(cat); setSheetOpen(true); } }),
    [locale, categories]
  );

  const openAdd = () => { setEditing(undefined); setSheetOpen(true); };

  const handleSaved = (cat: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = cat;
        return next;
      }
      return [cat, ...prev];
    });
  };

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories…"
        actions={
          <AddButton onClick={openAdd}>Add Category</AddButton>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Summary bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> categories
          </span>
          <span className="text-xs text-slate-400">
            Total products:{" "}
            <strong className="text-[#0A3D62]">
              {filtered.reduce((s, c) => s + c.productCount, 0)}
            </strong>
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No categories found"
          className="rounded-none border-0 shadow-none"
        />
      </div>

      <CategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={editing}
        allCategories={categories}
        onSaved={handleSaved}
      />
    </div>
  );
}
