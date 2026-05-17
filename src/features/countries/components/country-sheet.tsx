"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, Pencil, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCountry, updateCountry } from "@/services/countries";
import type { CountryRead } from "@/types/api";

type FormData = {
  flag_emoji: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  phone_code: string;
  phone_regex: string;
  currency_en: string;
  currency_ar: string;
  currency_fr: string;
  currency_shortcut_en: string;
  currency_shortcut_ar: string;
  currency_shortcut_fr: string;
};

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: CountryRead;
  onSaved: (country: CountryRead) => void;
}

export function CountrySheet({ open, onOpenChange, country, onSaved }: CountrySheetProps) {
  const t = useTranslations("countries");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [mode, setMode] = useState<"preview" | "edit">(country ? "preview" : "edit");
  const [serverError, setServerError] = useState("");

  const schema = z.object({
    flag_emoji:  z.string().min(1, t("validation.flagRequired")),
    name_en:     z.string().min(2, t("validation.nameEnRequired")),
    name_ar:     z.string().min(2, t("validation.nameArRequired")),
    name_fr:     z.string().min(2, t("validation.nameFrRequired")),
    phone_code:  z.string().min(2, t("validation.phoneCodeRequired")).regex(/^\+\d+$/, t("validation.phoneCodeFormat")),
    phone_regex: z.string().min(1, t("validation.regexRequired")),
    currency_en: z.string().min(2, t("validation.currencyEnRequired")),
    currency_ar: z.string().min(2, t("validation.currencyArRequired")),
    currency_fr: z.string().min(2, t("validation.currencyFrRequired")),
    currency_shortcut_en: z.string().min(1, t("validation.currencyShortcutEnRequired")),
    currency_shortcut_ar: z.string().min(1, t("validation.currencyShortcutArRequired")),
    currency_shortcut_fr: z.string().min(1, t("validation.currencyShortcutFrRequired")),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      setMode(country ? "preview" : "edit");
      setServerError("");
      reset(country
        ? {
            flag_emoji:  country.flag_emoji,
            name_en:     country.name_en,
            name_ar:     country.name_ar,
            name_fr:     country.name_fr,
            phone_code:  country.phone_code,
            phone_regex: country.phone_regex,
            currency_en: country.currency_name_en,
            currency_ar: country.currency_name_ar,
            currency_fr: country.currency_name_fr,
            currency_shortcut_en: country.currency_shortcut_en,
            currency_shortcut_ar: country.currency_shortcut_ar,
            currency_shortcut_fr: country.currency_shortcut_fr,
          }
        : {
            flag_emoji: "", name_en: "", name_ar: "", name_fr: "",
            phone_code: "+", phone_regex: "",
            currency_en: "", currency_ar: "", currency_fr: "",
            currency_shortcut_en: "", currency_shortcut_ar: "", currency_shortcut_fr: "",
          }
      );
    }
  }, [open, country, reset]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const payload = {
      flag_emoji:           data.flag_emoji,
      name_en:              data.name_en,
      name_ar:              data.name_ar,
      name_fr:              data.name_fr,
      phone_code:           data.phone_code,
      phone_regex:          data.phone_regex,
      currency_name_en:     data.currency_en,
      currency_name_ar:     data.currency_ar,
      currency_name_fr:     data.currency_fr,
      currency_shortcut_en: data.currency_shortcut_en,
      currency_shortcut_ar: data.currency_shortcut_ar,
      currency_shortcut_fr: data.currency_shortcut_fr,
    };

    const res = country
      ? await updateCountry(country.id, payload)
      : await createCountry(payload);

    if (res.Data) {
      onSaved(res.Data);
      onOpenChange(false);
    } else {
      setServerError(res.details || res.Message || tCommon("noResults"));
    }
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
              <span className="text-5xl">{country.flag_emoji}</span>
              <div>
                <p className="text-xl font-bold text-[#0A3D62]">{country.name_en}</p>
                <p
                  className="text-sm text-slate-500"
                  dir="rtl"
                  style={{ fontFamily: "var(--font-arabic)" }}
                >
                  {country.name_ar}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{country.name_fr}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { labelKey: "details.phoneCode",  value: country.phone_code },
                { labelKey: "details.currencyEn", value: country.currency_name_en },
                { labelKey: "details.currencyAr", value: country.currency_name_ar },
                { labelKey: "details.currencyFr", value: country.currency_name_fr },
                { labelKey: "details.regex",      value: country.phone_regex },
                { labelKey: "details.id",         value: country.id },
                {
                  labelKey: "details.added",
                  value: new Date(country.created_at).toLocaleDateString(
                    locale === "ar" ? "ar-EG" : "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  ),
                },
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
          <SheetTitle className="flex items-center gap-2">
            <Globe2 className="h-4.5 w-4.5 text-[#0A3D62]" />
            {country ? t("sheet.editTitle") : t("sheet.addTitle")}
          </SheetTitle>
          <SheetDescription>
            {country ? t("sheet.editDesc") : t("sheet.addDesc")}
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
            <Label htmlFor="flag_emoji">{t("sheet.flagEmoji")}</Label>
            <Input id="flag_emoji" placeholder="🇦🇪" {...register("flag_emoji")} />
            {errors.flag_emoji && <p className="text-xs text-red-500">{errors.flag_emoji.message}</p>}
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

          <div className="space-y-1.5">
            <Label htmlFor="name_fr">{t("sheet.nameFr")}</Label>
            <Input id="name_fr" placeholder="Émirats arabes unis" {...register("name_fr")} dir="ltr" />
            {errors.name_fr && <p className="text-xs text-red-500">{errors.name_fr.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone_code">{t("sheet.phoneCode")}</Label>
              <Input id="phone_code" placeholder="+971" {...register("phone_code")} dir="ltr" />
              {errors.phone_code && <p className="text-xs text-red-500">{errors.phone_code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_regex">{t("sheet.regexField")}</Label>
              <Input
                id="phone_regex"
                placeholder="^5[024568]\d{7}$"
                {...register("phone_regex")}
                dir="ltr"
                className="font-mono text-xs"
              />
              {errors.phone_regex && <p className="text-xs text-red-500">{errors.phone_regex.message}</p>}
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("sheet.currencySection")}
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currency_en">{t("sheet.currencyEn")}</Label>
                  <Input id="currency_en" placeholder="UAE Dirham" {...register("currency_en")} dir="ltr" />
                  {errors.currency_en && <p className="text-xs text-red-500">{errors.currency_en.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency_shortcut_en">{t("sheet.currencyShortcutEn")}</Label>
                  <Input id="currency_shortcut_en" placeholder="AED" {...register("currency_shortcut_en")} dir="ltr" />
                  {errors.currency_shortcut_en && <p className="text-xs text-red-500">{errors.currency_shortcut_en.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currency_ar">{t("sheet.currencyAr")}</Label>
                  <Input id="currency_ar" placeholder="درهم إماراتي" {...register("currency_ar")} dir="rtl" />
                  {errors.currency_ar && <p className="text-xs text-red-500">{errors.currency_ar.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency_shortcut_ar">{t("sheet.currencyShortcutAr")}</Label>
                  <Input id="currency_shortcut_ar" placeholder="د.إ" {...register("currency_shortcut_ar")} dir="rtl" />
                  {errors.currency_shortcut_ar && <p className="text-xs text-red-500">{errors.currency_shortcut_ar.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currency_fr">{t("sheet.currencyFr")}</Label>
                  <Input id="currency_fr" placeholder="Dirham des Émirats arabes unis" {...register("currency_fr")} dir="ltr" />
                  {errors.currency_fr && <p className="text-xs text-red-500">{errors.currency_fr.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency_shortcut_fr">{t("sheet.currencyShortcutFr")}</Label>
                  <Input id="currency_shortcut_fr" placeholder="AED" {...register("currency_shortcut_fr")} dir="ltr" />
                  {errors.currency_shortcut_fr && <p className="text-xs text-red-500">{errors.currency_shortcut_fr.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </form>

        <SheetFooter>
          {country ? (
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
            disabled={isSubmitting}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {country ? tCommon("saveChanges") : t("addCountry")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
