import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/shared/PageTransition";
import { SubscriptionsView } from "@/features/subscriptions/components/SubscriptionsView";

export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subscriptions" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <SubscriptionsView />
    </PageTransition>
  );
}
