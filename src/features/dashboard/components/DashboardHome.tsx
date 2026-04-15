"use client";

import { motion } from "framer-motion";
import {
  Users, MessageSquare, Tag, TrendingUp, TrendingDown,
  Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { mockEmployees } from "@/features/employees/data/mock";
import { mockContactRequests } from "@/features/contact-requests/data/mock";
import { mockCategories } from "@/features/categories/data/mock";

/* ─── Types ──────────────────────────────────────────────────────── */
interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  href: string;
}

/* ─── Revenue chart mock data ────────────────────────────────────── */
const revenueData = [
  { month: "Oct", revenue: 18400, subscriptions: 21 },
  { month: "Nov", revenue: 22100, subscriptions: 27 },
  { month: "Dec", revenue: 19800, subscriptions: 24 },
  { month: "Jan", revenue: 27500, subscriptions: 33 },
  { month: "Feb", revenue: 31200, subscriptions: 38 },
  { month: "Mar", revenue: 29400, subscriptions: 35 },
  { month: "Apr", revenue: 38600, subscriptions: 46 },
];

/* ─── Custom tooltip ─────────────────────────────────────────────── */
function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-[#0A3D62] font-bold">${payload[0].value.toLocaleString()}</p>
      {payload[1] && (
        <p className="text-[#28B8B1] text-xs">{payload[1].value} subscriptions</p>
      )}
    </div>
  );
}

const statusBadge: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  inProgress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-red-50 text-red-600",
};

export function DashboardHome() {
  const locale = useLocale();

  const activeEmployees = mockEmployees.filter((e) => e.status === "active").length;
  const openRequests = mockContactRequests.filter((r) => r.status === "new" || r.status === "inProgress").length;
  const recentRequests = mockContactRequests.slice(0, 5);

  const stats: StatCard[] = [
    {
      label: "Total Employees",
      value: mockEmployees.length,
      icon: Users,
      color: "#0A3D62",
      bg: "#EBF3FB",
      delta: "+2 this month",
      trend: "up",
      href: `/${locale}/employees`,
    },
    {
      label: "Contact Requests",
      value: mockContactRequests.length,
      icon: MessageSquare,
      color: "#6366f1",
      bg: "#EEF2FF",
      delta: `${mockContactRequests.filter((r) => r.status === "new").length} new`,
      trend: "up",
      href: `/${locale}/contact-requests`,
    },
    {
      label: "Categories",
      value: mockCategories.length,
      icon: Tag,
      color: "#f59e0b",
      bg: "#FFFBEB",
      delta: `${mockCategories.reduce((s, c) => s + c.productCount, 0)} total products`,
      trend: "neutral",
      href: `/${locale}/categories`,
    },
    {
      label: "Active Employees",
      value: activeEmployees,
      icon: Users,
      color: "#10b981",
      bg: "#ECFDF5",
      delta: `${mockEmployees.filter((e) => e.status === "onLeave").length} on leave`,
      trend: "up",
      href: `/${locale}/employees`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: "easeOut" }}
          >
            <Link
              href={stat.href}
              className="group block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
              </div>
              <motion.p
                className="text-3xl font-bold text-gray-800 mb-1 tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.15 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
              <p className="text-xs font-semibold" style={{ color: stat.color }}>
                {stat.delta}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Alert strip ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-emerald-700 font-medium">{activeEmployees} employees active</span>
        </div>
        {openRequests > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm">
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-blue-700 font-medium">{openRequests} open requests</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-amber-700 font-medium">{mockCategories.length} active categories</span>
        </div>
      </motion.div>

      {/* ── Chart + Recent requests ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="font-semibold text-gray-800">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
              <TrendingUp className="h-3.5 w-3.5" />
              +31% vs last quarter
            </div>
          </div>
          <div className="px-2 pt-4 pb-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A3D62" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0A3D62" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28B8B1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#28B8B1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0A3D62"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#0A3D62", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#28B8B1"
                  strokeWidth={2}
                  fill="url(#subGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#28B8B1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent contact requests */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Requests</h2>
            <Link
              href={`/${locale}/contact-requests`}
              className="text-xs font-medium text-[#28B8B1] hover:text-[#0A3D62] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52 + i * 0.05 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBF3FB] text-[#0A3D62] text-[10px] font-bold">
                  {req.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{req.clientName}</p>
                  <p className="text-xs text-gray-400 truncate" dir="ltr">{req.countryCode} {req.phone}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[req.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {req.status === "inProgress" ? "In Progress" : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Department breakdown ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">Team by Position</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5">
          {(["Admin", "Support"] as const).map((pos, i) => {
            const count = mockEmployees.filter((e) => e.position === pos).length;
            const pct = Math.round((count / mockEmployees.length) * 100);
            const color = i === 0 ? "#0A3D62" : "#28B8B1";
            return (
              <div key={pos}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{pos}</span>
                  <span className="text-sm font-bold text-gray-800">{count} <span className="text-xs font-normal text-gray-400">({pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.65 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
