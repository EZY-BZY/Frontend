"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  listMembers,
  createMember,
  updateMember,
  deactivateMember,
} from "@/services/employees";
import type {
  BEasyEmployeeRead,
  AccountType,
  AccountStatus,
} from "@/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

function avatarInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

type DisplayPosition = "Admin" | "Support";

function toDisplayPosition(accountType: string): DisplayPosition {
  return accountType === "admin" || accountType === "super_user" ? "Admin" : "Support";
}

function toApiAccountType(pos: DisplayPosition): AccountType {
  return pos === "Admin" ? "admin" : "member";
}

function statusColor(status: string): string {
  switch (status) {
    case "active":    return "bg-emerald-50 text-emerald-700";
    case "inactive":  return "bg-slate-100 text-slate-500";
    case "suspended": return "bg-amber-50 text-amber-700";
    case "blocked":   return "bg-red-50 text-red-600";
    default:          return "bg-slate-100 text-slate-500";
  }
}

const PAGE_SIZE = 20;

// ─── Form types ───────────────────────────────────────────────────────────────

type AddEmployeeForm = {
  name: string;
  email: string;
  phone: string;
  position: DisplayPosition;
  password: string;
};

type EditEmployeeForm = {
  name: string;
  email: string;
  phone: string;
  position: DisplayPosition;
  account_status: AccountStatus;
};

type SheetMode = "add" | "view" | "edit";

// ─── Component ────────────────────────────────────────────────────────────────

