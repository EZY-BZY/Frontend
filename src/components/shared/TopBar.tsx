"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  User,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenuButton } from "./Sidebar";

const pathToNavKey: Record<string, string> = {
  "": "dashboard",
  dashboard: "dashboard",
  employees: "employees",
  products: "products",
  "contact-requests": "contactRequests",
  categories: "categories",
  "e-catalog": "eCatalog",
};

export function TopBar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const isRTL = locale === "ar";

  const segments = pathname.replace(`/${locale}`, "").split("/").filter(Boolean);

  const breadcrumbs = [
    { label: t("dashboard"), href: `/${locale}` },
    ...segments.map((seg) => ({
      label: t((pathToNavKey[seg] ?? seg) as Parameters<typeof t>[0]),
      href: `/${locale}/${seg}`,
    })),
  ];

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 bg-white/95 px-4 md:px-5"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Mobile hamburger */}
      <MobileMenuButton />

      {/* Breadcrumbs */}
      <nav className="flex-1 min-w-0 hidden sm:block" aria-label="breadcrumb">
        <ol
          className={cn(
            "flex items-center gap-1 text-sm min-w-0",
            isRTL ? "flex-row-reverse" : ""
          )}
        >
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <Chevron className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              )}
              <span
                className={cn(
                  "truncate",
                  i === breadcrumbs.length - 1
                    ? "font-semibold text-[#0A3D62]"
                    : "text-slate-400 hover:text-slate-600 cursor-pointer"
                )}
              >
                {crumb.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2 ms-auto shrink-0">
        {/* Language switcher — segmented control */}
        <LanguageSwitcher variant="topbar" />

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 inset-e-1.5 h-2 w-2 rounded-full bg-[#28B8B1] ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A3D62] text-white text-xs font-bold select-none">
              A
            </span>
            <div className={cn("hidden sm:block", isRTL ? "text-end" : "text-start")}>
              <p className="text-xs font-semibold text-gray-800 leading-none">Admin</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                admin@b-easy.com
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                profileOpen ? "rotate-180" : ""
              )}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Click-away overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  key="profile-menu"
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className={cn(
                    "absolute top-full mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-lg shadow-black/5 py-1.5 z-20",
                    "inset-e-0"
                  )}
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-xs font-semibold text-gray-800">Admin User</p>
                    <p className="text-[11px] text-gray-400">admin@b-easy.com</p>
                  </div>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-slate-50 hover:text-[#0A3D62] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {tCommon("profile")}
                  </button>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-slate-50 hover:text-[#0A3D62] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {tCommon("settings")}
                  </button>
                  <div className="my-1 h-px bg-slate-50" />
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    {tCommon("logout")}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
