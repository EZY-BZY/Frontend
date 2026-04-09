"use client";

/**
 * LocaleSync
 *
 * WHY THIS EXISTS
 * ───────────────
 * Next.js App Router does soft (client-side) navigation between locale routes,
 * so the root <html> element — which is rendered once by the server — never
 * re-renders when the user switches between /en, /ar, /fr.
 *
 * This means `dir="rtl"` set at SSR for the Arabic locale persists incorrectly
 * when the user navigates to the English route, and vice-versa.
 *
 * This tiny component runs inside the NextIntlClientProvider and imperatively
 * syncs `document.documentElement.dir` and `.lang` whenever the locale changes,
 * giving us instant, animated RTL↔LTR switching without a hard refresh.
 */

import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";

export function LocaleSync() {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Track previous direction so we can trigger the flip animation class
  const prevDir = useRef<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const isFlipping = prevDir.current !== null && prevDir.current !== dir;

    if (isFlipping) {
      // Briefly add a "flipping" class so CSS can apply a soft fade during the
      // direction switch. We strip it after the transition completes.
      html.classList.add("dir-transitioning");
      const timeout = setTimeout(() => {
        html.classList.remove("dir-transitioning");
      }, 350);

      // We MUST update dir AFTER starting the fade so the browser can
      // transition logical-property values (margin-inline, padding-inline…).
      // A one-frame delay lets the class take effect first.
      const rafId = requestAnimationFrame(() => {
        html.setAttribute("dir", dir);
        html.setAttribute("lang", locale);
      });

      prevDir.current = dir;

      return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(rafId);
      };
    }

    // First mount or same direction — apply immediately with no animation
    html.setAttribute("dir", dir);
    html.setAttribute("lang", locale);
    prevDir.current = dir;
  }, [locale, dir]);

  return null;
}
