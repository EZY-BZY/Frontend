"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FilterBar, DownloadButton } from "@/components/shared/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockSubscriptions, canCancel } from "../data/mock";
import type { Subscription, SubscriptionStatus } from "@/types";

/* ─── Status styling ─────────────────────────────────────────────── */
const statusCls: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  trial: "bg-blue-50 text-blue-700 border-blue-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
};

const planColor: Record<string, string> = {
  Starter: "#6366f1",
  Pro: "#28B8B1",
  Enterprise: "#0A3D62",
};

export function SubscriptionsView() {
  const [subs] = useState<Subscription[]>(mockSubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subs.filter((s) => {
      const matchesSearch = !search || s.clientName.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, subs]);

  const totalRevenue = filtered
    .filter((s) => s.status === "active" || s.status === "trial")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by client or plan…"
        filters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={<DownloadButton onClick={() => {}}>Export</DownloadButton>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active", count: subs.filter((s) => s.status === "active").length, color: "#10b981", bg: "#ECFDF5" },
          { label: "Trial", count: subs.filter((s) => s.status === "trial").length, color: "#6366f1", bg: "#EEF2FF" },
          { label: "Cancelled", count: subs.filter((s) => s.status === "cancelled").length, color: "#ef4444", bg: "#FFF1F2" },
          { label: "Expired", count: subs.filter((s) => s.status === "expired").length, color: "#94a3b8", bg: "#F8FAFC" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.bg }}>
              <span className="text-lg font-bold" style={{ color: item.color }}>{item.count}</span>
            </div>
            <span className="text-sm text-slate-500 font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-700">{filtered.length}</strong> subscriptions
          </span>
          <span className="text-xs font-semibold text-[#0A3D62]">
            Active MRR: ${totalRevenue.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["ID", "Client", "Plan", "Amount", "Status", "Start Date", "Cancellable"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400">No subscriptions found</td>
                </tr>
              ) : (
                filtered.map((sub, i) => {
                  const cancellable = canCancel(sub.startDate);
                  const color = planColor[sub.plan] ?? "#6366f1";
                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{sub.id.replace("SUB-", "")}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{sub.clientName}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: color + "18", color }}
                        >
                          {sub.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap" dir="ltr">
                        {sub.amount.toLocaleString()} {sub.currency}
                        <span className="text-xs text-slate-400">/yr</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCls[sub.status]}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap" dir="ltr">
                        {sub.startDate}
                      </td>
                      <td className="px-5 py-3.5">
                        {cancellable ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-xs font-medium">
                            ✓ Yes
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
