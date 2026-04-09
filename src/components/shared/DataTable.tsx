"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage,
  className,
}: DataTableProps<TData>) {
  const t = useTranslations("common");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {table.getHeaderGroups()[0]?.headers.map((header) => (
              <th
                key={header.id}
                className="px-5 py-3 text-start align-middle whitespace-nowrap"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-gray-400"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A3D62] border-t-transparent" />
                  {t("loading")}
                </span>
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-gray-400"
              >
                {emptyMessage ?? t("noResults")}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
