"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPublicContactRequest } from "@/services/contact-requests";
import type { ContactRequestType } from "@/types/api";

const REQUEST_TYPES = [
  "contact_request",
  "report_issue",
  "suggestion",
  "other",
] as const satisfies readonly ContactRequestType[];

const BUSINESS_CATEGORIES = [
  { value: "Retail", key: "retail" },
  { value: "Wholesale", key: "wholesale" },
  { value: "E-commerce", key: "ecommerce" },
  { value: "Food & Beverage", key: "foodBeverage" },
  { value: "Manufacturing", key: "manufacturing" },
  { value: "Distribution", key: "distribution" },
  { value: "Logistics", key: "logistics" },
  { value: "Raw Materials", key: "rawMaterials" },
  { value: "Personal Use", key: "personalUse" },
  { value: "Small Team", key: "smallTeam" },
  { value: "Enterprise", key: "enterprise" },
] as const;

const inputBase =
  "w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-transparent transition-all duration-200 focus:bg-white";
const inputNormal = "focus:ring-2 focus:ring-teal-500/25";
const inputError = "ring-2 ring-red-400/40 bg-red-50/40 focus:ring-2 focus:ring-red-400/50";

export function ContactForm() {
  const t = useTranslations("landing.contact");
  const tCategories = useTranslations("landing.contact.categories");

  const requestTypeOptions: { value: ContactRequestType; label: string }[] = [
    { value: "contact_request", label: t("requestTypeContactRequest") },
    { value: "report_issue", label: t("requestTypeReportIssue") },
    { value: "suggestion", label: t("requestTypeSuggestion") },
    { value: "other", label: t("requestTypeOther") },
  ];
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(false);

  const schema = z
    .object({
      request_type: z.enum(REQUEST_TYPES),
      name: z.string().min(2, t("nameRequired")),
      email: z
        .string()
        .email()
        .optional()
        .or(z.literal("").transform(() => undefined)),
      phone: z.string().optional(),
      company: z.string().optional(),
      category: z.string().optional(),
      message: z.string().optional(),
    })
    .refine((d) => (d.email && d.email.length > 0) || (d.phone && d.phone.length > 0), {
      message: t("contactRequired"),
      path: ["phone"],
    });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { request_type: "contact_request" },
  });

  const requestType = watch("request_type");

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createPublicContactRequest({
        request_type: data.request_type,
        requester_name: data.name,
        company_name: data.company || null,
        business_category: data.category || null,
        message: data.message || null,
        email: data.email || null,
        phone: data.phone || null,
      }),
    onSuccess: (response) => {
      if (response.status_code === 200 || response.status_code === 201) {
        setSubmitted(true);
        setApiError(false);
        reset({ request_type: "contact_request" });
      } else {
        setApiError(true);
      }
    },
    onError: () => {
      setApiError(true);
    },
  });

  const onSubmit = (data: FormData) => {
    setApiError(false);
    mutation.mutate(data);
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
              {t("badge")}
            </span>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t("title")}
            </h2>
            <p className="text-sm text-gray-500">{t("subtitle")}</p>
          </div>

          {/* Card — deep soft shadow, no border */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgb(0,0,0,0.06),0_2px_8px_rgb(0,0,0,0.04)] sm:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                    <CheckCircle2 className="h-8 w-8 text-[#28B8B1]" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {t("successTitle")}
                  </h3>
                  <p className="text-sm text-gray-500">{t("successDesc")}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full bg-[#28B8B1] px-6 py-2 text-sm font-semibold text-white hover:bg-[#22A69F] transition-colors"
                  >
                    {t("sendAnother")}
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
                  {/* API error banner */}
                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <div>
                          <p className="text-xs font-semibold text-red-700">{t("errorTitle")}</p>
                          <p className="text-xs text-red-500">{t("errorDesc")}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Request type selector */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">{t("requestTypeLabel")}</p>
                    <input type="hidden" {...register("request_type")} />
                    <div className="grid grid-cols-2 gap-2">
                      {requestTypeOptions.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setValue("request_type", value, { shouldValidate: true })}
                          className={cn(
                            "rounded-full py-2 px-3 text-xs font-semibold transition-all duration-200",
                            requestType === value
                              ? "bg-teal-50 text-[#28B8B1] shadow-[0_0_0_2px_rgba(40,184,177,0.4)]"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {errors.request_type && (
                      <p className="mt-1 text-xs text-red-500">{errors.request_type.message}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      {t("nameLabel")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("name")}
                      placeholder={t("namePlaceholder")}
                      className={cn(inputBase, errors.name ? inputError : inputNormal)}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        {t("emailLabel")}
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className={cn(inputBase, errors.email ? inputError : inputNormal)}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        {t("phoneLabel")}
                      </label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        className={cn(inputBase, errors.phone ? inputError : inputNormal)}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Company + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        {t("companyLabel")}
                      </label>
                      <input
                        {...register("company")}
                        placeholder={t("companyPlaceholder")}
                        className={cn(inputBase, inputNormal)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        {t("categoryLabel")}
                      </label>
                      <select
                        {...register("category")}
                        className={cn(inputBase, inputNormal, "cursor-pointer")}
                      >
                        <option value="">{t("categoryPlaceholder")}</option>
                        {BUSINESS_CATEGORIES.map(({ value, key }) => (
                          <option key={value} value={value}>
                            {tCategories(key)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      {t("messageLabel")}
                    </label>
                    <textarea
                      {...register("message")}
                      placeholder={t("messagePlaceholder")}
                      rows={3}
                      className={cn(inputBase, inputNormal, "resize-none")}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#28B8B1] py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(40,184,177,0.2)] hover:bg-[#22A69F] disabled:opacity-60 transition-all"
                  >
                    {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mutation.isPending ? t("submitting") : t("submit")}
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
