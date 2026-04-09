"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { mockContactRequests } from "../data/mock";
import { getColumns } from "./columns";

export function DashboardView() {
  const t = useTranslations("contactRequests");

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const columns = useMemo(
    () =>
      getColumns({
        t: (key) => t(key as Parameters<typeof t>[0]),
        showStatus: false,
        showActions: true,
      }),
    [t]
  );

  const filtered = useMemo(() => {
    return mockContactRequests.filter((req) => {
      const matchesSearch =
        !search ||
        req.clientName.toLowerCase().includes(search.toLowerCase()) ||
        req.email.toLowerCase().includes(search.toLowerCase());

      const matchesDate = !date || req.date.startsWith(date);

      return matchesSearch && matchesDate;
    });
  }, [search, date]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-6 px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t("search")}</label>
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-gray-200 focus-visible:ring-[#28B8B1]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t("requestDate")}</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-gray-200 focus-visible:ring-[#28B8B1]"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={t("noRequests")}
        className="rounded-none border-0 shadow-none"
      />
    </div>
  );
}
