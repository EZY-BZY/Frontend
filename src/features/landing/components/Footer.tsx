"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Image
              src="/logo.png"
              alt="B-EASY"
              width={80}
              height={30}
              className="h-7 w-auto object-contain"
            />
            <p className="text-xs text-white/40">{t("footer.tagline")}</p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/40">
            <a href="#features" className="hover:text-white transition-colors">
              {t("nav.features")}
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              {t("nav.pricing")}
            </a>
            <Link
              href={`/${locale}/login`}
              className="hover:text-white transition-colors"
            >
              {t("nav.login")}
            </Link>
          </nav>
        </div>

        {/* Bottom rule */}
        <div className="mt-8 border-t border-white/6 pt-6 text-center text-[11px] text-white/25">
          © {new Date().getFullYear()} B-EASY. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
