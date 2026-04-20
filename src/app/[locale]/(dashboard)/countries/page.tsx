import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/shared/PageTransition";
import { CountriesView } from "@/features/countries/components/countries-view";

export default async function CountriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "countries" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <CountriesView />
    </PageTransition>
  );
}
