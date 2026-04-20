"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FilterBar, AddButton, DownloadButton } from "@/components/shared/FilterBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { mockEmployees } from "../data/mock";
import type { Employee, EmployeePosition } from "@/types";

type AddEmployeeForm = {
  name_en: string;
  email: string;
  phone: string;
  position: "Admin" | "Support";
  password: string;
};

/* ─── Mock server action ─────────────────────────────────────────── */
async function createEmployee(data: AddEmployeeForm): Promise<Employee> {
  await new Promise((r) => setTimeout(r, 600));
  const COLORS = ["#0A3D62", "#28B8B1", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
  const initials = data.name_en.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return {
    id: `EMP-${String(Date.now()).slice(-4)}`,
    name_en: data.name_en,
    name_ar: data.name_en,
    name_fr: data.name_en,
    email: data.email,
    phone: data.phone,
    position: data.position,
    status: "active",
    joinDate: new Date().toISOString().slice(0, 10),
    avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    avatarInitials: initials,
  };
}

export function EmployeesView() {
  const locale = useLocale();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const nameKey = locale === "ar" ? "name_ar" : locale === "fr" ? "name_fr" : "name_en";

  /* Build Zod schema with translated error messages */
  const addEmployeeSchema = z.object({
    name_en:  z.string().min(2, t("validation.nameMin")),
    email:    z.string().email(t("validation.emailInvalid")),
    phone:    z.string().min(5, t("validation.phoneRequired")),
    position: z.enum(["Admin", "Support"]),
    password: z.string().min(8, t("validation.passwordMin")),
  });

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<EmployeePosition | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: { position: "Support" },
  });

  /* ─── Filtered list ─────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        !search ||
        e.name_en.toLowerCase().includes(q) ||
        e.name_ar.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchesPosition = position === "all" || e.position === position;
      return matchesSearch && matchesPosition;
    });
  }, [search, position, employees]);

  /* ─── Submit handler ─────────────────────────────────────────────── */
  const onSubmit = async (data: AddEmployeeForm) => {
    setSaving(true);
    try {
      const newEmp = await createEmployee(data);
      setEmployees((prev) => [newEmp, ...prev]);
      setSheetOpen(false);
      reset();
    } finally {
      setSaving(false);
    }
  };

  /* ─── Position filter chips ─────────────────────────────────────── */
  const positionFilter = (
    <div className="flex gap-1.5">
      {(["all", "Admin", "Support"] as const).map((p) => (
        <button
          key={p}
          onClick={() => setPosition(p)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
            position === p
              ? "bg-[#0A3D62] text-white border-[#0A3D62]"
              : "bg-white text-slate-500 border-slate-200 hover:border-[#0A3D62] hover:text-[#0A3D62]"
          }`}
        >
          {p === "all" ? tCommon("all") : t(`positions.${p === "Admin" ? "admin" : "support"}`)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={positionFilter}
        actions={
          <>
            <DownloadButton onClick={() => {}}>{t("exportBtn")}</DownloadButton>
            <AddButton onClick={() => setSheetOpen(true)}>{t("addEmployee")}</AddButton>
          </>
        }
      />

      {/* ── Table card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {(["employee", "email", "position", "phone", "joined"] as const).map((col) => (
                  <th key={col} className="px-5 py-3.5 text-start font-semibold text-gray-500 whitespace-nowrap text-xs uppercase tracking-wide">
                    {t(`col.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-gray-400">{t("noEmployees")}</td>
                </tr>
              ) : (
                filtered.map((emp, i) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold select-none"
                            style={{ backgroundColor: emp.avatarColor }}
                          >
                            {emp.avatarInitials}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{emp[nameKey]}</p>
                            <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{emp.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-medium">
                          {t(`positions.${emp.position === "Admin" ? "admin" : "support"}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs" dir="ltr">{emp.phone}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(emp.joinDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          <span>
            {t("showing")} <strong className="text-gray-600">{filtered.length}</strong> {tCommon("of")}{" "}
            <strong className="text-gray-600">{employees.length}</strong> {t("employeeCountLabel")}
          </span>
        </div>
      </div>

      {/* ── Add Employee Sheet ──────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>{t("addNewTitle")}</SheetTitle>
            <SheetDescription>{t("addNewDesc")}</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6 flex-1 overflow-y-auto">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name_en">{t("form.fullName")}</Label>
              <Input
                id="name_en"
                placeholder={t("form.namePlaceholder")}
                {...register("name_en")}
                className={errors.name_en ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("form.emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                {...register("email")}
                className={errors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("form.phoneNumber")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("form.phonePlaceholder")}
                {...register("phone")}
                dir="ltr"
                className={errors.phone ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label>{t("form.position")}</Label>
              <div className="flex gap-3">
                {(["Admin", "Support"] as EmployeePosition[]).map((p) => (
                  <label key={p} className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 has-checked:border-[#28B8B1] has-checked:bg-[#E6F7F7] transition-colors">
                    <input type="radio" value={p} {...register("position")} className="accent-[#28B8B1]" />
                    <span className="text-sm font-medium text-slate-700">
                      {t(`positions.${p === "Admin" ? "admin" : "support"}`)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("form.initialPassword")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("form.passwordPlaceholder")}
                {...register("password")}
                className={errors.password ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </form>

          <SheetFooter className="px-6 py-4">
            <Button
              variant="outline"
              onClick={() => { setSheetOpen(false); reset(); }}
              className="flex-1"
              type="button"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
              type="submit"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {tCommon("saving")}
                </span>
              ) : (
                t("addEmployee")
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
