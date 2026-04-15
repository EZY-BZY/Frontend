import { PageTransition } from "@/components/shared/PageTransition";
import { GovernoratesView } from "@/features/governorates/components/governorates-view";

export default function GovernoratesPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Governorates</h1>
      <GovernoratesView />
    </PageTransition>
  );
}
