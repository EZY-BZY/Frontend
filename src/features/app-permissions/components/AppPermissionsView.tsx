"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
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
import { cn } from "@/lib/utils";
import {
  listAppPermissions,
  createAppPermission,
  updateAppPermission,
  deleteAppPermission,
  listAppPermissionHistory,
} from "@/services/permissions";
import type { AppPermissionRead, AppPermissionHistoryRead } from "@/types/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionForm = {
  permission_tag: string;
  permission_label: string;
  permission_key: string;
  description: string;
  is_active: boolean;
};

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

type SheetMode = "add" | "view" | "edit";

// ─── Component ────────────────────────────────────────────────────────────────

export function AppPermissionsView() {
  const locale = useLocale();
  const t = useTranslations("appPermissions");
  const tCommon = useTranslations("common");
  const isRTL = locale === "ar";

  const schema = z.object({
    permission_tag: z
      .string()
      .min(1, t("validation.tagRequired"))
      .max(128, t("validation.tagMax")),
    permission_label: z
      .string()
      .min(1, t("validation.labelRequired"))
      .max(64, t("validation.labelMax")),
    permission_key: z
      .string()
      .min(1, t("validation.keyRequired"))
      .max(256, t("validation.keyMax")),
    description: z.string().max(4096, t("validation.descriptionMax")),
    is_active: z.boolean(),
  });

  // ── Data state ──────────────────────────────────────────────────────────────
  const [permissions, setPermissions] = useState<AppPermissionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Sheet state ─────────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("add");
  const [selected, setSelected] = useState<AppPermissionRead | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── History sheet state ─────────────────────────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<AppPermissionHistoryRead[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPermission, setHistoryPermission] = useState<AppPermissionRead | null>(null);

  // ── Toast state ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ── Form ────────────────────────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionForm>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, description: "" },
  });

  // ── Toast helpers ───────────────────────────────────────────────────────────
  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await listAppPermissions();
      if (res.Data) {
        setPermissions(res.Data);
      } else {
        setFetchError(res.Message || "Failed to load permissions");
      }
    } catch {
      setFetchError("Network error — could not load permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ── Client-side search filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return permissions;
    const q = search.toLowerCase();
    return permissions.filter(
      (p) =>
        p.permission_tag.toLowerCase().includes(q) ||
        p.permission_label.toLowerCase().includes(q) ||
        p.permission_key.toLowerCase().includes(q)
    );
  }, [permissions, search]);

  // ── Open actions ────────────────────────────────────────────────────────────
  function openAdd() {
    setSheetMode("add");
    setSelected(null);
    setServerError("");
    setConfirmDelete(false);
    reset({
      permission_tag: "",
      permission_label: "",
      permission_key: "",
      description: "",
      is_active: true,
    });
    setSheetOpen(true);
  }

  function openView(p: AppPermissionRead) {
    setSheetMode("view");
    setSelected(p);
    setServerError("");
    setConfirmDelete(false);
    setSheetOpen(true);
  }

  function openEdit(p: AppPermissionRead) {
    setSheetMode("edit");
    setSelected(p);
    setServerError("");
    setConfirmDelete(false);
    reset({
      permission_tag: p.permission_tag,
      permission_label: p.permission_label,
      permission_key: p.permission_key,
      description: p.description ?? "",
      is_active: p.is_active,
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setServerError("");
    setConfirmDelete(false);
  }

  async function openHistory(p: AppPermissionRead) {
    setHistoryPermission(p);
    setHistoryRecords([]);
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const res = await listAppPermissionHistory(p.id);
      if (res.Data) {
        setHistoryRecords(res.Data);
      }
    } catch {
      // keep empty state — user sees empty list
    } finally {
      setHistoryLoading(false);
    }
  }

  // ── Submit (add / edit) ─────────────────────────────────────────────────────
  const onSubmit = async (data: PermissionForm) => {
    setSaving(true);
    setServerError("");
    try {
      if (sheetMode === "add") {
        const res = await createAppPermission({
          permission_tag: data.permission_tag,
          permission_label: data.permission_label,
          permission_key: data.permission_key,
          description: data.description || null,
          is_active: data.is_active,
        });
        if (res.Data) {
          setPermissions((prev) => [res.Data!, ...prev]);
          closeSheet();
          addToast("success", t("toast.createSuccess"));
        } else {
          setServerError(res.Message || t("toast.createError"));
        }
      } else if (sheetMode === "edit" && selected) {
        const res = await updateAppPermission(selected.id, {
          permission_tag: data.permission_tag,
          permission_label: data.permission_label,
          permission_key: data.permission_key,
          description: data.description || null,
          is_active: data.is_active,
        });
        if (res.Data) {
          setPermissions((prev) =>
            prev.map((p) => (p.id === res.Data!.id ? res.Data! : p))
          );
          closeSheet();
          addToast("success", t("toast.updateSuccess"));
        } else {
          setServerError(res.Message || t("toast.updateError"));
        }
      }
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const onDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    setServerError("");
    try {
      const res = await deleteAppPermission(selected.id);
      if (res.status_code === 200 || res.Data) {
        setPermissions((prev) => prev.filter((p) => p.id !== selected.id));
        closeSheet();
        addToast("success", t("toast.deleteSuccess"));
      } else {
        setServerError(res.Message || t("toast.deleteError"));
        setConfirmDelete(false);
      }
    } catch {
      setServerError("Network error — please try again.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  // ── Sheet title / desc ──────────────────────────────────────────────────────
  const sheetTitle =
    sheetMode === "add"
      ? t("addTitle")
      : sheetMode === "edit"
      ? t("editTitle")
      : t("viewTitle");

  const sheetDesc =
    sheetMode === "add"
      ? t("addDesc")
      : sheetMode === "edit"
      ? t("editDesc")
      : t("viewDesc");

  // ── Skeleton rows ───────────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {[80, 110, 150, 160, 60, 80].map((w, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className="h-4 animate-pulse rounded bg-slate-100"
                style={{ width: w }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Toast notifications ──────────────────────────────────────── */}
      <div
        className={cn(
          "fixed top-5 z-50 flex flex-col gap-2 pointer-events-none",
          isRTL ? "left-5" : "right-5"
        )}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg max-w-xs",
                toast.type === "success"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-red-100 bg-red-50 text-red-700"
              )}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        actions={
          <AddButton onClick={openAdd}>{t("addPermission")}</AddButton>
        }
      />

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* ── Table card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {(
                  ["tag", "label", "key", "description", "status", "actions"] as const
                ).map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-start font-semibold text-gray-500 whitespace-nowrap text-xs uppercase tracking-wide"
                  >
                    {t(`col.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-gray-400">
                    {t("noPermissions")}
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    onClick={() => openView(p)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-mono font-medium">
                        {p.permission_tag}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {p.permission_label}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {p.permission_key}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs max-w-44 truncate">
                      {p.description ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {p.is_active
                          ? t("status.active")
                          : t("status.inactive")}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          title={tCommon("edit")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#0A3D62] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openHistory(p)}
                          title={t("historyBtn")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#28B8B1] transition-colors"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(p);
                            setSheetMode("view");
                            setConfirmDelete(true);
                            setServerError("");
                            setSheetOpen(true);
                          }}
                          title={tCommon("delete")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="flex items-center px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          <span>
            <strong className="text-gray-600">{filtered.length}</strong>{" "}
            {tCommon("of")}{" "}
            <strong className="text-gray-600">{permissions.length}</strong>{" "}
            {t("permissionCountLabel")}
          </span>
        </div>
      </div>

      {/* ── Main Sheet (add / view / edit) ───────────────────────────── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent side="right" className="w-full max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>{sheetDesc}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* ── VIEW MODE ──────────────────────────────────────────── */}
            {sheetMode === "view" && selected && !confirmDelete && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <InfoField
                    label={t("form.permissionTag")}
                    value={
                      <span className="font-mono rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-medium">
                        {selected.permission_tag}
                      </span>
                    }
                  />
                  <InfoField
                    label={t("form.permissionLabel")}
                    value={selected.permission_label}
                  />
                  <InfoField
                    label={t("form.permissionKey")}
                    value={selected.permission_key}
                    mono
                  />
                  <InfoField
                    label={t("form.description")}
                    value={selected.description ?? "—"}
                  />
                  <InfoField
                    label={t("form.isActive")}
                    value={
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          selected.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {selected.is_active
                          ? t("status.active")
                          : t("status.inactive")}
                      </span>
                    }
                  />
                  <InfoField
                    label={t("createdAt")}
                    value={new Date(selected.created_at).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  />
                </div>
                {serverError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {serverError}
                  </div>
                )}
              </>
            )}

            {/* ── DELETE CONFIRMATION ────────────────────────────────── */}
            {sheetMode === "view" && selected && confirmDelete && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">
                  {t("deleteTitle")}
                </p>
                <p className="text-xs text-red-600">{t("deleteDesc")}</p>
                <p className="text-xs text-red-500 font-mono truncate">
                  {selected.permission_key}
                </p>
                {serverError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {serverError}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1"
                    disabled={deleting}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={deleting}
                    onClick={onDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {tCommon("saving")}
                      </span>
                    ) : (
                      t("confirmDelete")
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ── ADD / EDIT FORM ────────────────────────────────────── */}
            {(sheetMode === "add" || sheetMode === "edit") && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                id="perm-form"
              >
                {/* permission_tag */}
                <div className="space-y-1.5">
                  <Label htmlFor="perm-tag">{t("form.permissionTag")}</Label>
                  <Input
                    id="perm-tag"
                    placeholder={t("form.tagPlaceholder")}
                    {...register("permission_tag")}
                    className={
                      errors.permission_tag
                        ? "border-red-400 focus-visible:ring-red-300"
                        : ""
                    }
                  />
                  {errors.permission_tag && (
                    <p className="text-xs text-red-500">
                      {errors.permission_tag.message}
                    </p>
                  )}
                </div>

                {/* permission_label */}
                <div className="space-y-1.5">
                  <Label htmlFor="perm-label">
                    {t("form.permissionLabel")}
                  </Label>
                  <Input
                    id="perm-label"
                    placeholder={t("form.labelPlaceholder")}
                    {...register("permission_label")}
                    className={
                      errors.permission_label
                        ? "border-red-400 focus-visible:ring-red-300"
                        : ""
                    }
                  />
                  {errors.permission_label && (
                    <p className="text-xs text-red-500">
                      {errors.permission_label.message}
                    </p>
                  )}
                </div>

                {/* permission_key */}
                <div className="space-y-1.5">
                  <Label htmlFor="perm-key">{t("form.permissionKey")}</Label>
                  <Input
                    id="perm-key"
                    placeholder={t("form.keyPlaceholder")}
                    {...register("permission_key")}
                    className={cn(
                      "font-mono text-xs",
                      errors.permission_key
                        ? "border-red-400 focus-visible:ring-red-300"
                        : ""
                    )}
                  />
                  {errors.permission_key && (
                    <p className="text-xs text-red-500">
                      {errors.permission_key.message}
                    </p>
                  )}
                </div>

                {/* description */}
                <div className="space-y-1.5">
                  <Label htmlFor="perm-desc">{t("form.description")}</Label>
                  <textarea
                    id="perm-desc"
                    rows={3}
                    placeholder={t("form.descriptionPlaceholder")}
                    {...register("description")}
                    className={cn(
                      "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none",
                      errors.description
                        ? "border-red-400 focus-visible:ring-red-300"
                        : ""
                    )}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* is_active toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <Label className="text-sm font-medium text-gray-800 cursor-pointer">
                    {t("form.isActive")}
                  </Label>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value}
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          field.value ? "bg-[#28B8B1]" : "bg-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                            field.value ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    )}
                  />
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

          {/* ── Sheet Footer ────────────────────────────────────────── */}
          <SheetFooter className="px-6 py-4 border-t border-gray-100">
            {(sheetMode === "add" || sheetMode === "edit") && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    sheetMode === "edit" && selected
                      ? openView(selected)
                      : closeSheet()
                  }
                  className="flex-1"
                  type="button"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tCommon("saving")}
                    </span>
                  ) : sheetMode === "add" ? (
                    t("addPermission")
                  ) : (
                    tCommon("saveChanges")
                  )}
                </Button>
              </>
            )}

            {sheetMode === "view" && selected && !confirmDelete && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  {t("deleteBtn")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openHistory(selected)}
                  className="flex-1 border-[#28B8B1] text-[#28B8B1] hover:bg-[#E6F7F7] hover:text-[#28B8B1] hover:border-[#28B8B1]"
                >
                  {t("historyBtn")}
                </Button>
                <Button
                  onClick={() => openEdit(selected)}
                  className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                >
                  {t("editBtn")}
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── History Sheet ────────────────────────────────────────────── */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>{t("historyTitle")}</SheetTitle>
            <SheetDescription className="font-mono text-xs truncate">
              {historyPermission?.permission_key}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 p-4 space-y-2"
                >
                  <div className="h-4 animate-pulse rounded bg-slate-100 w-24" />
                  <div className="h-3 animate-pulse rounded bg-slate-100 w-36" />
                  <div className="h-3 animate-pulse rounded bg-slate-100 w-full" />
                </div>
              ))
            ) : historyRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                <Clock className="h-8 w-8" />
                <p className="text-sm">{t("noHistory")}</p>
              </div>
            ) : (
              historyRecords.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="rounded-xl border border-gray-100 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        rec.action === "created"
                          ? "bg-emerald-50 text-emerald-700"
                          : rec.action === "deleted"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {t(
                        `historyAction.${
                          rec.action as "created" | "updated" | "deleted"
                        }`
                      )}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(rec.performed_at).toLocaleString(
                        locale === "ar" ? "ar-EG" : "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  {rec.performed_by && (
                    <p className="text-xs text-gray-500">
                      By:{" "}
                      <span className="font-mono">{rec.performed_by}</span>
                    </p>
                  )}
                  {Object.keys(rec.snapshot).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-400 hover:text-gray-600 select-none">
                        Snapshot
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-600 font-mono leading-relaxed">
                        {JSON.stringify(rec.snapshot, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))
            )}
          </div>
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
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div
        className={cn(
          "text-sm text-gray-700",
          mono ? "font-mono" : "font-medium"
        )}
      >
        {value}
      </div>
    </div>
  );
}
