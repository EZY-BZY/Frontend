import { PageTransition } from "@/components/shared/PageTransition";
import { SubscriptionsView } from "@/features/subscriptions/components/SubscriptionsView";

export default function SubscriptionsPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Subscription Ledger</h1>
      <SubscriptionsView />
    </PageTransition>
  );
}
