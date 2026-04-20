import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "B-EASY",
  description: "B-EASY – Business Management Dashboard",
  icons: { icon: "/favicon.png" },
};

/**
 * Root layout owns the <html> element.
 *
 * Strategy:
 * - On the FIRST paint (SSR) we set `dir` and `lang` statically to the
 *   default locale so the page is correct without a flash.
 * - `suppressHydrationWarning` silences React's mismatch warning because
 *   LocaleSync (client component in the [locale] layout) will immediately
 *   update these attributes on mount to match the actual locale.
 *
 * This gives us:
 *   ✅ Correct SSR attributes for the initial page load (no layout shift)
 *   ✅ Instant client-side RTL↔LTR flip on locale change (no hard refresh)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultLocale = routing.defaultLocale;
  const defaultDir = defaultLocale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={defaultLocale}
      dir={defaultDir}
      /**
       * suppressHydrationWarning is required here.
       * LocaleSync mutates dir + lang on the client immediately after mount,
       * which would normally cause a hydration mismatch warning.
       */
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          inter.variable,
          cairo.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
