"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const languages = [
  { code: "en" as Locale, label: "EN" },
  { code: "ar" as Locale, label: "AR" },
  { code: "fr" as Locale, label: "FR" },
];

type Variant = "sidebar" | "auth" | "topbar";

interface LanguageSwitcherProps {
  variant?: Variant;
}

export function LanguageSwitcher({ variant = "topbar" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    // next-intl's typed router preserves the path and only swaps the locale
    router.replace(pathname, { locale: newLocale });
  };

  /* ── Topbar: segmented pill ── */
  if (variant === "topbar") {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
        <Globe className="h-3.5 w-3.5 text-slate-400 ms-1.5 shrink-0" />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code as Locale)}
            className={cn(
              "relative rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              locale === lang.code
                ? "text-[#0A3D62]"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {locale === lang.code && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-md bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10">{lang.label}</span>
          </button>
        ))}
      </div>
    );
  }

  /* ── Auth page: bordered pill ── */
  if (variant === "auth") {
    return (
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
        <Globe className="h-3.5 w-3.5 text-slate-400 ms-1.5 shrink-0" />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code as Locale)}
            className={cn(
              "relative rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              locale === lang.code ? "text-[#0A3D62]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {locale === lang.code && (
              <motion.span
                layoutId="lang-pill-auth"
                className="absolute inset-0 rounded-md bg-[#0A3D62]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={cn(
                "relative z-10",
                locale === lang.code ? "text-white" : ""
              )}
            >
              {lang.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  /* ── Sidebar footer: minimal text buttons ── */
  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code as Locale)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
            locale === lang.code
              ? "bg-[#0A3D62] text-white"
              : "text-slate-400 hover:text-[#0A3D62] hover:bg-slate-100"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
