"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("landing.nav");
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const navLinks = [
    { label: t("features"), href: "#features" },
    { label: t("pricing"), href: "#contact" },
  ];

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "w-full max-w-2xl flex items-center gap-3 rounded-full border px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "border-white/15 bg-[#050E1A]/92 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            : "border-white/10 bg-[#0A1628]/60 backdrop-blur-xl"
        )}
      >
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0 me-auto">
          <Image
            src="/logo.png"
            alt="B-EASY"
            width={120}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop anchor links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-sm font-medium text-white/65 hover:text-white rounded-full hover:bg-white/8 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={`/${locale}/login`}
            className="px-3.5 py-1.5 text-sm font-medium text-white/65 hover:text-white rounded-full hover:bg-white/8 transition-colors"
          >
            {t("login")}
          </Link>
        </div>

        <div className="hidden md:block shrink-0">
          <LanguageSwitcher variant="topbar" />
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/login`}
          className="hidden md:inline-flex shrink-0 items-center rounded-full bg-[#28B8B1] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(40,184,177,0.25)] hover:bg-[#22A69F] transition-colors"
        >
          {t("getStarted")}
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A1628]/95 backdrop-blur-2xl p-3 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href={`/${locale}/login`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href={`/${locale}/login`}
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center rounded-full bg-[#28B8B1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22A69F] transition-colors"
            >
              {t("getStarted")}
            </Link>
            <div className="mt-2 flex justify-center">
              <LanguageSwitcher variant="topbar" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
