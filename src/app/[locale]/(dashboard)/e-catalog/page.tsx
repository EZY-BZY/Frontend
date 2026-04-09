import { getTranslations } from "next-intl/server";
import { ECatalogView } from "@/features/ecatalog/components/ECatalogView";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function ECatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "eCatalog" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <ECatalogView />
    </PageTransition>
  );
}
