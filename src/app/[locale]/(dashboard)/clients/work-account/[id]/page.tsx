import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PageTransition } from "@/components/shared/PageTransition";
import { WorkAccountDetailView } from "@/features/clients/components/work-account-detail-view";
import { getWorkAccountById } from "@/lib/mock-clients";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });
  const wa = getWorkAccountById(id);
  return { title: wa ? wa.name : t("notFound") };
}

export default async function WorkAccountDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  return (
    <PageTransition>
      <WorkAccountDetailView workAccountId={id} />
    </PageTransition>
  );
}
