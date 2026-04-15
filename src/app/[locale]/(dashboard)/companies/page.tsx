import { PageTransition } from "@/components/shared/PageTransition";
import { CompaniesView } from "@/features/companies/components/companies-view";

export default function CompaniesPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>
      <CompaniesView />
    </PageTransition>
  );
}
