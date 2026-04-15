import type { Governorate } from "@/types";

export const mockGovernorates: Governorate[] = [
  // UAE (C-001)
  { id: "G-001", name_en: "Abu Dhabi",       name_ar: "أبوظبي",          countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-002", name_en: "Dubai",            name_ar: "دبي",              countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-003", name_en: "Sharjah",          name_ar: "الشارقة",          countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-004", name_en: "Ajman",            name_ar: "عجمان",            countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-005", name_en: "Ras Al Khaimah",   name_ar: "رأس الخيمة",      countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-006", name_en: "Fujairah",         name_ar: "الفجيرة",          countryId: "C-001", createdAt: "2024-01-01" },
  { id: "G-007", name_en: "Umm Al Quwain",    name_ar: "أم القيوين",       countryId: "C-001", createdAt: "2024-01-01" },
  // Saudi Arabia (C-002)
  { id: "G-008", name_en: "Riyadh",           name_ar: "الرياض",           countryId: "C-002", createdAt: "2024-01-01" },
  { id: "G-009", name_en: "Makkah",           name_ar: "مكة المكرمة",      countryId: "C-002", createdAt: "2024-01-01" },
  { id: "G-010", name_en: "Madinah",          name_ar: "المدينة المنورة",  countryId: "C-002", createdAt: "2024-01-01" },
  { id: "G-011", name_en: "Eastern Province", name_ar: "المنطقة الشرقية",  countryId: "C-002", createdAt: "2024-01-01" },
  { id: "G-012", name_en: "Asir",             name_ar: "عسير",             countryId: "C-002", createdAt: "2024-01-01" },
  { id: "G-013", name_en: "Tabuk",            name_ar: "تبوك",             countryId: "C-002", createdAt: "2024-02-01" },
  // Kuwait (C-003)
  { id: "G-014", name_en: "Kuwait City",      name_ar: "مدينة الكويت",    countryId: "C-003", createdAt: "2024-02-01" },
  { id: "G-015", name_en: "Hawalli",          name_ar: "حولي",             countryId: "C-003", createdAt: "2024-02-01" },
  // Qatar (C-004)
  { id: "G-016", name_en: "Doha",             name_ar: "الدوحة",           countryId: "C-004", createdAt: "2024-02-01" },
  { id: "G-017", name_en: "Al Rayyan",        name_ar: "الريان",           countryId: "C-004", createdAt: "2024-02-01" },
];

export async function saveGovernorate(
  data: Omit<Governorate, "id" | "createdAt">,
  existingId?: string
): Promise<Governorate> {
  await new Promise((r) => setTimeout(r, 600));
  if (existingId) {
    const idx = mockGovernorates.findIndex((g) => g.id === existingId);
    if (idx !== -1) {
      mockGovernorates[idx] = { ...mockGovernorates[idx], ...data };
      return mockGovernorates[idx];
    }
  }
  const newGov: Governorate = {
    id: `G-${String(Date.now()).slice(-3)}`,
    createdAt: new Date().toISOString().slice(0, 10),
    ...data,
  };
  mockGovernorates.push(newGov);
  return newGov;
}
