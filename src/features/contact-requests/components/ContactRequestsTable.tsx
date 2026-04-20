"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar, DownloadButton } from "@/components/shared/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockContactRequests } from "../data/mock";
import { getColumns } from "./columns";
import type { RequestStatus } from "@/types";

const ALL_STATUSES = ["new", "inProgress", "resolved", "closed"] as const;
const PAGE_SIZE = 7;

export const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-100",
  inProgress: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-red-50 text-red-600 border-red-100",
};

export function ContactRequestsTable() {
  const t = useTranslations("contactRequests");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [page, setPage] = useState(0);

  const columns = useMemo(
    () => getColumns({ t: (key) => t(key as Parameters<typeof t>[0]), showStatus: true }),
    [t]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockContactRequests.filter((req) => {
      const matchesSearch =
        !search ||
        req.clientName.toLowerCase().includes(q) ||
        req.phone.toLowerCase().includes(q) ||
        req.companyName.toLowerCase().includes(q);

      const matchesStatus = status === "all" || req.status === status;
      const matchesDate = !fromDate || req.date >= fromDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, status, fromDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const extraFilters = (
    <>
      {/* Status select */}
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
        <SelectTrigger className="h-10 w-40">
          <SelectValue placeholder={t("chooseStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("statuses.all")}</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`statuses.${s}` as Parameters<typeof t>[0])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date from */}
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
        className="h-10 w-40 border-slate-200 text-sm focus-visible:ring-[#28B8B1]"
      />
    </>
  );

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder={t("searchPlaceholderShort")}
        filters={extraFilters}
        actions={
          <DownloadButton onClick={() => {}}>{t("downloadReport")}</DownloadButton>
        }
      />

      {/* Table card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Results bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong>{" "}
            {t("totalRequests").toLowerCase()}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paged}
          emptyMessage={t("noRequests")}
          className="rounded-none border-0 shadow-none"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 rounded-b-2xl bg-[#0A3D62] px-5 py-2.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={t("previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setPage(i)}
                whileTap={{ scale: 0.9 }}
                className={`h-7 min-w-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                  i === page
                    ? "bg-white text-[#0A3D62]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={t("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
