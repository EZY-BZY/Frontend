import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const tNav = await getTranslations("nav");
  const tLanding = await getTranslations("landing");
  const isRTL = locale === "ar";

  const legalLinks = [
    { href: `/${locale}/privacy-policy`, label: tNav("privacyPolicy") },
    { href: `/${locale}/terms`, label: tNav("termsConditions") },
    { href: `/${locale}/refund-terms`, label: tNav("refundTerms") },
    { href: `/${locale}/delivery-terms`, label: tNav("deliveryTerms") },
  ];

  return (
    <div
      className="min-h-screen bg-[#F7F9FB] flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Top nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="shrink-0">
            <Image
              src="/logo.png"
              alt="B-EASY"
              width={72}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-slate-500 hover:text-[#0A3D62] transition-colors"
                style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href={`/${locale}/login`}
            className="text-xs font-semibold text-[#0A3D62] hover:text-[#0A3D62]/80 transition-colors shrink-0"
            style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
          >
            {tNav("dashboard")}
          </Link>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <Link href={`/${locale}`} className="shrink-0">
              <Image
                src="/logo.png"
                alt="B-EASY"
                width={72}
                height={28}
                className="h-6 w-auto object-contain opacity-60"
              />
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p
            className="mt-6 text-center text-[11px] text-slate-300"
            style={isRTL ? { fontFamily: "var(--font-cairo)" } : undefined}
          >
            © {new Date().getFullYear()} B-EASY. {tLanding("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
