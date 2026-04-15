import { PageTransition } from "@/components/shared/PageTransition";
import { LegalPageView } from "@/features/legal/components/legal-page-view";

export default function DeliveryTermsPage() {
  return (
    <PageTransition>
      <LegalPageView docType="delivery-terms" />
    </PageTransition>
  );
}
