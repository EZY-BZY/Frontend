import { getTranslations } from "next-intl/server";
import { DashboardHome } from "@/features/dashboard/components/DashboardHome";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <DashboardHome />
    </PageTransition>
  );
}
