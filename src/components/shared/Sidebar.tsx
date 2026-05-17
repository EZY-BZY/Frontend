"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Tag,
  BookOpen,
  Scale,
  Shield,
  Truck,
  RotateCcw,
  UserCircle2,
  Globe2,
  Briefcase,
  Package,
  ChevronDown,
  LogOut,
  Settings,
  Database,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/* ─── Nav data ───────────────────────────────────────────────────── */
type NavItem = {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainItems: NavItem[] = [
  { key: "dashboard",       href: "/dashboard",                    icon: LayoutDashboard },
  { key: "employees",       href: "/employees",                    icon: Users },
  { key: "clients",         href: "/clients",                      icon: UserCircle2 },
  { key: "contactRequests", href: "/contact-requests",             icon: MessageSquare },
  { key: "categories",      href: "/categories",                   icon: Tag },
];

const companiesItem: NavItem = {
  key: "companies", href: "/companies", icon: Briefcase,
};

const financialItems: NavItem[] = [
  { key: "subscriptions", href: "/subscriptions", icon: BookOpen },
  { key: "bundles",       href: "/subscriptions/current-bundles", icon: Package },
];

const metadataItems: NavItem[] = [
  { key: "countries", href: "/countries", icon: Globe2 },
];

const legalItems: NavItem[] = [
  { key: "privacyPolicy",   href: "/privacy-policy",   icon: Shield },
  { key: "termsConditions", href: "/terms-conditions", icon: Scale },
  { key: "deliveryTerms",   href: "/delivery-terms",   icon: Truck },
  { key: "refundTerms",     href: "/refund-terms",     icon: RotateCcw },
];

/* ─── isActive ───────────────────────────────────────────────────── */
function getIsActive(href: string, locale: string, pathname: string): boolean {
  const full = `/${locale}${href}`;
  return (
    pathname === full ||
    (href !== "/subscriptions" && pathname.startsWith(full + "/"))
  );
}

/* ─── NavRow — a single menu item ───────────────────────────────── */
function NavRow({
  item,
  onLinkClick,
}: {
  item: NavItem;
  onLinkClick?: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isRTL = locale === "ar";
  const isActive = getIsActive(item.href, locale, pathname);
  const fullHref = `/${locale}${item.href}`;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={t(item.key as Parameters<typeof t>[0])}
      >
        <Link href={fullHref} onClick={onLinkClick}>
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
              "h-5 w-5 shrink-0",
              isActive
                ? "text-[#0A3D62]"
                : "text-gray-400 group-hover/btn:text-gray-600"
            )}
          />
          <AnimatePresence initial={false}>
            {state === "expanded" && (
              <motion.span
                key="label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap text-base"
              >
                {t(item.key as Parameters<typeof t>[0])}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ─── CollapsibleNavGroup — accordion item styled like a nav row ─── */
function CollapsibleNavGroup({
  navKey,
  icon: Icon,
  items,
  onLinkClick,
  defaultOpen = false,
}: {
  navKey: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  onLinkClick?: () => void;
  defaultOpen?: boolean;
}) {
  const t = useTranslations("nav");
  const { state } = useSidebar();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  const hasActiveChild = items.some((item) =>
    getIsActive(item.href, locale, pathname)
  );

  if (state === "collapsed") {
    return (
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <NavRow key={item.key} item={item} onLinkClick={onLinkClick} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <SidebarGroup className="p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible.Trigger asChild>
              <button
                type="button"
                className={cn(
                  "group/btn relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors select-none",
                  hasActiveChild
                    ? "text-[#0A3D62]"
                    : "text-gray-500 hover:bg-slate-100 hover:text-gray-700"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    hasActiveChild ? "text-[#0A3D62]" : "text-gray-400"
                  )}
                />
                <span className="flex-1 text-start text-base">
                  {t(navKey as Parameters<typeof t>[0])}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0",
                    open ? "rotate-180" : ""
                  )}
                />
              </button>
            </Collapsible.Trigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <Collapsible.Content>
          <SidebarGroupContent className="ps-3">
            <SidebarMenu>
              {items.map((item) => (
                <NavRow key={item.key} item={item} onLinkClick={onLinkClick} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </Collapsible.Content>
      </SidebarGroup>
    </Collapsible.Root>
  );
}

/* ─── Footer user card ───────────────────────────────────────────── */
function UserFooter() {
  const { state } = useSidebar();
  const tCommon = useTranslations("common");

  return (
    <SidebarFooter>
      <div className="border-t border-slate-100 px-3 py-3">
        {state === "collapsed" ? (
          <div className="flex justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A3D62] text-white text-xs font-bold select-none">
              A
            </span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A3D62] text-white text-xs font-bold select-none">
              A
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-none">
                {tCommon("adminUser")}
              </p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-none">
                admin@b-easy.com
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                title={tCommon("settings")}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-[#0A3D62] transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title={tCommon("logout")}
                onClick={logout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </SidebarFooter>
  );
}

/* ─── AppSidebar ─────────────────────────────────────────────────── */
export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void } = {}) {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isRTL = locale === "ar";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onLinkClick?.();
  };

  return (
    <Sidebar side={isRTL ? "right" : "left"} collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-100 px-4">
          <Image
            src="/logo.png"
            alt="B-EASY"
            width={100}
            height={40}
            className="shrink-0 object-contain"
            priority
          />
        </div>
      </SidebarHeader>

      {/* Nav scrolls; language switcher stays pinned above footer */}
      <SidebarContent className="min-h-0 overflow-hidden py-2">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

            {/* ── Management ───────────────────────────────── */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainItems.map((item) => (
                    <NavRow key={item.key} item={item} onLinkClick={handleLinkClick} />
                  ))}
                  <NavRow item={companiesItem} onLinkClick={handleLinkClick} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* ── Financial ────────────────────────────────── */}
            <SidebarGroup className="pt-1">
              {state === "expanded" && (
                <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {tNav("financial")}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {financialItems.map((item) => (
                    <NavRow key={item.key} item={item} onLinkClick={handleLinkClick} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <CollapsibleNavGroup
              navKey="metadata"
              icon={Database}
              items={metadataItems}
              onLinkClick={handleLinkClick}
            />

            <CollapsibleNavGroup
              navKey="legal"
              icon={Scale}
              items={legalItems}
              onLinkClick={handleLinkClick}
            />
          </div>

          <AnimatePresence initial={false}>
            {state === "expanded" && (
              <motion.div
                key="lang"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-auto shrink-0 border-t border-slate-100 px-3 pb-1 pt-2"
              >
                <LanguageSwitcher variant="sidebar" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarContent>

      {/* Footer */}
      <UserFooter />
    </Sidebar>
  );
}

/* ─── Re-export SidebarTrigger as MobileMenuButton for TopBar ───── */
export { SidebarTrigger as MobileMenuButton } from "@/components/ui/sidebar";
