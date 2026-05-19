"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ImageIcon, Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategory, updateCategory } from "@/services/categories";
import { uploadImage } from "@/services/media";
import type { CategoryPublicRead } from "@/types/api";
import { CATEGORY_QUERY_KEY } from "./categories-tabs-view";

function resolveImage(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${url}`;
}

const baseSchema = z.object({
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  name_fr: z.string().optional().or(z.literal("")),
  description_en: z.string().optional().or(z.literal("")),
  description_ar: z.string().optional().or(z.literal("")),
  description_fr: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof baseSchema>;

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryPublicRead | null;
  isGlobal: boolean;
  onSuccess: (type: "create" | "update") => void;
  onError: (message: string) => void;
}

export function CategorySheet({
  open,
  onOpenChange,
  category,
  isGlobal,
  onSuccess,
  onError,
}: CategorySheetProps) {
  const t = useTranslations("userCategories");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"preview" | "edit">(
    category ? "preview" : "edit"
  );
  const [serverError, setServerError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name_en: z.string().min(1, t("validation.nameEnRequired")),
        name_ar: z.string().min(1, t("validation.nameArRequired")),
        name_fr: z.string().optional().or(z.literal("")),
        description_en: z.string().optional().or(z.literal("")),
        description_ar: z.string().optional().or(z.literal("")),
        description_fr: z.string().optional().or(z.literal("")),
      })
    ),
  });

  useEffect(() => {
    if (open) {
      setMode(category ? "preview" : "edit");
      setServerError("");
      setImageError("");
      setImageFile(null);
      setImageUrl(category?.image ?? "");
      reset(
        category
          ? {
              name_en: category.name_en,
              name_ar: category.name_ar,
              name_fr: category.name_fr ?? "",
              description_en: category.description_en ?? "",
              description_ar: category.description_ar ?? "",
              description_fr: category.description_fr ?? "",
            }
          : {
              name_en: "",
              name_ar: "",
              name_fr: "",
              description_en: "",
              description_ar: "",
              description_fr: "",
            }
      );
    }
  }, [open, category, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await createCategory({
        name_en: data.name_en,
        name_ar: data.name_ar,
        name_fr: data.name_fr || undefined,
        description_en: data.description_en || undefined,
        description_ar: data.description_ar || undefined,
        description_fr: data.description_fr || undefined,
        image: imageFile ?? undefined,
        company_id: isGlobal ? undefined : undefined, // always omit for admin-created global
      });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      onSuccess("create");
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setServerError(err.message);
      onError(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        setImageUploading(true);
        const uploadRes = await uploadImage(imageFile);
        setImageUploading(false);
        if (uploadRes.Data?.file_url) {
          finalImageUrl = uploadRes.Data.file_url;
        } else {
          throw new Error(uploadRes.Message || t("validation.imageUploadFailed"));
        }
      }
      const res = await updateCategory(category!.id, {
        name_en: data.name_en,
        name_ar: data.name_ar,
        name_fr: data.name_fr || null,
        description_en: data.description_en || null,
        description_ar: data.description_ar || null,
        description_fr: data.description_fr || null,
        image: finalImageUrl || null,
      });
      if (!res.Data) throw new Error(res.Message);
      return res.Data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      onSuccess("update");
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setImageUploading(false);
      setServerError(err.message);
      onError(err.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPending =
    isSubmitting ||
    imageUploading ||
    createMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    if (category) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  /* ─── Preview card ──────────────────────────────────────────────────── */
  if (mode === "preview" && category) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("sheet.detailsTitle")}</SheetTitle>
            <SheetDescription>{t("sheet.detailsDesc")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-6">
            {category.image && (
              <div className="overflow-hidden rounded-2xl bg-[#EBF3FB]">
                <img
                  src={resolveImage(category.image)}
                  alt={category.name_en}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {(
                [
                  { label: category.name_en, badge: "EN", rtl: false },
                  { label: category.name_ar, badge: "AR", rtl: true },
                  { label: category.name_fr, badge: "FR", rtl: false },
                ] as const
              ).map(({ label, badge, rtl }) => (
                <div
                  key={badge}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <p
                    className="font-semibold text-slate-800"
                    dir={rtl ? "rtl" : undefined}
                  >
                    {label || <span className="text-slate-400 italic text-sm">—</span>}
                  </p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
                    {badge}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  category.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {category.is_active ? t("active") : t("inactive")}
              </span>
              {category.is_global && (
                <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-semibold">
                  Global
                </span>
              )}
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{tCommon("close")}</Button>
            </SheetClose>
            <Button
              onClick={() => setMode("edit")}
              className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
            >
              <Pencil className="h-4 w-4" /> {tCommon("edit")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  /* ─── Edit / Add form ───────────────────────────────────────────────── */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {category ? t("sheet.editTitle") : t("sheet.addTitle")}
          </SheetTitle>
          <SheetDescription>
            {category ? t("sheet.editDesc") : t("sheet.addDesc")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-6"
        >
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>{t("sheet.imageLabel")}</Label>
            <div
              role="button"
              tabIndex={0}
              className="relative flex h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-[#0A3D62]/40 hover:bg-[#EBF3FB]/30"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              {imageUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#0A3D62]" />
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl.startsWith("blob:") ? imageUrl : resolveImage(imageUrl)}
                    alt="Category"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <span className="text-xs font-semibold text-white">
                      {t("sheet.changeImage")}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                  <span className="mt-2 text-xs text-slate-400">
                    {t("sheet.clickToUpload")}
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>

          {/* Name fields */}
          <div className="space-y-1.5">
            <Label htmlFor="name_en">{t("sheet.nameEn")} *</Label>
            <Input
              id="name_en"
              placeholder="e.g. Electronics"
              {...register("name_en")}
              dir="ltr"
            />
            {errors.name_en && (
              <p className="text-xs text-red-500">{errors.name_en.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_ar">{t("sheet.nameAr")} *</Label>
            <Input
              id="name_ar"
              placeholder="مثل: الإلكترونيات"
              {...register("name_ar")}
              dir="rtl"
            />
            {errors.name_ar && (
              <p className="text-xs text-red-500">{errors.name_ar.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_fr">{t("sheet.nameFr")}</Label>
            <Input
              id="name_fr"
              placeholder="ex. Électronique"
              {...register("name_fr")}
              dir="ltr"
            />
          </div>

          {/* Description fields */}
          <div className="space-y-1.5">
            <Label htmlFor="description_en">{t("sheet.descEn")}</Label>
            <Input
              id="description_en"
              placeholder="e.g. Consumer electronics and accessories"
              {...register("description_en")}
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description_ar">{t("sheet.descAr")}</Label>
            <Input
              id="description_ar"
              placeholder="مثل: الإلكترونيات الاستهلاكية والملحقات"
              {...register("description_ar")}
              dir="rtl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description_fr">{t("sheet.descFr")}</Label>
            <Input
              id="description_fr"
              placeholder="ex. Électronique grand public et accessoires"
              {...register("description_fr")}
              dir="ltr"
            />
          </div>
        </form>

        <SheetFooter>
          {category ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setMode("preview")}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
          ) : (
            <SheetClose asChild>
              <Button variant="outline" type="button" disabled={isPending}>
                {tCommon("cancel")}
              </Button>
            </SheetClose>
          )}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {category ? tCommon("saveChanges") : t("sheet.addTitle")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
