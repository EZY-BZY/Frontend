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
          "w-full max-w-2xl flex items-center gap-3 rounded-full px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "bg-white/92 shadow-[0_8px_32px_rgb(0,0,0,0.08)] backdrop-blur-2xl ring-1 ring-black/4"
            : "bg-white/70 shadow-[0_4px_16px_rgb(0,0,0,0.04)] backdrop-blur-xl ring-1 ring-black/3"
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

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={`/${locale}/login`}
            className="px-3.5 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            {t("login")}
          </Link>
        </div>

        <div className="hidden md:block shrink-0">
          <LanguageSwitcher variant="landing" />
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/login`}
          className="hidden md:inline-flex shrink-0 items-center rounded-full bg-[#28B8B1] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(40,184,177,0.2)] hover:bg-[#22A69F] transition-colors"
        >
          {t("getStarted")}
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
            className="absolute top-full mt-2 w-full max-w-2xl rounded-2xl bg-white/98 backdrop-blur-2xl p-3 shadow-xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href={`/${locale}/login`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
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
              <LanguageSwitcher variant="landing" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
