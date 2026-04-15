"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Globe2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveCountry } from "@/features/countries/data/mock";
import type { Country } from "@/types";

const schema = z.object({
  iso:        z.string().min(2).max(3).toUpperCase(),
  name_en:    z.string().min(2, "English name required"),
  name_ar:    z.string().min(2, "Arabic name required"),
  currencyEn: z.string().min(2, "English currency name required"),
  currencyAr: z.string().min(2, "Arabic currency name required"),
  currencyFr: z.string().min(2, "French currency name required"),
  flag:       z.string().min(1, "Flag emoji required"),
  phoneCode:  z.string().min(2, "Phone code required").regex(/^\+\d+$/, "Must start with + followed by digits"),
  regex:      z.string().min(1, "Regex pattern required"),
});

type FormData = z.infer<typeof schema>;

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country;
  onSaved: (country: Country) => void;
}

export function CountrySheet({ open, onOpenChange, country, onSaved }: CountrySheetProps) {
  const [mode, setMode] = useState<"preview" | "edit">(country ? "preview" : "edit");

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
            <SheetTitle>Country Details</SheetTitle>
            <SheetDescription>View and edit country information.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-6">
            {/* Flag + name hero */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#EBF3FB] px-5 py-5">
              <span className="text-5xl">{country.flag}</span>
              <div>
                <p className="text-xl font-bold text-[#0A3D62]">{country.name_en}</p>
                <p className="text-sm text-slate-500" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>
                  {country.name_ar}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "ISO Code",   value: country.iso },
                { label: "Phone Code", value: country.phoneCode },
                { label: "Currency (EN)", value: country.currencyEn },
                { label: "Currency (AR)", value: country.currencyAr },
                { label: "Currency (FR)", value: country.currencyFr },
                { label: "Regex",      value: country.regex },
                { label: "ID",         value: country.id },
                { label: "Added",      value: new Date(country.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 font-mono text-sm break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button
              onClick={() => setMode("edit")}
              className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
            >
              <Pencil className="h-4 w-4" /> Edit
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
            {country ? "Edit Country" : "Add Country"}
          </SheetTitle>
          <SheetDescription>
            {country ? "Update the country details." : "Fill in the fields to add a new country."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          {/* ISO + Flag */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="iso">ISO Code</Label>
              <Input id="iso" placeholder="AE" {...register("iso")} className="uppercase" />
              {errors.iso && <p className="text-xs text-red-500">{errors.iso.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flag">Flag Emoji</Label>
              <Input id="flag" placeholder="🇦🇪" {...register("flag")} />
              {errors.flag && <p className="text-xs text-red-500">{errors.flag.message}</p>}
            </div>
          </div>

          {/* English name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_en">Name (English)</Label>
            <Input id="name_en" placeholder="United Arab Emirates" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          {/* Arabic name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_ar">Name (Arabic)</Label>
            <Input id="name_ar" placeholder="الإمارات العربية المتحدة" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>

          {/* Phone Code + Regex */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phoneCode">Phone Code</Label>
              <Input id="phoneCode" placeholder="+971" {...register("phoneCode")} dir="ltr" />
              {errors.phoneCode && <p className="text-xs text-red-500">{errors.phoneCode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="regex">Regex Field</Label>
              <Input id="regex" placeholder="^5[024568]\d{7}$" {...register("regex")} dir="ltr" className="font-mono text-xs" />
              {errors.regex && <p className="text-xs text-red-500">{errors.regex.message}</p>}
            </div>
          </div>

          {/* Currency trilingual */}
          <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Currency (3 Languages)</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currencyEn">English</Label>
                <Input id="currencyEn" placeholder="UAE Dirham" {...register("currencyEn")} dir="ltr" />
                {errors.currencyEn && <p className="text-xs text-red-500">{errors.currencyEn.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currencyAr">Arabic</Label>
                <Input id="currencyAr" placeholder="درهم إماراتي" {...register("currencyAr")} dir="rtl" />
                {errors.currencyAr && <p className="text-xs text-red-500">{errors.currencyAr.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currencyFr">French</Label>
                <Input id="currencyFr" placeholder="Dirham des Émirats arabes unis" {...register("currencyFr")} dir="ltr" />
                {errors.currencyFr && <p className="text-xs text-red-500">{errors.currencyFr.message}</p>}
              </div>
            </div>
          </div>
        </form>

        <SheetFooter>
          {country ? (
            <Button variant="outline" type="button" onClick={() => setMode("preview")}>
              Cancel
            </Button>
          ) : (
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </SheetClose>
          )}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {country ? "Save Changes" : "Add Country"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
