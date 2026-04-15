import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PageTransition } from "@/components/shared/PageTransition";
import { ClientsListView } from "@/features/clients/components/clients-list-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });
  return { title: t("title") };
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("subtitle")}</p>
      </div>
      <ClientsListView />
    </PageTransition>
  );
}
