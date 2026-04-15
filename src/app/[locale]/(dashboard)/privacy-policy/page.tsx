import { PageTransition } from "@/components/shared/PageTransition";
import { LegalPageView } from "@/features/legal/components/legal-page-view";

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <LegalPageView docType="privacy-policy" />
    </PageTransition>
  );
}
