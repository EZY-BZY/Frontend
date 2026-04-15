import { PageTransition } from "@/components/shared/PageTransition";
import { LegalPageView } from "@/features/legal/components/LegalPageView";

export default function LegalPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Legal</h1>
      <LegalPageView />
    </PageTransition>
  );
}
