"use client";

import { motion } from "framer-motion";
import { Users, Package, MessageSquare, Tag, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { mockEmployees } from "@/features/employees/data/mock";
import { mockProducts } from "@/features/products/data/mock";
import { mockContactRequests } from "@/features/contact-requests/data/mock";
import { mockCategories } from "@/features/categories/data/mock";

const statusBadge: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  inProgress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-red-50 text-red-600",
};

export function DashboardHome() {
  const locale = useLocale();

  const stats = [
    {
      label: "Total Employees",
      value: mockEmployees.length,
      icon: Users,
      color: "#0A3D62",
      bg: "#EBF3FB",
      delta: "+2 this month",
      href: `/${locale}/employees`,
    },
    {
      label: "Total Products",
      value: mockProducts.length,
      icon: Package,
      color: "#28B8B1",
      bg: "#E6F7F7",
      delta: "+3 this week",
      href: `/${locale}/products`,
    },
    {
      label: "Contact Requests",
      value: mockContactRequests.length,
      icon: MessageSquare,
      color: "#6366f1",
      bg: "#EEF2FF",
      delta: `${mockContactRequests.filter((r) => r.status === "new").length} new`,
      href: `/${locale}/contact-requests`,
    },
    {
      label: "Categories",
      value: mockCategories.length,
      icon: Tag,
      color: "#f59e0b",
      bg: "#FFFBEB",
      delta: `${mockCategories.reduce((s, c) => s + c.productCount, 0)} total products`,
      href: `/${locale}/categories`,
    },
  ];

  const recentRequests = mockContactRequests.slice(0, 5);

  const activeEmployees = mockEmployees.filter((e) => e.status === "active").length;
  const lowStockProducts = mockProducts.filter((p) => p.stock > 0 && p.stock < 20).length;
  const outOfStock = mockProducts.filter((p) => p.stock === 0).length;
  const openRequests = mockContactRequests.filter((r) => r.status === "new" || r.status === "inProgress").length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
          >
            <Link
              href={stat.href}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
              <p className="text-xs font-medium" style={{ color: stat.color }}>{stat.delta}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Alert strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
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
        {lowStockProducts > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-amber-700 font-medium">{lowStockProducts} products low stock</span>
          </div>
        )}
        {outOfStock > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-red-700 font-medium">{outOfStock} out of stock</span>
          </div>
        )}
      </motion.div>

      {/* Two-column bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent contact requests */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Contact Requests</h2>
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
                transition={{ delay: 0.45 + i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FB] text-[#0A3D62] text-xs font-bold">
                  {req.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{req.clientName}</p>
                  <p className="text-xs text-gray-400 truncate">{req.companyName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[req.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {req.status === "inProgress" ? "In Progress" : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
                <span className="shrink-0 text-xs text-gray-400">{req.date}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Department breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Team by Department</h2>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(
              mockEmployees.reduce((acc, e) => {
                acc[e.department] = (acc[e.department] ?? 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([dept, count], i) => {
                const pct = Math.round((count / mockEmployees.length) * 100);
                const colors = ["#0A3D62", "#28B8B1", "#6366f1", "#f59e0b", "#10b981", "#ec4899"];
                const color = colors[i % colors.length];
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium truncate">{dept}</span>
                      <span className="text-xs font-bold text-gray-800 ms-2">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: "easeOut" }}
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
    </div>
  );
}
