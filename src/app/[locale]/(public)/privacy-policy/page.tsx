import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicTermsView } from "@/features/legal/components/PublicTermsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("publicTitle.privacy_policy") };
}

export default function PrivacyPolicyPublicPage() {
  return <PublicTermsView termType="privacy_policy" />;
}
