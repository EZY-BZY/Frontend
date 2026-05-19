"use client";

import { useState, useCallback, useDeferredValue } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { listCategories, deleteCategory } from "@/services/categories";
import { CategorySheet } from "./category-sheet";
import type { CategoryPublicRead } from "@/types/api";

// ─── Query key (exported for use in category-sheet.tsx) ──────────────────────
export const CATEGORY_QUERY_KEY = ["categories"] as const;

const PAGE_SIZE = 10;

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastItem = { id: number; type: "success" | "error"; message: string };

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 inset-e-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "border-emerald-100 bg-white text-emerald-700"
                : "border-red-100 bg-white text-red-600"
            }`}
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
  );
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

function DeleteDialog({
  category,
  onConfirm,
  onCancel,
  isPending,
}: {
  category: CategoryPublicRead;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("userCategories");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const name =
    locale === "ar"
      ? category.name_ar
      : locale === "fr"
      ? category.name_fr
      : category.name_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-800">
          {t("confirmDelete.title")}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {t("confirmDelete.desc")}{" "}
          <span className="font-semibold text-slate-700">{name}</span>
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("confirmDelete.confirm")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Category table for one tab ───────────────────────────────────────────────

function CategoryTabTable({
  isGlobal,
  emptyKey,
  onAdd,
  onEdit,
  onDelete,
}: {
  isGlobal: boolean;
  emptyKey: "noCategoriesByUsers" | "noCategoriesByAdmins";
  onAdd?: () => void;
  onEdit: (cat: CategoryPublicRead) => void;
  onDelete: (cat: CategoryPublicRead) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("userCategories");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  const { data, isFetching, isError } = useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, { isGlobal, search: deferredSearch, page }],
    queryFn: async () => {
      const res = await listCategories({
        is_global: isGlobal,
        search: deferredSearch || null,
        page,
        page_size: PAGE_SIZE,
      });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    placeholderData: (prev) => prev,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const nameKey =
    locale === "ar" ? "name_ar" : locale === "fr" ? "name_fr" : "name_en";
  const descKey =
    locale === "ar"
      ? "description_ar"
      : locale === "fr"
      ? "description_fr"
      : "description_en";

  const items = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const dateFormatter = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-4 pt-4">
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t("searchPlaceholder")}
        actions={onAdd && <AddButton onClick={onAdd}>{t("addCategory")}</AddButton>}
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
          <span className="text-xs text-slate-400">
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              <>
                <strong className="text-slate-700">{data?.total ?? 0}</strong>{" "}
                {t("categoryCountLabel")}
              </>
            )}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {(["category", "description", "status", "createdAt"] as const).map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {t(`col.${h}`)}
                    </th>
                  )
                )}
                <th className="px-5 py-3.5">
                  <span className="sr-only">{tCommon("actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-32 text-center text-red-400 text-sm"
                  >
                    {tCommon("error")}
                  </td>
                </tr>
              ) : items.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-32 text-center text-slate-400 text-sm"
                  >
                    {t(emptyKey)}
                  </td>
                </tr>
              ) : (
                items.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors"
                  >
                    {/* Name + image */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={
                              cat.image.startsWith("http")
                                ? cat.image
                                : `${process.env.NEXT_PUBLIC_API_URL ?? ""}${cat.image}`
                            }
                            alt={cat.name_en}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover bg-slate-100"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EBF3FB] text-[#0A3D62] text-xs font-bold">
                            {cat.name_en.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">
                            {cat[nameKey]}
                          </p>
                          {locale !== "ar" && (
                            <p className="text-xs text-slate-400" dir="rtl">
                              {cat.name_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-xs truncate">
                      {cat[descKey] || "—"}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          cat.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {cat.is_active ? t("active") : t("inactive")}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {dateFormatter(cat.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onEdit(cat)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] transition-colors inline-flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          {tCommon("edit")}
                        </button>
                        <button
                          onClick={() => onDelete(cat)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {tCommon("delete")}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}

              {/* Skeleton rows while fetching */}
              {isFetching && items.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-slate-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-50 px-5 py-3">
            <span className="text-xs text-slate-400">
              {tCommon("page")} {page} {tCommon("of")} {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#28B8B1] hover:text-[#0A3D62] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main tabs view ───────────────────────────────────────────────────────────

export function CategoriesTabsView() {
  const t = useTranslations("userCategories");
  const queryClient = useQueryClient();

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCategory, setSheetCategory] = useState<CategoryPublicRead | null>(null);
  const [sheetIsGlobal, setSheetIsGlobal] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryPublicRead | null>(null);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await deleteCategory(categoryId);
      if (res.status_code >= 400) throw new Error(res.Message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      addToast("success", t("toast.deleteSuccess"));
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      addToast("error", err.message || t("toast.deleteError"));
      setDeleteTarget(null);
    },
  });

  const openCreate = (isGlobal: boolean) => {
    setSheetCategory(null);
    setSheetIsGlobal(isGlobal);
    setSheetOpen(true);
  };

  const openEdit = (cat: CategoryPublicRead) => {
    setSheetCategory(cat);
    setSheetIsGlobal(cat.is_global);
    setSheetOpen(true);
  };

  return (
    <>
      <Tabs defaultValue="byAdmins">
        <TabsList className="rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="byAdmins" className="rounded-lg text-sm px-5">
            {t("tabsByAdmins")}
          </TabsTrigger>
          <TabsTrigger value="byUsers" className="rounded-lg text-sm px-5">
            {t("tabsByUsers")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="byAdmins">
          <CategoryTabTable
            isGlobal={true}
            emptyKey="noCategoriesByAdmins"
            onAdd={() => openCreate(true)}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </TabsContent>

        <TabsContent value="byUsers">
          <CategoryTabTable
            isGlobal={false}
            emptyKey="noCategoriesByUsers"
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </TabsContent>
      </Tabs>

      <CategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={sheetCategory}
        isGlobal={sheetIsGlobal}
        onSuccess={(type) => addToast("success", t(`toast.${type}Success`))}
        onError={(msg) => addToast("error", msg)}
      />

      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            category={deleteTarget}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </>
  );
}
