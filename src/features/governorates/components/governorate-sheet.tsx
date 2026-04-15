"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

const schema = z.object({
  name_en:   z.string().min(2, "English name required"),
  name_ar:   z.string().min(2, "Arabic name required"),
  countryId: z.string().min(1, "Parent country required"),
});

type FormData = z.infer<typeof schema>;

interface GovernorateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  governorate?: Governorate;
  countries: Country[];
  onSaved: (governorate: Governorate) => void;
}

export function GovernorateSheet({
  open, onOpenChange, governorate, countries, onSaved,
}: GovernorateSheetProps) {
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
          <SheetTitle>{governorate ? "Edit Governorate" : "Add Governorate"}</SheetTitle>
          <SheetDescription>
            {governorate ? "Update governorate details." : "Add a new region or governorate."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          {/* Parent country */}
          <div className="space-y-1.5">
            <Label>Parent Country</Label>
            <Select
              value={selectedCountryId}
              onValueChange={(v) => setValue("countryId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country…" />
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

          {/* English name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_en">Name (English)</Label>
            <Input id="name_en" placeholder="e.g. Dubai" {...register("name_en")} dir="ltr" />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          {/* Arabic name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_ar">Name (Arabic)</Label>
            <Input id="name_ar" placeholder="مثل: دبي" {...register("name_ar")} dir="rtl" />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
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
            {governorate ? "Save Changes" : "Add Governorate"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
