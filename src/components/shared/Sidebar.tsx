"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Tag,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

/* ─── Nav items ─────────────────────────────────────────────── */
const navItems = [
  { key: "dashboard", href: "", icon: LayoutDashboard },
  { key: "employees", href: "/employees", icon: Users },
  { key: "products", href: "/products", icon: Package },
  { key: "contactRequests", href: "/contact-requests", icon: MessageSquare },
  { key: "categories", href: "/categories", icon: Tag },
  { key: "eCatalog", href: "/e-catalog", icon: BookOpen },
] as const;

const SIDEBAR_W = 220; // px — collapsed is 68px

/* ─── Context ────────────────────────────────────────────────── */
interface SidebarCtx {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => {},
  openMobile: () => {},
  closeMobile: () => {},
});

export const useSidebarCtx = () => useContext(SidebarContext);

/* ─── Inner nav list (shared by desktop + drawer) ───────────── */
function NavList({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === "ar";

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2">
      <ul className="space-y-0.5">
        {navItems.map(({ key, href, icon: Icon }) => {
          const fullHref = `/${locale}${href}`;
          const isActive =
            href === ""
              ? pathname === `/${locale}` || pathname === `/${locale}/dashboard`
              : pathname.startsWith(`/${locale}${href}`);

          return (
            <li key={key}>
              <Link
                href={fullHref}
                onClick={onLinkClick}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? t(key as Parameters<typeof t>[0]) : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group select-none",
                  isActive
                    ? "bg-[#EBF3FB] text-[#0A3D62]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                {/* Animated active side-bar */}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className={cn(
                      "absolute inset-y-2 w-0.5 rounded-full bg-[#28B8B1]",
                      isRTL ? "inset-e-0" : "inset-s-0"
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}

                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "text-[#0A3D62]" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {t(key as Parameters<typeof t>[0])}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─── Desktop Sidebar Panel (flex child in the layout) ──────── */
export function SidebarPanel() {
  const { collapsed, toggleCollapsed } = useSidebarCtx();
  const isRTL = useLocale() === "ar";

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : SIDEBAR_W }}
      transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
      className="relative z-30 hidden min-h-0 h-screen shrink-0 flex-col bg-white md:flex"
      style={{
        borderInlineEnd: "1px solid #f1f5f9",
        direction: "ltr", // always LTR internally
      }}
      aria-label="Main navigation"
    >
      {/* Inner column clips horizontal overflow; toggle stays outside this wrapper so it is not clipped */}
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
          <Image src="/logo.png" alt="B-EASY" width={32} height={32} className="shrink-0 object-contain" priority />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap font-extrabold text-base text-[#0A3D62]"
              >
                B‑<span className="text-[#28B8B1]">EASY</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <NavList collapsed={collapsed} />

        {/* Language switcher (visible only when expanded) */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="lang"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="shrink-0 border-t border-slate-100 px-3 pb-4 pt-2"
            >
              <LanguageSwitcher variant="sidebar" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle — half outside the rail; aside z-30 > TopBar z-20 so it is not covered at the seam */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute top-14 z-40 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-500 shadow-md ring-1 ring-black/4 transition-[color,box-shadow,border-color] hover:border-[#28B8B1] hover:text-[#0A3D62] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B1]/40",
          isRTL ? "inset-s-0 -translate-x-1/2" : "inset-e-0 translate-x-1/2"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
        )}
      </button>
    </motion.aside>
  );
}

/* ─── Mobile Drawer ──────────────────────────────────────────── */
function MobileDrawer() {
  const { mobileOpen, closeMobile } = useSidebarCtx();

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeMobile}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 inset-s-0 z-50 flex w-64 flex-col bg-white shadow-2xl md:hidden"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="B-EASY" width={32} height={32} className="object-contain" />
                <span className="font-extrabold text-base text-[#0A3D62]">
                  B‑<span className="text-[#28B8B1]">EASY</span>
                </span>
              </div>
              <button
                onClick={closeMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <NavList collapsed={false} onLinkClick={closeMobile} />

            <div className="px-3 pb-4 pt-2 border-t border-slate-100 shrink-0">
              <LanguageSwitcher variant="sidebar" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile hamburger button (used in TopBar) ───────────────── */
export function MobileMenuButton() {
  const { openMobile } = useSidebarCtx();
  return (
    <button
      onClick={openMobile}
      className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

/* ─── Context Provider (pure context + mobile drawer) ────────── */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile }}>
      <MobileDrawer />
      {children}
    </SidebarContext.Provider>
  );
}
