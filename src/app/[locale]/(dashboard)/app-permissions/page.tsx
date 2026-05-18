import { getTranslations } from "next-intl/server";
import { AppPermissionsView } from "@/features/app-permissions/components/AppPermissionsView";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function AppPermissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appPermissions" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <AppPermissionsView />
    </PageTransition>
  );
}
