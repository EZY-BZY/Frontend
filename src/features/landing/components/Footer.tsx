"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  const navLinks = [
    { href: "#features", label: t("nav.features") },
    { href: "#contact", label: t("nav.pricing") },
    { href: `/${locale}/login`, label: t("nav.login"), isLink: true },
  ];

  const legalLinks = [
    { href: `/${locale}/privacy-policy`, label: tNav("privacyPolicy") },
    { href: `/${locale}/terms`, label: tNav("termsConditions") },
    { href: `/${locale}/refund-terms`, label: tNav("refundTerms") },
    { href: `/${locale}/delivery-terms`, label: tNav("deliveryTerms") },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand column */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Image
              src="/logo.png"
              alt="B-EASY"
              width={140}
              height={52}
              className="h-10 w-auto object-contain object-start"
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t("nav.features").split("")[0] && "Navigation"}
            </p>
            {navLinks.map((link) =>
              link.isLink ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-[#28B8B1] transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-[#28B8B1] transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Legal
            </p>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-[#28B8B1] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA column */}
          <div className="flex flex-col gap-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Get Started
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center rounded-full bg-[#28B8B1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#22A69F] transition-colors shadow-sm"
            >
              {t("nav.getStarted")}
            </Link>
            <p className="text-xs text-gray-400">No credit card required.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} B-EASY. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#28B8B1]" />
            <span className="text-xs text-gray-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
