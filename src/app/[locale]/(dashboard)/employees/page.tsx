import { getTranslations } from "next-intl/server";
import { EmployeesView } from "@/features/employees/components/EmployeesView";
import { PageTransition } from "@/components/shared/PageTransition";

export default async function EmployeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "employees" });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      <EmployeesView />
    </PageTransition>
  );
}
