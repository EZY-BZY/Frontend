import { PageTransition } from "@/components/shared/PageTransition";
import { BundlesView } from "@/features/subscriptions/components/bundles-view";

export default function BundlesPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bundles</h1>
      <BundlesView />
    </PageTransition>
  );
}
