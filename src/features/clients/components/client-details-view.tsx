"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight,
  Mail, Phone, Calendar,
  Building2, CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getClientById } from "@/lib/mock-clients";
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

interface ClientDetailsViewProps {
  clientId: string;
}

export function ClientDetailsView({ clientId }: ClientDetailsViewProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("clients");
  const isRTL = locale === "ar";

  const client = getClientById(clientId);

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        {t("notFound")}
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  /* Active subscription always at top, then by startDate descending */
  const sortedSubscriptions = [...client.subscriptions].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (b.status === "active" && a.status !== "active") return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  /* ─── Section A: Header ──────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Back button ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <button
          onClick={() => router.push(`/${locale}/clients`)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          {t("backToClients")}
        </button>
      </motion.div>

      {/* ── Contact strip card ───────────────────────────────────────── */}
      <motion.div {...fadeUp(0.06)}>
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          {/* Colored top bar using brand primary */}
          <div className="h-1.5 w-full bg-linear-to-r from-[#0A3D62] to-[#28B8B1]" />
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-5">
              {/* Avatar */}
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white text-xl font-bold select-none shadow-md"
                style={{ backgroundColor: client.avatarColor }}
              >
                {client.avatarInitials}
              </span>

              {/* Name + ID */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{client.name}</h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{client.id}</p>
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-12" />

              {/* Contact strips */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
                {/* Email */}
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#28B8B1] transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EBF3FB]">
                    <Mail className="h-3.5 w-3.5 text-[#0A3D62]" />
                  </div>
                  {client.email}
                </a>

                {/* Phone — always LTR */}
                <span className="inline-flex items-center gap-2 text-sm text-slate-500" dir="ltr">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EBF3FB]">
                    <Phone className="h-3.5 w-3.5 text-[#0A3D62]" />
                  </div>
                  {client.countryCode} {client.phone}
                </span>

                {/* Join date */}
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EBF3FB]">
                    <Phone className="h-3.5 w-3.5 text-[#0A3D62]" />
                  </div>
                  {t("joinedDate")}: {new Date(client.joinDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Section B: Work Accounts ──────────────────────────────── */}
      <motion.div {...fadeUp(0.12)}>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4.5 w-4.5 text-[#0A3D62]" />
              {t("workAccounts")}
              <Badge variant="secondary" className="ms-1 bg-[#EBF3FB] text-[#0A3D62] border-0 font-bold tabular-nums">
                {client.workAccounts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {client.workAccounts.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">{t("noWorkAccounts")}</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {client.workAccounts.map((wa, i) => (
                  <motion.div
                    key={wa.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 + i * 0.05, duration: 0.22 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
                      <Building2 className="h-5 w-5 text-[#0A3D62]" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-tight">{wa.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">{wa.id}</span>
                <span className="text-slate-300">·</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {wa.industry}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${waStatusCls[wa.status]}`}>
              <span className={cn("h-1.5 w-1.5 rounded-full", isRTL ? "ml-1.5" : "mr-1.5", wa.status === "active" ? "bg-emerald-400" : "bg-slate-400")} />
              {wa.status === "active" ? t("status.active") : t("status.inactive")}
            </span>

                  {/* Created date */}
                  <span className="hidden sm:block text-xs text-slate-400 font-mono whitespace-nowrap">
                    {new Date(wa.createdAt).toLocaleDateString(useLocale() === "ar" ? "ar-EG" : "en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Section C: Subscription Ledger ──────────────────────────── */}
      <motion.div {...fadeUp(0.2)}>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4.5 w-4.5 text-[#0A3D62]" />
              {t("subscriptionHistory")}
              <Badge variant="secondary" className="ms-1 bg-[#EBF3FB] text-[#0A3D62] border-0 font-bold tabular-nums">
                {client.subscriptions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {client.subscriptions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">{t("noSubscriptions")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {[
                        t("col.workAccount"),
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
                    {sortedSubscriptions.map((sub, i) => {
                      const hasDiscount = sub.discountedPrice < sub.originalPrice;
                      const isActiveSub = sub.status === "active";
                      return (
                        <motion.tr
                          key={sub.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.24 + i * 0.04, duration: 0.2 }}
                          className={`border-b border-slate-50 last:border-0 transition-colors ${
                            isActiveSub
                              ? "bg-[#E6F7F7]/40 hover:bg-[#E6F7F7]/70"
                              : "hover:bg-slate-50/50"
                          }`}
                        >
                          {/* Work Account name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="font-medium text-slate-700">{sub.workAccountName}</span>
                            </div>
                          </td>

                          {/* Bundle type */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                sub.bundleType === "Enterprise"
                                  ? "bg-[#EBF3FB] text-[#0A3D62]"
                                  : sub.bundleType === "Pro"
                                  ? "bg-[#E6F7F7] text-[#28B8B1]"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sub.bundleType}
                            </span>
                          </td>

                          {/* Start date */}
                          <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap" dir="ltr">
                            {sub.startDate}
                          </td>

                          {/* End date */}
                          <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap" dir="ltr">
                            {sub.endDate}
                          </td>

                          {/* Amount: discounted vs original */}
                          <td className="px-5 py-3.5 whitespace-nowrap" dir="ltr">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-semibold text-slate-800 tabular-nums">
                                {sub.discountedPrice.toLocaleString()} {sub.currency}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through tabular-nums">
                                  {sub.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="text-[10px] text-emerald-600 font-medium">
                                {Math.round(((sub.originalPrice - sub.discountedPrice) / sub.originalPrice) * 100)}% {t("off")}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {isActiveSub ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#28B8B1]/30 bg-[#E6F7F7] px-2.5 py-0.5 text-xs font-semibold text-[#28B8B1]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#28B8B1]" />
                                {t(`subscriptionStatus.${sub.status}`)}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${subStatusCls[sub.status]}`}>
                                {t(`subscriptionStatus.${sub.status}`)}
                              </span>
                            )}
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
