"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "top" | "right" | "bottom" | "left";
  srOnlyTitle?: string;
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, srOnlyTitle = "Dialog", ...props }, ref) => {
  const t = useTranslations("common");
  return (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-0 bg-white shadow-xl focus:outline-none will-change-transform",
        /* Physical left/right so RTL pages still open from the correct screen edge */
        side === "right" && [
          "inset-y-0 right-0 h-full w-full max-w-md border-l border-slate-100",
          "data-[state=open]:animate-[sheet-in-from-right_280ms_cubic-bezier(0.22,1,0.36,1)]",
          "data-[state=closed]:animate-[sheet-out-to-right_220ms_cubic-bezier(0.4,0,1,1)]",
        ],
        side === "left" && [
          "inset-y-0 left-0 h-full w-full max-w-md border-r border-slate-100",
          "data-[state=open]:animate-[sheet-in-from-left_280ms_cubic-bezier(0.22,1,0.36,1)]",
          "data-[state=closed]:animate-[sheet-out-to-left_220ms_cubic-bezier(0.4,0,1,1)]",
        ],
        side === "top" && [
          "inset-x-0 top-0 h-auto border-b border-slate-100",
          "data-[state=open]:animate-[sheet-in-from-top_280ms_cubic-bezier(0.22,1,0.36,1)]",
          "data-[state=closed]:animate-[sheet-out-to-top_220ms_cubic-bezier(0.4,0,1,1)]",
        ],
        side === "bottom" && [
          "inset-x-0 bottom-0 h-auto border-t border-slate-100",
          "data-[state=open]:animate-[sheet-in-from-bottom_280ms_cubic-bezier(0.22,1,0.36,1)]",
          "data-[state=closed]:animate-[sheet-out-to-bottom_220ms_cubic-bezier(0.4,0,1,1)]",
        ],
        className
      )}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">
        {srOnlyTitle}
      </DialogPrimitive.Title>
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#28B8B1] focus:ring-offset-2",
          side === "right" ? "left-4" : "right-4"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">{t("close")}</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b border-slate-100 px-6 py-5", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base font-semibold text-slate-900", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
