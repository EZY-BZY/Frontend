"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveGovernorate } from "@/features/governorates/data/mock";
import type { Country, Governorate } from "@/types";

type FormData = { name_en: string; name_ar: string; countryId: string };

interface GovernorateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  governorate?: Governorate;
  countries: Country[];
  onSaved: (governorate: Governorate) => void;
}

export function GovernorateSheet({ open, onOpenChange, governorate, countries, onSaved }: GovernorateSheetProps) {
  const t = useTranslations("governorates");
  const tCommon = useTranslations("common");

  const schema = z.object({
    name_en:   z.string().min(2, t("validation.nameEnRequired")),
    name_ar:   z.string().min(2, t("validation.nameArRequired")),
    countryId: z.string().min(1, t("validation.countryRequired")),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedCountryId = watch("countryId");

  useEffect(() => {
    if (open) {
      reset(governorate
        ? { name_en: governorate.name_en, name_ar: governorate.name_ar, countryId: governorate.countryId }
        : { name_en: "", name_ar: "", countryId: "" }
      );
    }
  }, [open, governorate, reset]);

  const onSubmit = async (data: FormData) => {
    const saved = await saveGovernorate(data, governorate?.id);
    onSaved(saved);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{governorate ? t("sheet.editTitle") : t("sheet.addTitle")}</SheetTitle>
          <SheetDescription>
            {governorate ? t("sheet.editDesc") : t("sheet.addDesc")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          <div className="space-y-1.5">
            <Label>{t("sheet.parentCountry")}</Label>
            <Select
              value={selectedCountryId}
              onValueChange={(v) => setValue("countryId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("sheet.selectCountry")} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name_en}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryId && <p className="text-xs text-red-500">{errors.countryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_en">{t("sheet.nameEn")}</Label>
            <Input id="name_en" placeholder="e.g. Dubai" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_ar">{t("sheet.nameAr")}</Label>
            <Input id="name_ar" placeholder="مثل: دبي" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>
        </form>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" type="button" disabled={isSubmitting}>{tCommon("cancel")}</Button>
          </SheetClose>
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90">
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {governorate ? tCommon("saveChanges") : t("addGovernorates")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
