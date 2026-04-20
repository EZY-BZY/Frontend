import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/shared/PageTransition";
import { BundlesView } from "@/features/subscriptions/components/bundles-view";

export default async function BundlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bundles" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <BundlesView />
    </PageTransition>
  );
}
