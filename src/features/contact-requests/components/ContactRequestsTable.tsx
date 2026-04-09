"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Info, Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { mockContactRequests, type RequestStatus } from "../data/mock";
import { getColumns } from "./columns";

const ALL_STATUSES = ["", "new", "inProgress", "resolved", "closed"] as const;
const PAGE_SIZE = 7;

/* Status badge styling */
export const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-100",
  inProgress: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-red-50 text-red-600 border-red-100",
};

export const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  inProgress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function ContactRequestsTable() {
  const t = useTranslations("contactRequests");

  /* ── Raw filter inputs (pending "Apply") ── */
  const [search, setSearch] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [respondDate, setRespondDate] = useState("");
  const [status, setStatus] = useState<string>("");
  const [requestDate2, setRequestDate2] = useState("");

  /* ── Applied filters ── */
  const [applied, setApplied] = useState({
    search: "",
    requestDate: "",
    respondDate: "",
    status: "",
    requestDate2: "",
  });

  const [page, setPage] = useState(0);

  const columns = useMemo(
    () => getColumns({ t: (key) => t(key as Parameters<typeof t>[0]), showStatus: true }),
    [t]
  );

  const filtered = useMemo(() => {
    return mockContactRequests.filter((req) => {
      const q = applied.search.toLowerCase();
      const matchesSearch =
        !applied.search ||
        req.clientName.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.companyName.toLowerCase().includes(q);

      const matchesStatus = !applied.status || req.status === applied.status;
      const matchesDate = !applied.requestDate || req.date >= applied.requestDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applied]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const applyFilters = () => {
    setApplied({ search, requestDate, respondDate, status, requestDate2 });
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* ── Filter card ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="px-5 py-4 space-y-4">

          {/* Row 1: Search | Request Date | Respond Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t("search")}
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </label>
              <div className="relative">
                <Search className="absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder={t("searchPlaceholderShort")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-9 h-10 border-slate-200 focus-visible:ring-[#28B8B1] text-sm"
                />
              </div>
            </div>

            {/* Request Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t("requestDate")}
              </label>
              <Input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="h-10 border-slate-200 focus-visible:ring-[#28B8B1] text-sm"
              />
            </div>

            {/* Respond Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t("respondDate")}
              </label>
              <Input
                type="date"
                value={respondDate}
                onChange={(e) => setRespondDate(e.target.value)}
                className="h-10 border-slate-200 focus-visible:ring-[#28B8B1] text-sm"
              />
            </div>
          </div>

          {/* Row 2: Status | Request Date | [spacer] | Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t("status")}
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pe-8 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 cursor-pointer"
                >
                  <option value="">{t("chooseStatus")}</option>
                  {(ALL_STATUSES.filter(Boolean) as RequestStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {t(`statuses.${s}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Second date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t("requestDate")}
              </label>
              <Input
                type="date"
                value={requestDate2}
                onChange={(e) => setRequestDate2(e.target.value)}
                className="h-10 border-slate-200 focus-visible:ring-[#28B8B1] text-sm"
              />
            </div>

            {/* Spacer (hidden on small screens) */}
            <div className="hidden lg:block" />

            {/* Action buttons */}
            <div className="flex gap-2.5 items-end">
              <button
                onClick={applyFilters}
                className="flex-1 h-10 rounded-xl bg-[#0A3D62] px-4 text-sm font-semibold text-white hover:bg-[#0A3D62]/90 active:scale-[0.98] transition-all shadow-sm"
              >
                {t("applyFilter")}
              </button>
              <button className="flex items-center gap-1.5 h-10 rounded-xl bg-[#28B8B1] px-4 text-sm font-semibold text-white hover:bg-[#28B8B1]/90 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap">
                {t("downloadReport")}
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Results info bar ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> {t("totalRequests").toLowerCase()}
          </span>
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          data={paged}
          emptyMessage={t("noRequests")}
          className="rounded-none border-0 shadow-none"
        />

        {/* ── Pagination bar ── */}
        <div className="flex items-center justify-between gap-2 rounded-b-2xl bg-[#0A3D62] px-5 py-2.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setPage(i)}
                whileTap={{ scale: 0.9 }}
                className={`h-7 min-w-[28px] rounded-lg px-2 text-xs font-semibold transition-colors ${
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
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
