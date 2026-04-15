import { PageTransition } from "@/components/shared/PageTransition";
import { LegalPageView } from "@/features/legal/components/legal-page-view";

export default function TermsConditionsPage() {
  return (
    <PageTransition>
      <LegalPageView docType="terms-conditions" />
    </PageTransition>
  );
}
