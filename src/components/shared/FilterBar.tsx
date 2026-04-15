"use client";

import React from "react";
import { Search, Download, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ─── Primitive button used in the action slot ─────────────────── */
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  loading?: boolean;
}

export function FilterBarButton({
  variant = "primary",
  icon,
  loading,
  children,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const base =
    "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28B8B1]/50 disabled:opacity-60 disabled:pointer-events-none shadow-sm";

  const variants = {
    primary: "bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90",
    secondary: "bg-[#28B8B1] text-white hover:bg-[#28B8B1]/90",
    outline: "border border-slate-200 bg-white text-slate-600 hover:border-[#28B8B1] hover:text-[#0A3D62]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/* ─── Pre-built action buttons ─────────────────────────────────── */
export function AddButton(props: Omit<ActionButtonProps, "icon" | "variant">) {
  return <FilterBarButton variant="primary" icon={<Plus className="h-4 w-4" />} {...props} />;
}

export function DownloadButton(props: Omit<ActionButtonProps, "icon" | "variant">) {
  return (
    <FilterBarButton variant="secondary" icon={<Download className="h-4 w-4" />} {...props} />
  );
}

/* ─── FilterBar ─────────────────────────────────────────────────── */
interface FilterBarProps {
  /** Controlled search string */
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Optional extra filter controls rendered between search and action buttons */
  filters?: React.ReactNode;
  /** Action buttons (Add, Download, …) rendered at the end */
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center",
        className
      )}
    >
      {/* Search input */}
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 border-slate-200 ps-9 text-sm focus-visible:ring-[#28B8B1]"
        />
      </div>

      {/* Optional extra filters */}
      {filters && (
        <div className="flex flex-wrap items-center gap-2">{filters}</div>
      )}

      {/* Action buttons */}
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
