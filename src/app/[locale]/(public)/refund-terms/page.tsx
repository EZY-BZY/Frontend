import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicTermsView } from "@/features/legal/components/PublicTermsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("publicTitle.refund_terms") };
}

export default function RefundTermsPublicPage() {
  return <PublicTermsView termType="refund_terms" />;
}
