"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveCountry } from "@/features/countries/data/mock";
import type { Country } from "@/types";

type FormData = {
  iso: string;
  name_en: string;
  name_ar: string;
  currencyEn: string;
  currencyAr: string;
  currencyFr: string;
  flag: string;
  phoneCode: string;
  regex: string;
};

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country;
  onSaved: (country: Country) => void;
}

export function CountrySheet({ open, onOpenChange, country, onSaved }: CountrySheetProps) {
  const t = useTranslations("countries");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [mode, setMode] = useState<"preview" | "edit">(country ? "preview" : "edit");

  const schema = z.object({
    iso:        z.string().min(2).max(3).toUpperCase(),
    name_en:    z.string().min(2, t("validation.nameEnRequired")),
    name_ar:    z.string().min(2, t("validation.nameArRequired")),
    currencyEn: z.string().min(2, t("validation.currencyEnRequired")),
    currencyAr: z.string().min(2, t("validation.currencyArRequired")),
    currencyFr: z.string().min(2, t("validation.currencyFrRequired")),
    flag:       z.string().min(1, t("validation.flagRequired")),
    phoneCode:  z.string().min(2, t("validation.phoneCodeRequired")).regex(/^\+\d+$/, t("validation.phoneCodeFormat")),
    regex:      z.string().min(1, t("validation.regexRequired")),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      setMode(country ? "preview" : "edit");
      reset(country
        ? {
            iso: country.iso,
            name_en: country.name_en,
            name_ar: country.name_ar,
            currencyEn: country.currencyEn,
            currencyAr: country.currencyAr,
            currencyFr: country.currencyFr,
            flag: country.flag,
            phoneCode: country.phoneCode,
            regex: country.regex,
          }
        : { iso: "", name_en: "", name_ar: "", currencyEn: "", currencyAr: "", currencyFr: "", flag: "", phoneCode: "+", regex: "" }
      );
    }
  }, [open, country, reset]);

  const onSubmit = async (data: FormData) => {
    const saved = await saveCountry(data, country?.id);
    onSaved(saved);
    onOpenChange(false);
  };

  /* ─── Preview card ──────────────────────────────────────────────── */
  if (mode === "preview" && country) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t("sheet.detailsTitle")}</SheetTitle>
            <SheetDescription>{t("sheet.detailsDesc")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex items-center gap-4 rounded-2xl bg-[#EBF3FB] px-5 py-5">
              <span className="text-5xl">{country.flag}</span>
              <div>
                <p className="text-xl font-bold text-[#0A3D62]">{country.name_en}</p>
                <p className="text-sm text-slate-500" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>{country.name_ar}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { labelKey: "details.isoCode",    value: country.iso },
                { labelKey: "details.phoneCode",  value: country.phoneCode },
                { labelKey: "details.currencyEn", value: country.currencyEn },
                { labelKey: "details.currencyAr", value: country.currencyAr },
                { labelKey: "details.currencyFr", value: country.currencyFr },
                { labelKey: "details.regex",      value: country.regex },
                { labelKey: "details.id",         value: country.id },
                { labelKey: "details.added",      value: new Date(country.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
              ] as const).map(({ labelKey, value }) => (
                <div key={labelKey} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-400">{t(labelKey)}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 font-mono text-sm break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{tCommon("close")}</Button>
            </SheetClose>
            <Button onClick={() => setMode("edit")} className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90">
              <Pencil className="h-4 w-4" /> {tCommon("edit")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  /* ─── Edit form ─────────────────────────────────────────────────── */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe2 className="h-4.5 w-4.5 text-[#0A3D62]" />
            {country ? t("sheet.editTitle") : t("sheet.addTitle")}
          </SheetTitle>
          <SheetDescription>
            {country ? t("sheet.editDesc") : t("sheet.addDesc")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="iso">{t("sheet.isoCode")}</Label>
              <Input id="iso" placeholder="AE" {...register("iso")} className="uppercase" />
              {errors.iso && <p className="text-xs text-red-500">{errors.iso.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flag">{t("sheet.flagEmoji")}</Label>
              <Input id="flag" placeholder="🇦🇪" {...register("flag")} />
              {errors.flag && <p className="text-xs text-red-500">{errors.flag.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_en">{t("sheet.nameEn")}</Label>
            <Input id="name_en" placeholder="United Arab Emirates" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name_ar">{t("sheet.nameAr")}</Label>
            <Input id="name_ar" placeholder="الإمارات العربية المتحدة" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phoneCode">{t("sheet.phoneCode")}</Label>
              <Input id="phoneCode" placeholder="+971" {...register("phoneCode")} dir="ltr" />
              {errors.phoneCode && <p className="text-xs text-red-500">{errors.phoneCode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="regex">{t("sheet.regexField")}</Label>
              <Input id="regex" placeholder="^5[024568]\d{7}$" {...register("regex")} dir="ltr" className="font-mono text-xs" />
              {errors.regex && <p className="text-xs text-red-500">{errors.regex.message}</p>}
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("sheet.currencySection")}</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currencyEn">{t("sheet.currencyEn")}</Label>
                <Input id="currencyEn" placeholder="UAE Dirham" {...register("currencyEn")} dir="ltr" />
                {errors.currencyEn && <p className="text-xs text-red-500">{errors.currencyEn.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currencyAr">{t("sheet.currencyAr")}</Label>
                <Input id="currencyAr" placeholder="درهم إماراتي" {...register("currencyAr")} dir="rtl" />
                {errors.currencyAr && <p className="text-xs text-red-500">{errors.currencyAr.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currencyFr">{t("sheet.currencyFr")}</Label>
                <Input id="currencyFr" placeholder="Dirham des Émirats arabes unis" {...register("currencyFr")} dir="ltr" />
                {errors.currencyFr && <p className="text-xs text-red-500">{errors.currencyFr.message}</p>}
              </div>
            </div>
          </div>
        </form>

        <SheetFooter>
          {country ? (
            <Button variant="outline" type="button" onClick={() => setMode("preview")}>{tCommon("cancel")}</Button>
          ) : (
            <SheetClose asChild>
              <Button variant="outline" type="button">{tCommon("cancel")}</Button>
            </SheetClose>
          )}
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90">
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {country ? tCommon("saveChanges") : t("addCountry")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
