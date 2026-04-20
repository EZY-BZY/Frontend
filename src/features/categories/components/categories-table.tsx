"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category } from "@/types";

const COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

interface CatColumnsOptions {
  locale: string;
  onEdit?: (cat: Category) => void;
  allCategories?: Category[];
}

export function getCategoryColumns({ locale, onEdit, allCategories = [] }: CatColumnsOptions): ColumnDef<Category>[] {
  const nameKey = locale === "ar" ? "name_ar" : locale === "fr" ? "name_fr" : "name_en";

  const parentMap = Object.fromEntries(allCategories.map((c) => [c.id, c]));

  return [
    {
      id: "name",
      header: () => <CategoryColHeader colKey="category" />,
      cell: ({ row, table }) => {
        const idx = table.getRowModel().rows.findIndex((r) => r.id === row.id);
        const color = COLORS[idx % COLORS.length];
        const parent = row.original.parentId ? parentMap[row.original.parentId] : undefined;
        return (
          <div className="flex items-center gap-3">
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
      header: () => <CategoryColHeader colKey="slug" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-400">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <CategoryColHeader colKey="created" />,
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(row.original.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    ...(onEdit
      ? [{
          id: "actions",
          header: () => <ActionsHeader />,
          cell: ({ row }: { row: { original: Category } }) => (
            <EditButton onEdit={onEdit} row={row.original} />
          ),
        } satisfies ColumnDef<Category>]
      : []),
  ];
}

function CategoryColHeader({ colKey }: { colKey: "category" | "slug" | "created" }) {
  const t = useTranslations("categories");
  return (
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {t(`col.${colKey}`)}
    </span>
  );
}

function ActionsHeader() {
  const t = useTranslations("common");
  return <span className="sr-only">{t("actions")}</span>;
}

function EditButton({ onEdit, row }: { onEdit: (cat: Category) => void; row: Category }) {
  const t = useTranslations("common");
  return (
    <button
      onClick={() => onEdit(row)}
      className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
    >
      {t("edit")}
    </button>
  );
}
