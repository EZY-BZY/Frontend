"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Eye, CheckCircle2,
  XCircle, Loader2, MessageSquare,
} from "lucide-react";
import { FilterBar, DownloadButton } from "@/components/shared/FilterBar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  listContactRequests, getContactRequest, solveContactRequest,
} from "@/services/contact-requests";
import type { ContactRequestRead, ContactRequestApiStatus } from "@/types/api";

/* ─── Query key ──────────────────────────────────────────────────── */
export const CONTACT_REQUESTS_QUERY_KEY = ["contact-requests"] as const;

const PAGE_SIZE = 10;

/* ─── Status badge config ────────────────────────────────────────── */
const STATUS_STYLES: Record<ContactRequestApiStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-100",
  seen: "bg-amber-50 text-amber-700 border-amber-100",
  solved: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const STATUS_DOT: Record<ContactRequestApiStatus, string> = {
  new: "bg-blue-400",
  seen: "bg-amber-400",
  solved: "bg-emerald-400",
};
const ALL_STATUSES: ContactRequestApiStatus[] = ["new", "seen", "solved"];

function requesterInitials(name: string | null | undefined): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean);
  if (!parts?.length) return "?";
  return parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Toast ──────────────────────────────────────────────────────── */
type ToastItem = { id: number; type: "success" | "error"; message: string };

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 inset-e-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "border-emerald-100 bg-white text-emerald-700"
                : "border-red-100 bg-white text-red-600"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <XCircle className="h-4 w-4 shrink-0" />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Request detail sheet ───────────────────────────────────────── */
function RequestDetailSheet({
  requestId,
  open,
  onOpenChange,
  onSolved,
}: {
  requestId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSolved: () => void;
}) {
  const t = useTranslations("contactRequests");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const queryClient = useQueryClient();

  /* Auto-marks as 'seen' when fetched (API behaviour) */
  const { data: req, isFetching } = useQuery({
    queryKey: [...CONTACT_REQUESTS_QUERY_KEY, "detail", requestId],
    queryFn: async () => {
      const res = await getContactRequest(requestId!);
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    enabled: open && !!requestId,
    staleTime: 0,
  });

  /* Invalidate the list so status changes to 'seen' are reflected */
  useEffect(() => {
    if (open && requestId) {
      queryClient.invalidateQueries({ queryKey: CONTACT_REQUESTS_QUERY_KEY });
    }
  }, [open, requestId, queryClient]);

  const solveMutation = useMutation({
    mutationFn: async () => {
      const res = await solveContactRequest(requestId!);
      if (res.status_code >= 400) throw new Error(res.Message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_REQUESTS_QUERY_KEY });
      onOpenChange(false);
      onSolved();
    },
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#0A3D62]" />
            {t("detailSheet.title")}
          </SheetTitle>
          <SheetDescription>{t("detailSheet.desc")}</SheetDescription>
        </SheetHeader>

        {isFetching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : req ? (
          <div className="px-6 py-6 space-y-5">
            {/* Status */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_STYLES[req.status]}`}
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[req.status]}`} />
              {t(`statuses.${req.status}`)}
            </span>

            {/* Requester info */}
            <div className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("clientName")}</p>
                <p className="font-semibold text-slate-800">{req.requester_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("phone")}</p>
                <p className="font-mono text-slate-700" dir="ltr">{req.phone}</p>
              </div>
              {req.company_name && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("companyName")}</p>
                  <p className="text-slate-700">{req.company_name}</p>
                </div>
              )}
              {req.request_type && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("requestType")}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                    {req.request_type}
                  </span>
                </div>
              )}
            </div>

            {/* Message */}
            {req.message && (
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{t("message")}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{req.message}</p>
              </div>
            )}

            {/* Date */}
            <p className="text-xs text-slate-400">
              {t("requestedAt")}:{" "}
              <span className="font-mono">{fmtDate(req.created_at)}</span>
            </p>
          </div>
        ) : null}

        <SheetFooter className="px-6 py-4 gap-3">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1">{tCommon("close")}</Button>
          </SheetClose>
          {req && req.status !== "solved" && (
            <Button
              onClick={() => solveMutation.mutate()}
              disabled={solveMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {solveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("solving")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("markAsSolved")}
                </>
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main table component ───────────────────────────────────────── */
export function ContactRequestsTable() {
  const t = useTranslations("contactRequests");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ── Query ───────────────────────────────────────────────────── */
  const { data, isFetching, isError } = useQuery({
    queryKey: [
      ...CONTACT_REQUESTS_QUERY_KEY,
      { search, status, page },
    ],
    queryFn: async () => {
      const res = await listContactRequests({
        search: search || null,
        status: status !== "all" ? (status as ContactRequestApiStatus) : null,
        page,
        page_size: PAGE_SIZE,
      });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    placeholderData: (prev) => prev,
  });

  const requests = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const openDetail = (req: ContactRequestRead) => {
    setViewId(req.id);
    setSheetOpen(true);
  };

  const extraFilters = (
    <>
      <Select
        value={status}
        onValueChange={(v) => { setStatus(v); setPage(1); }}
      >
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
    </>
  );

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={t("searchPlaceholderShort")}
        filters={extraFilters}
        actions={
          <DownloadButton onClick={() => {}}>{t("downloadReport")}</DownloadButton>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Results bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              <>
                <strong className="text-slate-700">{total}</strong>{" "}
                {t("totalRequests").toLowerCase()}
              </>
            )}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {([
                  { key: "clientName", label: t("clientName") },
                  { key: "phone", label: t("phone") },
                  { key: "companyName", label: t("companyName") },
                  { key: "requestType", label: t("requestType") },
                  { key: "status", label: t("status") },
                  { key: "sentAt", label: t("sentAt") },
                  { key: "actions", label: tCommon("actions") },
                ] as const).map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-red-400 text-sm">
                    {tCommon("error")}
                  </td>
                </tr>
              ) : requests.length === 0 && !isFetching ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400 text-sm">
                    {t("noRequests")}
                  </td>
                </tr>
              ) : (
                requests.map((req, i) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetail(req)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail(req);
                      }
                    }}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B1]/40 focus-visible:ring-inset"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF3FB] text-[#0A3D62] text-[10px] font-bold select-none">
                          {requesterInitials(req.requester_name)}
                        </span>
                        <span className="font-medium text-slate-800">{req.requester_name ?? "—"}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5">
                      <span className="text-slate-500 text-sm font-mono whitespace-nowrap" dir="ltr">
                        {req.phone}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5 text-slate-600 text-sm">
                      {req.company_name ?? "—"}
                    </td>

                    {/* Request type */}
                    <td className="px-5 py-3.5">
                      {req.request_type ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                          {req.request_type}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[req.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[req.status]}`} />
                        {t(`statuses.${req.status}` as Parameters<typeof t>[0])}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap font-mono">
                      {fmtDate(req.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(req);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-[#28B8B1] hover:text-[#28B8B1] transition-colors"
                        title={t("viewRequest")}
                        aria-label={t("viewRequest")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}

              {/* Skeletons */}
              {isFetching && requests.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-slate-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 rounded-b-2xl bg-[#0A3D62] px-5 py-2.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={tCommon("previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <motion.button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  whileTap={{ scale: 0.9 }}
                  className={`h-7 min-w-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                    pageNum === page
                      ? "bg-white text-[#0A3D62]"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={tCommon("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detail sheet */}
      <RequestDetailSheet
        requestId={viewId}
        open={sheetOpen}
        onOpenChange={(v) => { setSheetOpen(v); if (!v) setViewId(null); }}
        onSolved={() => addToast("success", t("toast.solveSuccess"))}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}
