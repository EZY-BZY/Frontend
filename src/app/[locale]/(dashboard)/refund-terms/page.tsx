import { PageTransition } from "@/components/shared/PageTransition";
import { LegalPageView } from "@/features/legal/components/legal-page-view";

export default function RefundTermsPage() {
  return (
    <PageTransition>
      <LegalPageView docType="refund-terms" />
    </PageTransition>
  );
}
