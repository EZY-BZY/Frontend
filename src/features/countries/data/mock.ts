import type { Country } from "@/types";

export const mockCountries: Country[] = [
  { id: "C-001", iso: "AE", name_en: "United Arab Emirates", name_ar: "الإمارات العربية المتحدة", currency: "AED", flag: "🇦🇪", createdAt: "2024-01-01" },
  { id: "C-002", iso: "SA", name_en: "Saudi Arabia",         name_ar: "المملكة العربية السعودية",  currency: "SAR", flag: "🇸🇦", createdAt: "2024-01-01" },
  { id: "C-003", iso: "KW", name_en: "Kuwait",               name_ar: "الكويت",                    currency: "KWD", flag: "🇰🇼", createdAt: "2024-01-01" },
  { id: "C-004", iso: "QA", name_en: "Qatar",                name_ar: "قطر",                       currency: "QAR", flag: "🇶🇦", createdAt: "2024-01-01" },
  { id: "C-005", iso: "BH", name_en: "Bahrain",              name_ar: "البحرين",                   currency: "BHD", flag: "🇧🇭", createdAt: "2024-01-01" },
  { id: "C-006", iso: "OM", name_en: "Oman",                 name_ar: "عُمان",                     currency: "OMR", flag: "🇴🇲", createdAt: "2024-01-01" },
  { id: "C-007", iso: "JO", name_en: "Jordan",               name_ar: "الأردن",                    currency: "JOD", flag: "🇯🇴", createdAt: "2024-01-15" },
  { id: "C-008", iso: "EG", name_en: "Egypt",                name_ar: "مصر",                       currency: "EGP", flag: "🇪🇬", createdAt: "2024-01-15" },
  { id: "C-009", iso: "LB", name_en: "Lebanon",              name_ar: "لبنان",                     currency: "LBP", flag: "🇱🇧", createdAt: "2024-02-01" },
  { id: "C-010", iso: "MA", name_en: "Morocco",              name_ar: "المغرب",                    currency: "MAD", flag: "🇲🇦", createdAt: "2024-02-01" },
];

export function getCountryById(id: string): Country | undefined {
  return mockCountries.find((c) => c.id === id);
}

export async function saveCountry(
  data: Omit<Country, "id" | "createdAt">,
  existingId?: string
): Promise<Country> {
  await new Promise((r) => setTimeout(r, 600));
  if (existingId) {
    const idx = mockCountries.findIndex((c) => c.id === existingId);
    if (idx !== -1) {
      mockCountries[idx] = { ...mockCountries[idx], ...data };
      return mockCountries[idx];
    }
  }
  const newCountry: Country = {
    id: `C-${String(Date.now()).slice(-3)}`,
    createdAt: new Date().toISOString().slice(0, 10),
    ...data,
  };
  mockCountries.push(newCountry);
  return newCountry;
}
