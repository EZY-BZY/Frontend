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
  iso:      z.string().min(2).max(3).toUpperCase(),
  name_en:  z.string().min(2, "English name required"),
  name_ar:  z.string().min(2, "Arabic name required"),
  currency: z.string().min(2).max(4),
  flag:     z.string().min(1, "Flag emoji required"),
});

type FormData = z.infer<typeof schema>;

interface CountrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country;
  onSaved: (country: Country) => void;
}

export function CountrySheet({ open, onOpenChange, country, onSaved }: CountrySheetProps) {
  /* "preview" only exists when viewing an existing country */
  const [mode, setMode] = useState<"preview" | "edit">(country ? "preview" : "edit");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      setMode(country ? "preview" : "edit");
      reset(country
        ? { iso: country.iso, name_en: country.name_en, name_ar: country.name_ar, currency: country.currency, flag: country.flag }
        : { iso: "", name_en: "", name_ar: "", currency: "", flag: "" }
      );
    }
  }, [open, country, reset]);

  const onSubmit = async (data: FormData) => {
    const saved = await saveCountry(data, country?.id);
    onSaved(saved);
    onOpenChange(false);
  };

  /* ─── Preview card ─────────────────────────────────────────────── */
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
                { label: "ISO Code", value: country.iso },
                { label: "Currency", value: country.currency },
                { label: "ID", value: country.id },
                { label: "Added", value: new Date(country.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 font-mono text-sm">{value}</p>
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

  /* ─── Edit form ────────────────────────────────────────────────── */
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
          <div className="grid grid-cols-2 gap-4">
            {/* ISO code */}
            <div className="space-y-1.5">
              <Label htmlFor="iso">ISO Code</Label>
              <Input id="iso" placeholder="AE" {...register("iso")} className="uppercase" />
              {errors.iso && <p className="text-xs text-red-500">{errors.iso.message}</p>}
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="AED" {...register("currency")} className="uppercase" />
              {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
            </div>
          </div>

          {/* Flag emoji */}
          <div className="space-y-1.5">
            <Label htmlFor="flag">Flag Emoji</Label>
            <Input id="flag" placeholder="🇦🇪" {...register("flag")} />
            {errors.flag && <p className="text-xs text-red-500">{errors.flag.message}</p>}
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
