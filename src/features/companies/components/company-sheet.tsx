"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { saveCompany } from "@/features/companies/data/mock";
import type { Company, Country } from "@/types";

const schema = z.object({
  name_en:     z.string().min(2, "English name required"),
  name_ar:     z.string().min(2, "Arabic name required"),
  logo:        z.string().optional(),
  operatingIn: z.array(z.string()).min(1, "Select at least one country"),
});

type FormData = z.infer<typeof schema>;

interface CompanySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  countries: Country[];
  onSaved: (company: Company) => void;
}

export function CompanySheet({ open, onOpenChange, company, countries, onSaved }: CompanySheetProps) {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { operatingIn: [] } });

  useEffect(() => {
    if (open) {
      reset(company
        ? { name_en: company.name_en, name_ar: company.name_ar, logo: company.logo ?? "", operatingIn: company.operatingIn }
        : { name_en: "", name_ar: "", logo: "", operatingIn: [] }
      );
    }
  }, [open, company, reset]);

  const onSubmit = async (data: FormData) => {
    const saved = await saveCompany(
      { name_en: data.name_en, name_ar: data.name_ar, logo: data.logo || undefined, operatingIn: data.operatingIn },
      company?.id
    );
    onSaved(saved);
    onOpenChange(false);
  };

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: c.name_en,
    flag: c.flag,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{company ? "Edit Company" : "Add Company"}</SheetTitle>
          <SheetDescription>
            {company ? "Update company details and operating countries." : "Add a new company with bilingual names."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          {/* Logo emoji */}
          <div className="space-y-1.5">
            <Label htmlFor="logo">Logo Emoji (optional)</Label>
            <Input id="logo" placeholder="⚙️" {...register("logo")} />
          </div>

          {/* English name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_en">Name (English)</Label>
            <Input id="name_en" placeholder="Company name…" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          {/* Arabic name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_ar">Name (Arabic)</Label>
            <Input id="name_ar" placeholder="اسم الشركة…" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>

          {/* Operating in — Multi-Select */}
          <div className="space-y-1.5">
            <Label>Operating In</Label>
            <Controller
              name="operatingIn"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={countryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select countries…"
                />
              )}
            />
            {errors.operatingIn && (
              <p className="text-xs text-red-500">{errors.operatingIn.message}</p>
            )}
          </div>
        </form>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
          </SheetClose>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90"
          >
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {company ? "Save Changes" : "Add Company"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
