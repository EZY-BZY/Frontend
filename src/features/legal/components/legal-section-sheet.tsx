"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import type { LegalSection } from "@/features/legal/data/mock-legal";

/* ─── Zod schema ─────────────────────────────────────────────────── */
const sectionSchema = z.object({
  titleEn: z.string().min(2, "Title (English) is required"),
  titleFr: z.string().min(2, "Le titre (français) est requis"),
  titleAr: z.string().min(2, "العنوان بالعربية مطلوب"),
  contentEn: z.string().min(10, "English content must be at least 10 characters"),
  contentFr: z.string().min(10, "Le contenu français doit comporter au moins 10 caractères"),
  contentAr: z.string().min(10, "المحتوى العربي مطلوب"),
});

export type LegalSectionFormData = z.infer<typeof sectionSchema>;

interface LegalSectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: LegalSection;
  onSave: (data: LegalSectionFormData) => Promise<void>;
}

export function LegalSectionSheet({
  open,
  onOpenChange,
  section,
  onSave,
}: LegalSectionSheetProps) {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const isEditing = Boolean(section);

  const schema = z.object({
    titleEn: z.string().min(2, t("validation.titleEnRequired")),
    titleFr: z.string().min(2, t("validation.titleFrRequired")),
    titleAr: z.string().min(2, t("validation.titleArRequired")),
    contentEn: z.string().min(10, t("validation.contentEnMin")),
    contentFr: z.string().min(10, t("validation.contentFrMin")),
    contentAr: z.string().min(10, t("validation.contentArRequired")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LegalSectionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleEn: "",
      titleFr: "",
      titleAr: "",
      contentEn: "",
      contentFr: "",
      contentAr: "",
    },
  });

  /* Pre-fill when editing */
  useEffect(() => {
    if (section) {
      reset({
        titleEn: section.titleEn,
        titleFr: section.titleFr,
        titleAr: section.titleAr,
        contentEn: section.contentEn,
        contentFr: section.contentFr,
        contentAr: section.contentAr,
      });
    } else {
      reset({
        titleEn: "",
        titleFr: "",
        titleAr: "",
        contentEn: "",
        contentFr: "",
        contentAr: "",
      });
    }
  }, [section, reset]);

  const onSubmit = async (data: LegalSectionFormData) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? t("sheet.editTitle") : t("sheet.addTitle")}</SheetTitle>
          <SheetDescription>
            {isEditing ? t("sheet.editDesc") : t("sheet.addDesc")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-6 py-6">
          {/* ── English fields ─────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              {tCommon("all")} (EN)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="titleEn">{t("sheet.titleEn")}</Label>
              <Input
                id="titleEn"
                placeholder={t("sheet.titleEn") + "..."}
                {...register("titleEn")}
                dir="ltr"
              />
              {errors.titleEn && (
                <p className="text-xs text-red-500">{errors.titleEn.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contentEn">{t("sheet.contentEn")}</Label>
              <textarea
                id="contentEn"
                rows={5}
                placeholder={t("sheet.contentEn") + "..."}
                {...register("contentEn")}
                dir="ltr"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.contentEn && (
                <p className="text-xs text-red-500">{errors.contentEn.message}</p>
              )}
            </div>
          </fieldset>

          {/* ── French fields ─────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Français (FR)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="titleFr">{t("sheet.titleFr")}</Label>
              <Input
                id="titleFr"
                placeholder={t("sheet.titleFr") + "..."}
                {...register("titleFr")}
                dir="ltr"
              />
              {errors.titleFr && (
                <p className="text-xs text-red-500">{errors.titleFr.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contentFr">{t("sheet.contentFr")}</Label>
              <textarea
                id="contentFr"
                rows={5}
                placeholder={t("sheet.contentFr") + "..."}
                {...register("contentFr")}
                dir="ltr"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.contentFr && (
                <p className="text-xs text-red-500">{errors.contentFr.message}</p>
              )}
            </div>
          </fieldset>

          {/* ── Arabic fields ──────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              العربية (AR)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="titleAr">{t("sheet.titleAr")}</Label>
              <Input
                id="titleAr"
                placeholder={t("sheet.titleAr") + "..."}
                {...register("titleAr")}
                dir="rtl"
                style={{ fontFamily: "var(--font-arabic)" }}
              />
              {errors.titleAr && (
                <p className="text-xs text-red-500 text-end">{errors.titleAr.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contentAr">{t("sheet.contentAr")}</Label>
              <textarea
                id="contentAr"
                rows={5}
                placeholder={t("sheet.contentAr") + "..."}
                {...register("contentAr")}
                dir="rtl"
                style={{ fontFamily: "var(--font-arabic)" }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.contentAr && (
                <p className="text-xs text-red-500 text-end">{errors.contentAr.message}</p>
              )}
            </div>
          </fieldset>
        </form>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              {tCommon("cancel")}
            </Button>
          </SheetClose>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isEditing ? tCommon("saveChanges") : t("addSection")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
