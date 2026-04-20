"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Building2,
  ExternalLink,
  Users,
  Mail,
  Phone,
  Calendar,
  Package,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/shared/FilterBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mockClients, allWorkAccounts } from "@/lib/mock-clients";
import type { PersonalClient } from "@/types";

/* ─── Row animation helper ───────────────────────────────────────── */
const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.22 },
});

/* ─── Status badge config ─────────────────────────────────────────── */
const waCls = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

/* ─── Personal Account Sheet ─────────────────────────────────────── */
function PersonalAccountSheet({
  client,
  open,
  onClose,
}: {
  client: PersonalClient | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("clients");
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side={isRTL ? "left" : "right"} className="w-full max-w-md overflow-y-auto">
        {/* Header */}
        <SheetHeader className="pb-5">
          <div className="flex items-center gap-4 pe-8">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white text-lg font-bold select-none shadow-md"
              style={{ backgroundColor: client.avatarColor }}
            >
              {client.avatarInitials}
            </span>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-900 leading-tight">
                {client.name}
              </SheetTitle>
              <SheetDescription className="text-xs font-mono text-slate-400 mt-0.5">
                {client.id}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-linear-to-r from-[#0A3D62] to-[#28B8B1] -mt-1 mb-5" />

        {/* Contact Info */}
        <div className="px-6 space-y-3 mb-6">
          <a
            href={`mailto:${client.email}`}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB]">
              <Mail className="h-4 w-4 text-[#0A3D62]" />
            </div>
            <span className="truncate">{client.email}</span>
          </a>

          <div
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600"
            dir="ltr"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB]">
              <Phone className="h-4 w-4 text-[#0A3D62]" />
            </div>
            <span className="font-mono">
              {client.countryCode} {client.phone}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB]">
              <Calendar className="h-4 w-4 text-[#0A3D62]" />
            </div>
            <span>
              {t("joinedDate")}:{" "}
              {new Date(client.joinDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Work Accounts */}
        <div className="px-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-[#0A3D62]" />
            <p className="text-sm font-semibold text-slate-700">
              {t("workAccounts")}
            </p>
            <Badge
              variant="secondary"
              className="ms-1 bg-[#EBF3FB] text-[#0A3D62] border-0 font-bold tabular-nums"
            >
              {client.workAccounts.length}
            </Badge>
          </div>

          {client.workAccounts.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              {t("noWorkAccounts")}
            </p>
          ) : (
            <div className="space-y-2">
              {client.workAccounts.map((wa) => (
                <div
                  key={wa.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:bg-[#EBF3FB]/40 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB]">
                    <Building2 className="h-4.5 w-4.5 text-[#0A3D62]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                      {wa.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-400">{wa.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {wa.industry}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${waCls[wa.status]}`}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", isRTL ? "ml-1" : "mr-1", wa.status === "active" ? "bg-emerald-400" : "bg-slate-400")}
                    />
                    {wa.status === "active" ? t("status.active") : t("status.inactive")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main List View ─────────────────────────────────────────────── */
export function ClientsListView() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("clients");

  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<PersonalClient | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* ── Personal Accounts (filtered) ─────────────────────────────── */
  const filteredPersonal = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return mockClients;
    return mockClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [search]);

  /* ── Work Accounts (filtered) ──────────────────────────────────── */
  const filteredWork = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allWorkAccounts;
    return allWorkAccounts.filter(
      (wa) =>
        wa.name.toLowerCase().includes(q) ||
        wa.ownerName.toLowerCase().includes(q)
    );
  }, [search]);

  const openPersonalSheet = (client: PersonalClient) => {
    setSelectedClient(client);
    setSheetOpen(true);
  };

  const navigateToWorkAccount = (waId: string) =>
    router.push(`/${locale}/clients/work-account/${waId}`);

  const navigateToClient = (clientId: string) =>
    router.push(`/${locale}/clients/${clientId}`);

  return (
    <div className="space-y-4">
      {/* ── Shared FilterBar ──────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
      />

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">
            <Users className="h-4 w-4" />
            {t("personalAccounts")}
            <span className="ms-1 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {filteredPersonal.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="work">
            <Building2 className="h-4 w-4" />
            {t("workAccounts")}
            <span className="ms-1 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {filteredWork.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Personal Accounts ─────────────────────────── */}
        <TabsContent value="personal">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      t("col.client"),
                      t("col.phone"),
                      t("col.workAccounts"),
                      t("col.joinedDate"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonal.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="h-32 text-center text-slate-400 text-sm"
                      >
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    filteredPersonal.map((client, i) => (
                      <motion.tr
                        key={client.id}
                        {...rowAnim(i)}
                        onClick={() => openPersonalSheet(client)}
                        className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 cursor-pointer transition-colors group"
                      >
                        {/* Avatar + Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold select-none"
                              style={{ backgroundColor: client.avatarColor }}
                            >
                              {client.avatarInitials}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-[#0A3D62] transition-colors leading-tight">
                                {client.name}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                {client.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone — always LTR */}
                        <td
                          className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap"
                          dir="ltr"
                        >
                          {client.countryCode} {client.phone}
                        </td>

                        {/* Work Accounts count badge */}
                        <td className="px-5 py-3.5">
                          <Badge
                            variant="secondary"
                            className="bg-[#EBF3FB] text-[#0A3D62] border-0 font-semibold tabular-nums"
                          >
                            <Building2 className="me-1 h-3 w-3" />
                            {client.workAccounts.length}
                          </Badge>
                        </td>

                        {/* Join Date */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                          {new Date(client.joinDate).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
              {filteredPersonal.length}{" "}
              {t("ofTotal", { total: mockClients.length })}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Work Accounts ─────────────────────────────── */}
        <TabsContent value="work">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      t("col.company"),
                      t("col.owner"),
                      t("col.employeesCount"),
                      t("col.productsCount"),
                      t("col.status"),
                      t("col.createdDate"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWork.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-32 text-center text-slate-400 text-sm"
                      >
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    filteredWork.map((wa, i) => (
                      <motion.tr
                        key={wa.id}
                        {...rowAnim(i)}
                        onClick={() => navigateToWorkAccount(wa.id)}
                        className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 cursor-pointer transition-colors group"
                      >
                        {/* Company name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB]">
                              <Building2 className="h-4 w-4 text-[#0A3D62]" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-[#0A3D62] transition-colors leading-tight">
                                {wa.name}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                {wa.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner — stops row navigation, links to personal sheet via client page */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToClient(wa.ownerId);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#28B8B1] hover:text-[#0A3D62] transition-colors group/link"
                          >
                            {wa.ownerName}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </button>
                        </td>

                        {/* Employees Count */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF3FB] px-2.5 py-0.5 text-xs font-semibold text-[#0A3D62] tabular-nums">
                            <Users className="h-3 w-3" />
                            {wa.employeesCount}
                          </span>
                        </td>

                        {/* Products Count */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7F7] px-2.5 py-0.5 text-xs font-semibold text-[#28B8B1] tabular-nums">
                            <Package className="h-3 w-3" />
                            {wa.productsCount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${waCls[wa.status]}`}
                          >
                            <span
                              className={`me-1.5 h-1.5 w-1.5 rounded-full ${wa.status === "active" ? "bg-emerald-400" : "bg-slate-400"}`}
                            />
                            {wa.status === "active"
                              ? t("status.active")
                              : t("status.inactive")}
                          </span>
                        </td>

                        {/* Created date */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(wa.createdAt).toLocaleDateString(useLocale() === "ar" ? "ar-EG" : "en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
              {filteredWork.length}{" "}
              {t("ofTotal", { total: allWorkAccounts.length })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Personal Account Sheet ─────────────────────────────── */}
      <PersonalAccountSheet
        client={selectedClient}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
