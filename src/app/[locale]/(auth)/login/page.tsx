"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dashboardLogin } from "@/services/auth";
import type { ApiResponse, TokenResponse } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

type ValidationDetail = { loc: string[]; msg: string; type: string }[];

/** Prefer API `details` over generic `Message` (e.g. Message: "Error", details: "Invalid email or password"). */
function apiUserFacingMessage(
  res: ApiResponse<TokenResponse>,
  fallback: string
): string {
  const detail = res.details?.trim();
  if (detail) return detail;
  const msg = res.Message?.trim();
  if (msg && msg !== "Error") return msg;
  return fallback;
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setGeneralError("");

    const { data: res, httpStatus } = await dashboardLogin({
      email: data.email,
      password: data.password,
    });

    if (httpStatus >= 200 && httpStatus < 300 && res.Data?.access_token) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    // API may use 401 or 402 for wrong credentials; body often has `details`, `Message` may be generic "Error".
    if (httpStatus === 401 || httpStatus === 402) {
      setGeneralError(apiUserFacingMessage(res, t("invalidCredentials")));
      return;
    }

    if (httpStatus === 422) {
      const raw = res as unknown as Record<string, unknown>;
      const detail = raw.detail as ValidationDetail | undefined;
      if (Array.isArray(detail) && detail.length > 0) {
        let hasFieldError = false;
        detail.forEach(({ loc, msg }) => {
          const field = loc[loc.length - 1];
          if (field === "email" || field === "password") {
            setFieldError(field, { type: "server", message: msg });
            hasFieldError = true;
          }
        });
        if (!hasFieldError) {
          setGeneralError(apiUserFacingMessage(res, t("serverError")));
        }
      } else {
        setGeneralError(apiUserFacingMessage(res, t("serverError")));
      }
      return;
    }

    setGeneralError(apiUserFacingMessage(res, t("serverError")));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: login.png background ── */}
      <div className="relative hidden lg:block w-1/2 overflow-hidden">
        <Image
          src="/login.png"
          alt="B-EASY"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 90% 0, 100% 100%, 0 100%)",
            background: "transparent",
          }}
        />
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 sm:px-16 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/logo.png" alt="B-EASY" width={80} height={80} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            {t("welcome")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email")}
                autoComplete="email"
                {...register("email")}
                className="border-gray-200 h-12 rounded-xl text-gray-700 placeholder:text-gray-300 focus-visible:ring-[#0A3D62]"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                {t("password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  {...register("password")}
                  className="border-gray-200 h-12 rounded-xl text-gray-700 placeholder:text-gray-300 pe-10 focus-visible:ring-[#0A3D62]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* General error banner (401 / server errors) */}
            {generalError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center transition-all"
              >
                {generalError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#0A3D62] text-white font-semibold text-sm hover:bg-[#0A3D62]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("signingIn")}
                </span>
              ) : (
                t("signIn")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
