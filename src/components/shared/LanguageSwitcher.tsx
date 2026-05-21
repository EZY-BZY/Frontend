"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const languages = [
  { code: "en" as Locale, label: "EN", name: "English" },
  { code: "ar" as Locale, label: "AR", name: "العربية" },
  { code: "fr" as Locale, label: "FR", name: "Français" },
];

type Variant = "sidebar" | "auth" | "topbar" | "landing";

interface LanguageSwitcherProps {
  variant?: Variant;
}

function TopbarSegmentedPill({
  locale,
  onSwitch,
  layoutId,
}: {
  locale: Locale;
  onSwitch: (code: Locale) => void;
  layoutId: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
      <Globe className="h-3.5 w-3.5 text-slate-400 ms-1.5 shrink-0" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onSwitch(lang.code)}
          className={cn(
            "relative rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            locale === lang.code
              ? "text-[#0A3D62]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          {locale === lang.code && (
            <motion.span
              layoutId={layoutId}
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

function TopbarMobileDropdown({
  locale,
  onSwitch,
}: {
  locale: Locale;
  onSwitch: (code: Locale) => void;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === locale) ?? languages[0];

  const handleSelect = (code: Locale) => {
    setOpen(false);
    onSwitch(code);
  };

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#0A3D62] transition-colors hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("changeLanguage")}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="lang-menu"
              role="listbox"
              aria-label={t("changeLanguage")}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full z-20 mt-2 min-w-[9.5rem] rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-black/5 inset-e-0"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={locale === lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-sm transition-colors",
                    locale === lang.code
                      ? "bg-slate-50 font-medium text-[#0A3D62]"
                      : "text-gray-600 hover:bg-slate-50 hover:text-[#0A3D62]"
                  )}
                >
                  <span>{lang.name}</span>
                  {locale === lang.code && (
                    <Check className="h-4 w-4 shrink-0 text-[#0A3D62]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingLanguagePicker({
  locale,
  onSwitch,
}: {
  locale: Locale;
  onSwitch: (code: Locale) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-white/60 hover:bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 backdrop-blur-sm ring-1 ring-black/5 hover:ring-black/10 hover:shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span>{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-gray-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="listbox"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute top-full z-20 mt-2 min-w-[140px] rounded-2xl bg-white/95 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.10)] backdrop-blur-sm inset-e-0"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={locale === lang.code}
                  onClick={() => {
                    setOpen(false);
                    onSwitch(lang.code);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors",
                    locale === lang.code
                      ? "bg-teal-50 font-semibold text-[#28B8B1]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span>{lang.name}</span>
                  {locale === lang.code && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#28B8B1]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LanguageSwitcher({ variant = "topbar" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  /* ── Landing page: elegant globe-picker dropdown ── */
  if (variant === "landing") {
    return <LandingLanguagePicker locale={locale} onSwitch={switchLocale} />;
  }

  /* ── Topbar: mobile dropdown + desktop segmented pill ── */
  if (variant === "topbar") {
    return (
      <>
        <TopbarMobileDropdown locale={locale} onSwitch={switchLocale} />
        <div className="hidden sm:block">
          <TopbarSegmentedPill
            locale={locale}
            onSwitch={switchLocale}
            layoutId="lang-pill"
          />
        </div>
      </>
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
            type="button"
            onClick={() => switchLocale(lang.code)}
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
          type="button"
          onClick={() => switchLocale(lang.code)}
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
