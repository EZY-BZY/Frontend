"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

type FormData = {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  iconEmoji?: string;
  parentId?: string;
};

async function saveCategory(data: FormData, existingId?: string): Promise<Category> {
  await new Promise((r) => setTimeout(r, 600));
  const slug = data.name_en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return {
    id: existingId ?? `CAT-${String(Date.now()).slice(-4)}`,
    name_en: data.name_en,
    name_ar: data.name_ar,
    name_fr: data.name_fr,
    slug,
    description_en: data.description_en,
    description_ar: data.description_en,
    description_fr: data.description_en,
    iconEmoji: data.iconEmoji || undefined,
    parentId: data.parentId || undefined,
    productCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  allCategories?: Category[];
  onSaved: (cat: Category) => void;
}

export function CategorySheet({ open, onOpenChange, category, allCategories = [], onSaved }: CategorySheetProps) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  const schema = z.object({
    name_en:        z.string().min(2, t("validation.nameEnRequired")),
    name_ar:        z.string().min(2, t("validation.nameArRequired")),
    name_fr:        z.string().min(2, t("validation.nameFrRequired")),
    description_en: z.string().min(4, t("validation.descEnRequired")),
    iconEmoji:      z.string().optional(),
    parentId:       z.string().optional(),
  });

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedParentId = watch("parentId");

  useEffect(() => {
    if (open) {
      reset(category
        ? {
            name_en: category.name_en, name_ar: category.name_ar, name_fr: category.name_fr,
            description_en: category.description_en,
            iconEmoji: category.iconEmoji ?? "",
            parentId: category.parentId ?? "",
          }
        : { name_en: "", name_ar: "", name_fr: "", description_en: "", iconEmoji: "", parentId: "" }
      );
    }
  }, [open, category, reset]);

  const onSubmit = async (data: FormData) => {
    const saved = await saveCategory(data, category?.id);
    onSaved(saved);
    onOpenChange(false);
  };

  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{category ? t("sheet.editTitle") : t("sheet.addTitle")}</SheetTitle>
          <SheetDescription>{t("sheet.description")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
          {/* Icon emoji + parent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="iconEmoji">{t("sheet.iconEmoji")}</Label>
              <Input id="iconEmoji" placeholder="⚙️" {...register("iconEmoji")} />
            </div>

            <div className="space-y-1.5">
              <Label>{t("sheet.parentCategory")}</Label>
              <Select
                value={selectedParentId ?? ""}
                onValueChange={(v) => setValue("parentId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("sheet.noneTopLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("sheet.noneTopLevel")}</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.iconEmoji ? `${c.iconEmoji} ` : ""}{c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* English name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_en">{t("sheet.nameEn")}</Label>
            <Input id="name_en" placeholder="e.g. Industrial Equipment" {...register("name_en")} />
            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
          </div>

          {/* Arabic name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_ar">{t("sheet.nameAr")}</Label>
            <Input id="name_ar" placeholder="مثل: المعدات الصناعية" dir="rtl" {...register("name_ar")} />
            {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar.message}</p>}
          </div>

          {/* French name */}
          <div className="space-y-1.5">
            <Label htmlFor="name_fr">{t("sheet.nameFr")}</Label>
            <Input id="name_fr" placeholder="ex. Équipements industriels" {...register("name_fr")} />
            {errors.name_fr && <p className="text-xs text-red-500">{errors.name_fr.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description_en">{t("sheet.descriptionLabel")}</Label>
            <Input id="description_en" placeholder={t("sheet.descriptionPlaceholder")} {...register("description_en")} />
            {errors.description_en && <p className="text-xs text-red-500">{errors.description_en.message}</p>}
          </div>
        </form>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => { onOpenChange(false); reset(); }}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {tCommon("saving")}
              </span>
            ) : category ? tCommon("saveChanges") : t("addCategory")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
