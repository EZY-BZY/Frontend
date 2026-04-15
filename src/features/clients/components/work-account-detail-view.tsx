"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Package,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  getWorkAccountById,
  getWorkAccountSubscriptions,
} from "@/lib/mock-clients";
import type { ClientSubscriptionStatus, WorkAccountStatus } from "@/types";

/* ─── Animation presets ──────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.26 },
});

/* ─── Status badge maps ──────────────────────────────────────────── */
const subStatusCls: Record<ClientSubscriptionStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const waStatusCls: Record<WorkAccountStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

const bundleBadgeCls: Record<string, string> = {
  Enterprise: "bg-[#EBF3FB] text-[#0A3D62]",
  Pro: "bg-[#E6F7F7] text-[#28B8B1]",
  Starter: "bg-slate-100 text-slate-600",
};

interface WorkAccountDetailViewProps {
  workAccountId: string;
}

export function WorkAccountDetailView({
  workAccountId,
}: WorkAccountDetailViewProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("clients");
  const isRTL = locale === "ar";

  const wa = getWorkAccountById(workAccountId);
  const subscriptions = getWorkAccountSubscriptions(workAccountId);

  if (!wa) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        {t("notFound")}
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6">
      {/* ── Back button ──────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <button
          onClick={() => router.push(`/${locale}/clients`)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          {t("backToClients")}
        </button>
      </motion.div>

      {/* ── Header Strip Card ────────────────────────────────────── */}
      <motion.div {...fadeUp(0.06)}>
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-[#0A3D62] to-[#28B8B1]" />
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-5">
              {/* Icon */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FB] shadow-md">
                <Building2 className="h-8 w-8 text-[#0A3D62]" />
              </div>

              {/* Name + ID + owner */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {wa.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-400">{wa.id}</span>
                  <span className="text-slate-300">·</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    {wa.industry}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    {wa.ownerName}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${waStatusCls[wa.status]}`}
              >
                {wa.status === "active" ? (
                  <CheckCircle2 className="me-1.5 h-4 w-4" />
                ) : (
                  <XCircle className="me-1.5 h-4 w-4" />
                )}
                {wa.status === "active"
                  ? t("status.active")
                  : t("status.inactive")}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Data Cards ───────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.12)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Employees */}
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF3FB]">
                <Users className="h-5 w-5 text-[#0A3D62]" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {wa.employeesCount}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {t("col.employeesCount")}
              </p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F7]">
                <Package className="h-5 w-5 text-[#28B8B1]" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {wa.productsCount}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {t("col.productsCount")}
              </p>
            </CardContent>
          </Card>

          {/* Active subscriptions */}
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {subscriptions.filter((s) => s.status === "active").length}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {t("subscriptionStatus.active")}
              </p>
            </CardContent>
          </Card>

          {/* Created */}
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {new Date(wa.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {t("col.createdDate")}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ── Subscription History ─────────────────────────────────── */}
      <motion.div {...fadeUp(0.2)}>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4.5 w-4.5 text-[#0A3D62]" />
              {t("subscriptionHistory")}
              <Badge
                variant="secondary"
                className="ms-1 bg-[#EBF3FB] text-[#0A3D62] border-0 font-bold tabular-nums"
              >
                {subscriptions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {subscriptions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">
                {t("noSubscriptions")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {[
                        t("col.bundle"),
                        t("col.startDate"),
                        t("col.endDate"),
                        t("col.amount"),
                        t("col.status"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub, i) => {
                      const hasDiscount =
                        sub.discountedPrice < sub.originalPrice;
                      return (
                        <motion.tr
                          key={sub.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.24 + i * 0.04,
                            duration: 0.2,
                          }}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Bundle type */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${bundleBadgeCls[sub.bundleType] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {sub.bundleType}
                            </span>
                          </td>

                          {/* Start date */}
                          <td
                            className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap"
                            dir="ltr"
                          >
                            {sub.startDate}
                          </td>

                          {/* End date */}
                          <td
                            className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap"
                            dir="ltr"
                          >
                            {sub.endDate}
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5 whitespace-nowrap" dir="ltr">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-semibold text-slate-800 tabular-nums">
                                {sub.discountedPrice.toLocaleString()}{" "}
                                {sub.currency}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through tabular-nums">
                                  {sub.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="text-[10px] text-emerald-600 font-medium">
                                {Math.round(
                                  ((sub.originalPrice - sub.discountedPrice) /
                                    sub.originalPrice) *
                                    100
                                )}
                                % {t("off")}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${subStatusCls[sub.status]}`}
                            >
                              {t(`subscriptionStatus.${sub.status}`)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
