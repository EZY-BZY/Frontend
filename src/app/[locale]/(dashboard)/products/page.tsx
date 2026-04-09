import { getTranslations } from "next-intl/server";
import { ProductsView } from "@/features/products/components/ProductsView";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <ProductsView />
    </PageTransition>
  );
}
