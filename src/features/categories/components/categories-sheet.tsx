"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ImageIcon, Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createIndustry, updateIndustry } from "@/services/industries";
import { uploadImage } from "@/services/media";
import type { IndustryPublicRead } from "@/types/api";

function resolveImage(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${url}`;
}

type FormData = {
  name_en: string;
  name_ar: string;
  name_fr: string;
};

interface IndustrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry?: IndustryPublicRead;
  onSaved: (industry: IndustryPublicRead) => void;
}

export function IndustrySheet({ open, onOpenChange, industry, onSaved }: IndustrySheetProps) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState<"preview" | "edit">(industry ? "preview" : "edit");
  const [serverError, setServerError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schema = z.object({
    name_en: z.string().min(2, t("validation.nameEnRequired")),
    name_ar: z.string().min(2, t("validation.nameArRequired")),
    name_fr: z.string().min(2, t("validation.nameFrRequired")),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      setMode(industry ? "preview" : "edit");
      setServerError("");
      setImageError("");
      setImageUrl(industry?.image ?? "");
      reset(industry
        ? { name_en: industry.name_en, name_ar: industry.name_ar, name_fr: industry.name_fr }
        : { name_en: "", name_ar: "", name_fr: "" }
      );
    }
  }, [open, industry, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError("");
    const res = await uploadImage(file);
    if (res.Data?.file_url) {
      setImageUrl(res.Data.file_url);
    } else {
      setImageError(res.Message || tCommon("noResults"));
    }
    setImageUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    if (!imageUrl) {
      setImageError(t("validation.imageRequired"));
      return;
    }
    setServerError("");
    const payload = {
      name_en: data.name_en,
      name_ar: data.name_ar,
      name_fr: data.name_fr,
      image: imageUrl,
    };

    const res = industry
      ? await updateIndustry(industry.id, payload)
      : await createIndustry(payload);

    if (res.Data) {
      onSaved(res.Data);
      onOpenChange(false);
    } else {
      setServerError(res.Message || tCommon("noResults"));
    }
  };

  /* ─── Preview card ──────────────────────────────────────────────── */
  if (mode === "preview" && industry) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t("sheet.detailsTitle")}</SheetTitle>
            <SheetDescription>{t("sheet.detailsDesc")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-6">
            {industry.image && (
              <div className="overflow-hidden rounded-2xl bg-[#EBF3FB]">
                <img
                  src={resolveImage(industry.image)}
                  alt={industry.name_en}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {([
                { label: industry.name_en, badge: "EN", rtl: false },
                { label: industry.name_ar, badge: "AR", rtl: true },
                { label: industry.name_fr, badge: "FR", rtl: false },
              ] as const).map(({ label, badge, rtl }) => (
                <div
                  key={badge}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <p
                    className="font-semibold text-slate-800"
                    dir={rtl ? "rtl" : undefined}
                    style={rtl ? { fontFamily: "var(--font-arabic)" } : undefined}
                  >
                    {label}
                  </p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
                    {badge}
                  </span>
                </div>
              ))}
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

  /* ─── Edit / Add form ───────────────────────────────────────────── */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {industry ? t("sheet.editTitle") : t("sheet.addTitle")}
          </SheetTitle>
          <SheetDescription>
            {industry ? t("sheet.editDesc") : t("sheet.addDesc")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

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
                    src={resolveImage(imageUrl)}
                    alt="Industry"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <span className="text-xs font-semibold text-white">{t("sheet.changeImage")}</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                  <span className="mt-2 text-xs text-slate-400">{t("sheet.clickToUpload")}</span>
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

          <div className="space-y-1.5">
            <Label htmlFor="name_en">{t("sheet.nameEn")}</Label>
            <Input id="name_en" placeholder="e.g. Construction" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_ar">{t("sheet.nameAr")}</Label>
            <Input id="name_ar" placeholder="مثل: البناء" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_fr">{t("sheet.nameFr")}</Label>
            <Input id="name_fr" placeholder="ex. Construction" {...register("name_fr")} dir="ltr" />
            {errors.name_fr && <p className="text-xs text-red-500">{errors.name_fr.message}</p>}
          </div>
        </form>

        <SheetFooter>
          {industry ? (
            <Button variant="outline" type="button" onClick={() => setMode("preview")}>
              {tCommon("cancel")}
            </Button>
          ) : (
            <SheetClose asChild>
              <Button variant="outline" type="button">{tCommon("cancel")}</Button>
            </SheetClose>
          )}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || imageUploading}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {(isSubmitting || imageUploading) && (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            )}
            {industry ? tCommon("saveChanges") : t("addIndustry")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
