"use client";

import { motion } from "framer-motion";
import {
  Users, TrendingUp, TrendingDown, Briefcase, UserCircle2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { mockEmployees } from "@/features/employees/data/mock";

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
function RevenueTooltip({ active, payload, label, subscriptionsLabel }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  subscriptionsLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-[#0A3D62] font-bold">${payload[0].value.toLocaleString()}</p>
      {payload[1] && (
        <p className="text-[#28B8B1] text-xs">{payload[1].value} {subscriptionsLabel}</p>
      )}
    </div>
  );
}

export function DashboardHome() {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  const activeEmployees = mockEmployees.filter((e) => e.status === "active").length;

  const stats: StatCard[] = [
    {
      label: t("totalEmployees"),
      value: mockEmployees.length,
      icon: Users,
      color: "#0A3D62",
      bg: "#EBF3FB",
      delta: t("deltaThisMonth"),
      trend: "up",
      href: `/${locale}/employees`,
    },
    {
      label: t("totalCompanies"),
      value: 24,
      icon: Briefcase,
      color: "#28B8B1",
      bg: "#E6F7F7",
      delta: t("deltaCompanies", { count: 24 }),
      trend: "up",
      href: `/${locale}/companies`,
    },
    {
      label: t("totalUsers"),
      value: 1248,
      icon: UserCircle2,
      color: "#6366f1",
      bg: "#EEF2FF",
      delta: t("deltaUsers", { count: 1248 }),
      trend: "up",
      href: `/${locale}/clients`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        transition={{ delay: 0.32 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-emerald-700 font-medium">{t("employeesActive", { count: activeEmployees })}</span>
        </div>
      </motion.div>

      {/* ── Revenue chart ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h2 className="font-semibold text-gray-800">{t("revenueOverview")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("last7Months")}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {t("vsLastQuarter")}
          </div>
        </div>
        <div className="px-2 pt-4 pb-2 h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
              <Tooltip content={<RevenueTooltip subscriptionsLabel={t("subscriptions")} />} />
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
    </div>
  );
}
