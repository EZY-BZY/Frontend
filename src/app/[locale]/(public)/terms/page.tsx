import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicTermsView } from "@/features/legal/components/PublicTermsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("publicTitle.terms_of_use") };
}

export default function TermsOfUsePage() {
  return <PublicTermsView termType="terms_of_use" />;
}
