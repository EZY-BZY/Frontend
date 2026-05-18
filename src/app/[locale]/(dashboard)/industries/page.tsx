import { getTranslations } from "next-intl/server";
import { CategoriesView } from "@/features/categories/components/categories-view";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function IndustriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <CategoriesView />
    </PageTransition>
  );
}
