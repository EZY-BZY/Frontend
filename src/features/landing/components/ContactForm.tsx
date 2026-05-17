"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "seller" | "supplier" | "user";

const CATEGORIES: Record<Role, string[]> = {
  seller: ["Retail", "Wholesale", "E-commerce", "Food & Beverage"],
  supplier: ["Manufacturing", "Distribution", "Logistics", "Raw Materials"],
  user: ["Personal Use", "Small Team", "Enterprise"],
};

export function ContactForm() {
  const t = useTranslations("landing.contact");
  const [role, setRole] = useState<Role>("seller");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    name: z.string().min(2, t("nameRequired")),
    phone: z.string().min(7, t("phoneRequired")),
    company: z.string().optional(),
    category: z.string().optional(),
    message: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setSubmitted(true);
    reset();
  };

  const roles: { key: Role; label: string }[] = [
    { key: "seller", label: t("roleSeller") },
    { key: "supplier", label: t("roleSupplier") },
    { key: "user", label: t("roleUser") },
  ];

  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-[#28B8B1]/30 bg-[#28B8B1]/10 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
              {t("badge")}
            </span>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="text-sm text-white/50">{t("subtitle")}</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm sm:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#28B8B1]/15">
                    <CheckCircle2 className="h-8 w-8 text-[#28B8B1]" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {t("successTitle")}
                  </h3>
                  <p className="text-sm text-white/50">{t("successDesc")}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full bg-[#28B8B1] px-6 py-2 text-sm font-semibold text-white hover:bg-[#22A69F] transition-colors"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Role selector */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-white/70">
                      {t("roleLabel")}
                    </p>
                    <div className="flex gap-2">
                      {roles.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setRole(key)}
                          className={cn(
                            "flex-1 rounded-full border py-2 text-xs font-semibold transition-all duration-200",
                            role === key
                              ? "border-[#28B8B1] bg-[#28B8B1]/15 text-[#28B8B1]"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      {t("nameLabel")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("name")}
                      placeholder={t("namePlaceholder")}
                      className={cn(
                        "w-full rounded-xl border bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors",
                        errors.name
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#28B8B1]"
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      {t("phoneLabel")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      placeholder={t("phonePlaceholder")}
                      type="tel"
                      className={cn(
                        "w-full rounded-xl border bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors",
                        errors.phone
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-[#28B8B1]"
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Company + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/70">
                        {t("companyLabel")}
                      </label>
                      <input
                        {...register("company")}
                        placeholder={t("companyPlaceholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#28B8B1] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/70">
                        {t("categoryLabel")}
                      </label>
                      <select
                        {...register("category")}
                        className="w-full rounded-xl border border-white/10 bg-[#0A1628] px-4 py-2.5 text-sm text-white/70 outline-none focus:border-[#28B8B1] transition-colors"
                      >
                        <option value="">{t("categoryPlaceholder")}</option>
                        {CATEGORIES[role].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                      {t("messageLabel")}
                    </label>
                    <textarea
                      {...register("message")}
                      placeholder={t("messagePlaceholder")}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#28B8B1] transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#28B8B1] py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(40,184,177,0.25)] hover:bg-[#22A69F] disabled:opacity-60 transition-all"
                  >
                    {loading ? t("submitting") : t("submit")}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
