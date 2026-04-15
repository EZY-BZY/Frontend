"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Package, Archive } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterBar, AddButton } from "@/components/shared/FilterBar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockBundles, mockBundleArchive } from "../data/mock-bundles";
import type { Bundle, BundleArchive } from "@/types";

/* ─── Zod schema for Create Bundle ─────────────────────────────── */
const bundleSchema = z.object({
  name:            z.string().min(2, "Bundle name required"),
  price:           z.coerce.number().min(0, "Price must be ≥ 0"),
  currency:        z.string().min(1, "Currency required").max(4),
  duration:        z.string().min(2, "Duration required (e.g. 12 months)"),
  featuresSummary: z.string().min(5, "Features summary required"),
});

type BundleFormValues = z.input<typeof bundleSchema>;
type BundleForm = z.infer<typeof bundleSchema>;

/* ─── Row animation ─────────────────────────────────────────────── */
const rowAnim = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.2 },
});

export function BundlesView() {
  const [bundles, setBundles] = useState<Bundle[]>(mockBundles);
  const [archive] = useState<BundleArchive[]>(mockBundleArchive);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BundleFormValues, unknown, BundleForm>({
    resolver: zodResolver(bundleSchema),
    defaultValues: { currency: "USD" },
  });

  /* ── Filtered active bundles ────────────────────────────────── */
  const filteredBundles = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return bundles;
    return bundles.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.featuresSummary.toLowerCase().includes(q) ||
        b.duration.toLowerCase().includes(q)
    );
  }, [search, bundles]);

  /* ── Filtered archive ────────────────────────────────────────── */
  const filteredArchive = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return archive;
    return archive.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.reason.toLowerCase().includes(q)
    );
  }, [search, archive]);

  /* ── Submit handler ─────────────────────────────────────────── */
  const onSubmit = async (data: BundleForm) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const newBundle: Bundle = {
      id: `BND-${String(Date.now()).slice(-4)}`,
      name: data.name,
      price: data.price,
      currency: data.currency,
      duration: data.duration,
      featuresSummary: data.featuresSummary,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBundles((prev) => [newBundle, ...prev]);
    setSheetOpen(false);
    reset();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* ── FilterBar ─────────────────────────────────────────────── */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bundles…"
        actions={<AddButton onClick={() => setSheetOpen(true)}>Create Bundle</AddButton>}
      />

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">
            <Package className="h-4 w-4" />
            Current Bundles
            <span className="ms-1.5 rounded-full bg-[#0A3D62]/10 px-2 py-0.5 text-[11px] font-bold text-[#0A3D62] tabular-nums">
              {filteredBundles.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <Archive className="h-4 w-4" />
            History
            <span className="ms-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums">
              {filteredArchive.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Current Bundles ────────────────────────────── */}
        <TabsContent value="current">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Bundle Name", "Price", "Duration", "Features Summary", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBundles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                        No active bundles found
                      </td>
                    </tr>
                  ) : (
                    filteredBundles.map((bundle, i) => (
                      <motion.tr
                        key={bundle.id}
                        {...rowAnim(i)}
                        className="border-b border-slate-50 last:border-0 hover:bg-[#EBF3FB]/40 transition-colors"
                      >
                        {/* Bundle Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
                              <Package className="h-4 w-4 text-[#0A3D62]" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 leading-tight">{bundle.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{bundle.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap" dir="ltr">
                          {bundle.price === 0 ? (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold border border-emerald-100">
                              Free
                            </span>
                          ) : (
                            <>
                              <span className="font-semibold">{bundle.price.toLocaleString()}</span>
                              <span className="ms-1 text-xs text-slate-400">{bundle.currency}</span>
                            </>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {bundle.duration}
                          </span>
                        </td>

                        {/* Features Summary */}
                        <td className="px-5 py-3.5 text-slate-500 text-xs max-w-72">
                          <p className="truncate" title={bundle.featuresSummary}>{bundle.featuresSummary}</p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
              {filteredBundles.length} of {bundles.length} bundles
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: History (Archive) ──────────────────────────── */}
        <TabsContent value="history">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Bundle Name", "Price", "Deactivation Date", "Reason for Deactivation"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredArchive.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="h-32 text-center text-slate-400 text-sm">
                        No archived bundles found
                      </td>
                    </tr>
                  ) : (
                    filteredArchive.map((bundle, i) => (
                      <motion.tr
                        key={bundle.id}
                        {...rowAnim(i)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Bundle Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                              <Archive className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-500 leading-tight">{bundle.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{bundle.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap text-xs" dir="ltr">
                          {bundle.price.toLocaleString()} {bundle.currency}
                        </td>

                        {/* Deactivation Date */}
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-red-50 border border-red-100 text-red-500 px-2.5 py-0.5 text-xs font-mono">
                            {new Date(bundle.deactivationDate).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-5 py-3.5 text-slate-400 text-xs max-w-80">
                          <p className="truncate" title={bundle.reason}>{bundle.reason}</p>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-50 px-5 py-2.5 text-xs text-slate-400">
              {filteredArchive.length} of {archive.length} archived bundles
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Create Bundle Sheet ────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#0A3D62]" />
              Create Bundle
            </SheetTitle>
            <SheetDescription>
              Define a new pricing bundle. It will appear as Active immediately.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="b-name">Bundle Name</Label>
              <Input
                id="b-name"
                placeholder="e.g. Enterprise"
                {...register("name")}
                className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-price">Price</Label>
                <Input
                  id="b-price"
                  type="number"
                  min={0}
                  placeholder="2400"
                  {...register("price")}
                  dir="ltr"
                  className={errors.price ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-currency">Currency</Label>
                <Input
                  id="b-currency"
                  placeholder="USD"
                  {...register("currency")}
                  className={`uppercase ${errors.currency ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                />
                {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="b-duration">Duration</Label>
              <Input
                id="b-duration"
                placeholder="e.g. 12 months"
                {...register("duration")}
                className={errors.duration ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
            </div>

            {/* Features Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="b-features">Features Summary</Label>
              <Input
                id="b-features"
                placeholder="e.g. Up to 25 users, 100 GB storage, Priority support"
                {...register("featuresSummary")}
                className={errors.featuresSummary ? "border-red-400 focus-visible:ring-red-300" : ""}
              />
              {errors.featuresSummary && <p className="text-xs text-red-500">{errors.featuresSummary.message}</p>}
            </div>
          </form>

          <SheetFooter className="px-6 py-4">
            <SheetClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={() => { setSheetOpen(false); reset(); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
              type="submit"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </span>
              ) : (
                "Create Bundle"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
