import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSync } from "@/components/shared/LocaleSync";

export const metadata: Metadata = {
  title: { default: "B-EASY", template: "%s | B-EASY" },
  description: "B-EASY – Business Management Dashboard",
};

type Locale = "en" | "ar" | "fr";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/*
        LocaleSync runs client-side on every locale change.
        It imperatively updates document.documentElement.dir + .lang
        so RTL↔LTR flips happen instantly during soft navigation,
        without waiting for a full server-side re-render.
      */}
      <LocaleSync />
      {children}
    </NextIntlClientProvider>
  );
}
