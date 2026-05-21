import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicTermsView } from "@/features/legal/components/PublicTermsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("publicTitle.delivery_terms") };
}

export default function DeliveryTermsPublicPage() {
  return <PublicTermsView termType="delivery_terms" />;
}
