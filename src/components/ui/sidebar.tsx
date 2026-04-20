"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { PanelLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ─── Constants ─────────────────────────────────────────────────── */
const SIDEBAR_WIDTH = "220px";
const SIDEBAR_WIDTH_ICON = "68px";
const MOBILE_BREAKPOINT = 768;

/* ─── Mobile detection hook ─────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  return isMobile;
}

/* ─── Context ────────────────────────────────────────────────────── */
interface SidebarCtxValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (v: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (v: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarCtx = React.createContext<SidebarCtxValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

/* ─── Provider ───────────────────────────────────────────────────── */
export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen((v) => !v);
  }, [isMobile]);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarCtx.Provider
      value={{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}
    >
      <TooltipPrimitive.Provider delayDuration={200}>
        {children}
      </TooltipPrimitive.Provider>
    </SidebarCtx.Provider>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────── */
interface SidebarProps extends React.ComponentProps<"aside"> {
  side?: "left" | "right";
  collapsible?: "icon" | "none";
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ side = "left", collapsible = "icon", className, children, ...props }, ref) => {
    const { state, openMobile, setOpenMobile, isMobile } = useSidebar();

    /* Mobile: render as Sheet */
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className={cn(
              "w-[300px] p-0 flex flex-col gap-0",
              "transition-transform duration-300 ease-in-out",
              className
            )}
          >
            {children}
          </SheetContent>
        </Sheet>
      );
    }

    /* Desktop */
    return (
      <aside
        ref={ref as React.Ref<HTMLElement>}
        data-state={state}
        data-collapsible={collapsible}
        data-side={side}
        style={{
          width:
            state === "collapsed" && collapsible === "icon"
              ? SIDEBAR_WIDTH_ICON
              : SIDEBAR_WIDTH,
          minWidth:
            state === "collapsed" && collapsible === "icon"
              ? SIDEBAR_WIDTH_ICON
              : SIDEBAR_WIDTH,
          borderInlineEnd: "1px solid #f1f5f9",
          transition: "width 280ms ease, min-width 280ms ease",
        }}
        className={cn(
          "relative z-30 hidden md:flex flex-col h-screen shrink-0 bg-white overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

/* ─── SidebarTrigger ─────────────────────────────────────────────── */
export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  const locale = useLocale();
  const t = useTranslations("common");
  const isRTL = locale === "ar";
  return (
    <button
      type="button"
      onClick={(e) => {
        toggleSidebar();
        onClick?.(e);
      }}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors",
        className
      )}
      aria-label={t("toggleSidebar")}
      {...props}
    >
      <PanelLeft
        className={cn("h-5 w-5", isRTL && "-scale-x-100")}
        aria-hidden
      />
    </button>
  );
}

/* ─── SidebarInset ───────────────────────────────────────────────── */
export function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col min-w-0 overflow-hidden", className)}
      {...props}
    />
  );
}

/* ─── Layout slots ───────────────────────────────────────────────── */
export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col shrink-0", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col mt-auto shrink-0", className)} {...props} />
  );
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-2 h-px bg-slate-100 my-1", className)} {...props} />;
}

/* ─── Groups ─────────────────────────────────────────────────────── */
export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative flex flex-col w-full min-w-0", className)} {...props} />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { state } = useSidebar();
  if (state === "collapsed") return null;
  return (
    <div
      className={cn(
        "px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 select-none",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("w-full px-2", className)} {...props} />;
}

/* ─── Menu ───────────────────────────────────────────────────────── */
export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

/* ─── MenuButton ─────────────────────────────────────────────────── */
export interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  size?: "default" | "sm";
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      size = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state } = useSidebar();
    const Comp = asChild ? Slot : "button";

    const button = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Comp
        ref={ref as any}
        data-active={isActive}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-xl font-medium transition-all duration-150 group/btn select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B1]/40",
          size === "default" ? "px-3 py-2.5 text-sm" : "px-2 py-2 text-xs",
          isActive
            ? "bg-[#EBF3FB] text-[#0A3D62]"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip || state !== "collapsed") return button;

    return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            sideOffset={10}
            className="z-200 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            {tooltip}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

/* ─── Sub menu (hidden in icon-collapsed state) ──────────────────── */
export function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  const { state } = useSidebar();
  if (state === "collapsed") return null;
  return (
    <ul
      className={cn(
        "flex flex-col gap-0.5 ms-4 mt-0.5 border-s-2 border-slate-100 ps-2",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuSubItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
}

export interface SidebarMenuSubButtonProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
  isActive?: boolean;
}

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  SidebarMenuSubButtonProps
>(({ asChild = false, isActive = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Comp
      ref={ref as any}
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors select-none",
        isActive
          ? "text-[#0A3D62] bg-[#EBF3FB]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
