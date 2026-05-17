"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { createTerm, updateTerm } from "@/services/terms";
import type { TermRead, TermType } from "@/types/api";

type FormData = {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
};

interface LegalSectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term?: TermRead;
  termType: TermType;
  onSaved: (term: TermRead) => void;
}

export function LegalSectionSheet({
  open,
  onOpenChange,
  term,
  termType,
  onSaved,
}: LegalSectionSheetProps) {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const isEditing = Boolean(term);
  const [serverError, setServerError] = useState("");

  const schema = z.object({
    name_en: z.string().min(2, t("validation.titleEnRequired")),
    name_ar: z.string().min(2, t("validation.titleArRequired")),
    name_fr: z.string().min(2, t("validation.titleFrRequired")),
    description_en: z.string().min(10, t("validation.contentEnMin")),
    description_ar: z.string().min(10, t("validation.contentArRequired")),
    description_fr: z.string().min(10, t("validation.contentFrMin")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      setServerError("");
      reset(
        term
          ? {
              name_en: term.name_en,
              name_ar: term.name_ar,
              name_fr: term.name_fr,
              description_en: term.description_en,
              description_ar: term.description_ar,
              description_fr: term.description_fr,
            }
          : { name_en: "", name_ar: "", name_fr: "", description_en: "", description_ar: "", description_fr: "" }
      );
    }
  }, [open, term, reset]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = term
      ? await updateTerm(term.id, data)
      : await createTerm({ ...data, type: termType });

    if (res.Data) {
      onSaved(res.Data);
      onOpenChange(false);
    } else {
      setServerError(res.Message || tCommon("noResults"));
    }
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
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          {/* ── English fields ──────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              {tCommon("all")} (EN)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="name_en">{t("sheet.titleEn")}</Label>
              <Input
                id="name_en"
                placeholder={t("sheet.titleEn") + "..."}
                {...register("name_en")}
                dir="ltr"
              />
              {errors.name_en && (
                <p className="text-xs text-red-500">{errors.name_en.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description_en">{t("sheet.contentEn")}</Label>
              <textarea
                id="description_en"
                rows={5}
                placeholder={t("sheet.contentEn") + "..."}
                {...register("description_en")}
                dir="ltr"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.description_en && (
                <p className="text-xs text-red-500">{errors.description_en.message}</p>
              )}
            </div>
          </fieldset>

          {/* ── French fields ───────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Français (FR)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="name_fr">{t("sheet.titleFr")}</Label>
              <Input
                id="name_fr"
                placeholder={t("sheet.titleFr") + "..."}
                {...register("name_fr")}
                dir="ltr"
              />
              {errors.name_fr && (
                <p className="text-xs text-red-500">{errors.name_fr.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description_fr">{t("sheet.contentFr")}</Label>
              <textarea
                id="description_fr"
                rows={5}
                placeholder={t("sheet.contentFr") + "..."}
                {...register("description_fr")}
                dir="ltr"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.description_fr && (
                <p className="text-xs text-red-500">{errors.description_fr.message}</p>
              )}
            </div>
          </fieldset>

          {/* ── Arabic fields ───────────────────────────────────────── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              العربية (AR)
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="name_ar">{t("sheet.titleAr")}</Label>
              <Input
                id="name_ar"
                placeholder={t("sheet.titleAr") + "..."}
                {...register("name_ar")}
                dir="rtl"
                style={{ fontFamily: "var(--font-tajawal)" }}
              />
              {errors.name_ar && (
                <p className="text-xs text-red-500 text-end">{errors.name_ar.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description_ar">{t("sheet.contentAr")}</Label>
              <textarea
                id="description_ar"
                rows={5}
                placeholder={t("sheet.contentAr") + "..."}
                {...register("description_ar")}
                dir="rtl"
                style={{ fontFamily: "var(--font-tajawal)" }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-1 resize-none"
              />
              {errors.description_ar && (
                <p className="text-xs text-red-500 text-end">{errors.description_ar.message}</p>
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
