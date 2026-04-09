import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import "./globals.css";

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
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
