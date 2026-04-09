import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ContactRequestsTable } from "@/features/contact-requests/components/ContactRequestsTable";
import { PageTransition } from "@/components/shared/PageTransition";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactRequests" });
  return { title: t("title") };
}

export default async function ContactRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactRequests" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <ContactRequestsTable />
    </PageTransition>
  );
}
