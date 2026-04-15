import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PageTransition } from "@/components/shared/PageTransition";
import { ClientDetailsView } from "@/features/clients/components/client-details-view";
import { getClientById } from "@/lib/mock-clients";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });
  const client = getClientById(id);
  return { title: client ? client.name : t("notFound") };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  return (
    <PageTransition>
      <ClientDetailsView clientId={id} />
    </PageTransition>
  );
}