export function EmployeesView() {
  const locale = useLocale();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const isRTL = locale === "ar";

  const addEmployeeSchema = z.object({
    name:     z.string().min(2, t("validation.nameMin")),
    email:    z.string().email(t("validation.emailInvalid")),
    phone:    z.string().min(5, t("validation.phoneRequired")),
    position: z.enum(["Admin", "Support"]),
    password: z.string().min(8, t("validation.passwordMin")),
  });

  const editEmployeeSchema = z.object({
    name:           z.string().min(2, t("validation.nameMin")),
    email:          z.string().email(t("validation.emailInvalid")),
    phone:          z.string().min(1),
    position:       z.enum(["Admin", "Support"]),
    account_status: z.enum(["active", "inactive", "suspended", "blocked"]),
  });

  // ── Data state ──────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<BEasyEmployeeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [position, setPosition] = useState<DisplayPosition | "all">("all");

  // ── Sheet state ─────────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("add");
  const [selectedEmployee, setSelectedEmployee] = useState<BEasyEmployeeRead | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // ── Add form ─────────────────────────────────────────────────────────────────
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: { position: "Support" },
  });

  // ── Edit form ─────────────────────────────────────────────────────────────────
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
  });

  // ── Debounce search ─────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await listMembers({
        name: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      if (res.Data) {
        setEmployees(res.Data.items);
        setTotalPages(res.Data.pages);
        setTotal(res.Data.total);
      } else {
        setFetchError(res.Message || "Failed to load employees");
      }
    } catch {
      setFetchError("Network error — could not load employees.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── Client-side position filter ─────────────────────────────────────────────
  const filtered =
    position === "all"
      ? employees
      : employees.filter((e) => toDisplayPosition(e.account_type) === position);

  // ── Open sheets ───────────────────────────────────────────────────────────────
  function openAdd() {
    setSheetMode("add");
    setSelectedEmployee(null);
    setServerError("");
    setConfirmDeactivate(false);
    resetAdd({ position: "Support" });
    setSheetOpen(true);
  }

  function openView(emp: BEasyEmployeeRead) {
    setSheetMode("view");
    setSelectedEmployee(emp);
    setServerError("");
    setConfirmDeactivate(false);
    setSheetOpen(true);
  }

  function openEdit(emp: BEasyEmployeeRead) {
    setSheetMode("edit");
    setSelectedEmployee(emp);
    setServerError("");
    setConfirmDeactivate(false);
    resetEdit({
      name:           emp.name,
      email:          emp.email,
      phone:          emp.phone ?? "",
      position:       toDisplayPosition(emp.account_type),
      account_status: emp.account_status as AccountStatus,
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setServerError("");
    setConfirmDeactivate(false);
    resetAdd();
  }

  // ── Add submit ────────────────────────────────────────────────────────────────
  const onAdd = async (data: AddEmployeeForm) => {
    setSaving(true);
    setServerError("");
    try {
      const res = await createMember({
        name:           data.name,
        email:          data.email,
        phone:          data.phone,
        password:       data.password,
        account_type:   toApiAccountType(data.position),
      });
      if (res.Data) {
        setEmployees((prev) => [res.Data!, ...prev.slice(0, PAGE_SIZE - 1)]);
        setTotal((n) => n + 1);
        closeSheet();
      } else {
        setServerError(res.Message || "Failed to create employee");
      }
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit submit ───────────────────────────────────────────────────────────────
  const onEdit = async (data: EditEmployeeForm) => {
    if (!selectedEmployee) return;
    setSaving(true);
    setServerError("");
    try {
      const res = await updateMember(selectedEmployee.id, {
        name:           data.name,
        email:          data.email,
        phone:          data.phone,
        account_type:   toApiAccountType(data.position),
        account_status: data.account_status,
      });
      if (res.Data) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === res.Data!.id ? res.Data! : e))
        );
        closeSheet();
      } else {
        setServerError(res.Message || "Failed to update employee");
      }
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Deactivate ────────────────────────────────────────────────────────────────
  const onDeactivate = async () => {
    if (!selectedEmployee) return;
    setDeactivating(true);
    setServerError("");
    try {
      const res = await deactivateMember(selectedEmployee.id);
      if (res.status_code === 200 || res.Data) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === selectedEmployee.id
              ? { ...e, account_status: "inactive" }
              : e
          )
        );
        closeSheet();
      } else {
        setServerError(res.Message || "Failed to deactivate employee");
        setConfirmDeactivate(false);
      }
    } catch {
      setServerError("Network error — please try again.");
      setConfirmDeactivate(false);
    } finally {
      setDeactivating(false);
    }
  };

  // ── Position chips ───────────────────────────────────────────────────────────
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
          {p === "all"
            ? tCommon("all")
            : t(`positions.${p === "Admin" ? "admin" : "support"}`)}
        </button>
      ))}
    </div>
  );

  // ── Skeleton rows ─────────────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {[120, 160, 80, 90, 80, 60].map((w, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  // ── Sheet title / desc ────────────────────────────────────────────────────────
  const sheetTitle =
    sheetMode === "add"
      ? t("addNewTitle")
      : sheetMode === "edit"
      ? t("editTitle")
      : t("viewTitle");

  const sheetDesc =
    sheetMode === "add"
      ? t("addNewDesc")
      : sheetMode === "edit"
      ? t("editDesc")
      : t("viewDesc");

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
            <AddButton onClick={openAdd}>{t("addEmployee")}</AddButton>
          </>
        }
      />

      {/* ── Error banner ────────────────────────────────────────────── */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* ── Table card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {(["employee", "email", "position", "phone", "joined", "status"] as const).map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-start font-semibold text-gray-500 whitespace-nowrap text-xs uppercase tracking-wide"
                    >
                      {t(`col.${col}`)}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-gray-400">
                    {t("noEmployees")}
                  </td>
                </tr>
              ) : (
                filtered.map((emp, i) => {
                  const pos = toDisplayPosition(emp.account_type);
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      onClick={() => openView(emp)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold select-none"
                            style={{ backgroundColor: avatarColor(emp.id) }}
                          >
                            {avatarInitials(emp.name)}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{emp.name}</p>
                            <p className="text-xs text-gray-400 font-mono truncate max-w-28">
                              {emp.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{emp.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-medium">
                          {t(`positions.${pos === "Admin" ? "admin" : "support"}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs" dir="ltr">
                        {emp.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(emp.created_at).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(emp.account_status)}`}
                        >
                          {t(`status.${emp.account_status as "active" | "inactive" | "suspended" | "blocked"}`)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer: count + pagination ─────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          <span>
            {t("showing")}{" "}
            <strong className="text-gray-600">{filtered.length}</strong>{" "}
            {tCommon("of")}{" "}
            <strong className="text-gray-600">{total}</strong>{" "}
            {t("employeeCountLabel")}
          </span>

          {totalPages > 1 && (
            <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-slate-600 font-medium">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sheet ──────────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="w-full max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>{sheetDesc}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            {/* ── VIEW MODE ─────────────────────────────────────────── */}
            {sheetMode === "view" && selectedEmployee && (
              <>
                {/* Avatar + name block */}
                <div className="flex items-center gap-4 pb-2">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-xl font-bold select-none"
                    style={{ backgroundColor: avatarColor(selectedEmployee.id) }}
                  >
                    {avatarInitials(selectedEmployee.name)}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{selectedEmployee.id.slice(0, 16)}…</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoField label={t("form.emailAddress")} value={selectedEmployee.email} mono />
                  <InfoField label={t("form.phoneNumber")} value={selectedEmployee.phone ?? "—"} mono />
                  <InfoField
                    label={t("accountTypeLabel")}
                    value={
                      <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-medium">
                        {t(`positions.${toDisplayPosition(selectedEmployee.account_type) === "Admin" ? "admin" : "support"}`)}
                      </span>
                    }
                  />
                  <InfoField
                    label={t("accountStatusLabel")}
                    value={
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(selectedEmployee.account_status)}`}>
                        {t(`status.${selectedEmployee.account_status as "active" | "inactive" | "suspended" | "blocked"}`)}
                      </span>
                    }
                  />
                  <InfoField
                    label={t("col.joined")}
                    value={new Date(selectedEmployee.created_at).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  />
                </div>

                {/* Deactivate confirmation panel */}
                {confirmDeactivate && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">{t("deactivateTitle")}</p>
                    <p className="text-xs text-red-600">{t("deactivateDesc")}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeactivate(false)}
                        className="flex-1"
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button
                        size="sm"
                        disabled={deactivating}
                        onClick={onDeactivate}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deactivating ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {tCommon("saving")}
                          </span>
                        ) : (
                          t("confirmDeactivate")
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {serverError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {serverError}
                  </div>
                )}
              </>
            )}

            {/* ── ADD MODE ──────────────────────────────────────────── */}
            {sheetMode === "add" && (
              <form onSubmit={handleAddSubmit(onAdd)} className="space-y-5" id="add-form">
                <div className="space-y-1.5">
                  <Label htmlFor="add-name">{t("form.fullName")}</Label>
                  <Input
                    id="add-name"
                    placeholder={t("form.namePlaceholder")}
                    {...registerAdd("name")}
                    className={addErrors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {addErrors.name && <p className="text-xs text-red-500">{addErrors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-email">{t("form.emailAddress")}</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder={t("form.emailPlaceholder")}
                    {...registerAdd("email")}
                    className={addErrors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {addErrors.email && <p className="text-xs text-red-500">{addErrors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-phone">{t("form.phoneNumber")}</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    placeholder={t("form.phonePlaceholder")}
                    {...registerAdd("phone")}
                    dir="ltr"
                    className={addErrors.phone ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {addErrors.phone && <p className="text-xs text-red-500">{addErrors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>{t("form.position")}</Label>
                  <div className="flex gap-3">
                    {(["Admin", "Support"] as DisplayPosition[]).map((p) => (
                      <label
                        key={p}
                        className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 has-checked:border-[#28B8B1] has-checked:bg-[#E6F7F7] transition-colors"
                      >
                        <input
                          type="radio"
                          value={p}
                          {...registerAdd("position")}
                          className="accent-[#28B8B1]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {t(`positions.${p === "Admin" ? "admin" : "support"}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-password">{t("form.initialPassword")}</Label>
                  <Input
                    id="add-password"
                    type="password"
                    placeholder={t("form.passwordPlaceholder")}
                    {...registerAdd("password")}
                    className={addErrors.password ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {addErrors.password && <p className="text-xs text-red-500">{addErrors.password.message}</p>}
                </div>

                {serverError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {serverError}
                  </div>
                )}
              </form>
            )}

            {/* ── EDIT MODE ─────────────────────────────────────────── */}
            {sheetMode === "edit" && selectedEmployee && (
              <form onSubmit={handleEditSubmit(onEdit)} className="space-y-5" id="edit-form">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">{t("form.fullName")}</Label>
                  <Input
                    id="edit-name"
                    {...registerEdit("name")}
                    className={editErrors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {editErrors.name && <p className="text-xs text-red-500">{editErrors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">{t("form.emailAddress")}</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...registerEdit("email")}
                    className={editErrors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {editErrors.email && <p className="text-xs text-red-500">{editErrors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">{t("form.phoneNumber")}</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    {...registerEdit("phone")}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("form.position")}</Label>
                  <div className="flex gap-3">
                    {(["Admin", "Support"] as DisplayPosition[]).map((p) => (
                      <label
                        key={p}
                        className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 has-checked:border-[#28B8B1] has-checked:bg-[#E6F7F7] transition-colors"
                      >
                        <input
                          type="radio"
                          value={p}
                          {...registerEdit("position")}
                          className="accent-[#28B8B1]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {t(`positions.${p === "Admin" ? "admin" : "support"}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">{t("form.accountStatus")}</Label>
                  <select
                    id="edit-status"
                    {...registerEdit("account_status")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {(["active", "inactive", "suspended", "blocked"] as AccountStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {serverError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {serverError}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <SheetFooter className="px-6 py-4 border-t border-gray-100">
            {sheetMode === "add" && (
              <>
                <Button variant="outline" onClick={closeSheet} className="flex-1" type="button">
                  {tCommon("cancel")}
                </Button>
                <Button
                  form="add-form"
                  type="submit"
                  onClick={handleAddSubmit(onAdd)}
                  disabled={saving}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tCommon("saving")}
                    </span>
                  ) : (
                    t("addEmployee")
                  )}
                </Button>
              </>
            )}

            {sheetMode === "view" && selectedEmployee && !confirmDeactivate && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeactivate(true)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={selectedEmployee.account_status === "inactive"}
                >
                  {t("deactivateBtn")}
                </Button>
                <Button
                  onClick={() => openEdit(selectedEmployee)}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {t("editBtn")}
                </Button>
              </>
            )}

            {sheetMode === "edit" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedEmployee && openView(selectedEmployee)}
                  className="flex-1"
                  type="button"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={handleEditSubmit(onEdit)}
                  disabled={saving}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tCommon("saving")}
                    </span>
                  ) : (
                    tCommon("saveChanges")
                  )}
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── InfoField ────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-gray-700 ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}
