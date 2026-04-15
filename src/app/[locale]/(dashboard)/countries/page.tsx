import { PageTransition } from "@/components/shared/PageTransition";
import { CountriesView } from "@/features/countries/components/countries-view";

export default function CountriesPage() {
  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Countries</h1>
      <CountriesView />
    </PageTransition>
  );
}
