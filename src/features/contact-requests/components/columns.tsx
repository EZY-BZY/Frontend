"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Copy, Eye } from "lucide-react";
import type { ContactRequest, RequestStatus } from "../data/mock";

/* ─── Status badge config ─────────────────────────────────────── */
const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-100",
  inProgress: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-red-50 text-red-600 border-red-100",
};

const statusDot: Record<RequestStatus, string> = {
  new: "bg-blue-400",
  inProgress: "bg-amber-400",
  resolved: "bg-emerald-400",
  closed: "bg-red-400",
};

interface ColumnsOptions {
  t: (key: string) => string;
  showStatus?: boolean;
  showActions?: boolean;
}

export function getColumns({
  t,
  showStatus = true,
  showActions = false,
}: ColumnsOptions): ColumnDef<ContactRequest>[] {
  const cols: ColumnDef<ContactRequest>[] = [
    {
      accessorKey: "id",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("id")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-400">
          #{row.original.id.replace("REQ-", "")}
        </span>
      ),
      size: 72,
    },
    {
      accessorKey: "clientName",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("clientName")}
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF3FB] text-[#0A3D62] text-[10px] font-bold select-none">
            {row.original.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <span className="font-medium text-slate-800 text-sm">{row.original.clientName}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("email")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-slate-500 text-sm">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "companyName",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("companyName")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">{row.original.companyName}</span>
      ),
    },
  ];

  if (showStatus) {
    cols.push({
      accessorKey: "status",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("status")}
        </span>
      ),
      cell: ({ row }) => {
        const s = row.original.status;
        const label = t(`statuses.${s}`);
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[s]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
            {label}
          </span>
        );
      },
    });
  }

  cols.push({
    accessorKey: "date",
    header: () => (
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {t("sentAt")}
      </span>
    ),
    cell: ({ row }) => {
      try {
        return (
          <span className="text-slate-400 text-xs whitespace-nowrap font-mono">
            {format(new Date(row.original.date), "yyyy-MM-dd HH:mm")}
          </span>
        );
      } catch {
        return row.original.date;
      }
    },
  });

  if (showActions) {
    cols.push({
      id: "actions",
      header: () => (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("actions")}
        </span>
      ),
      cell: () => (
        <div className="flex items-center gap-1.5">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-[#28B8B1] hover:text-[#28B8B1] transition-colors"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-[#28B8B1] hover:text-[#28B8B1] transition-colors"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    });
  }

  return cols;
}
