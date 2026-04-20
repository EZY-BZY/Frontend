import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/shared/PageTransition";
import { CompaniesView } from "@/features/companies/components/companies-view";

export default async function CompaniesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companies" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <CompaniesView />
    </PageTransition>
  );
}
