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
  { id: "G-016", name_en: "Doha",                   name_ar: "الدوحة",                countryId: "C-004", createdAt: "2024-02-01" },
  { id: "G-017", name_en: "Al Rayyan",              name_ar: "الريان",                countryId: "C-004", createdAt: "2024-02-01" },
  // Jordan (C-007)
  { id: "G-018", name_en: "Amman",                  name_ar: "عمّان",                 countryId: "C-007", createdAt: "2024-03-01" },
  { id: "G-019", name_en: "Zarqa",                  name_ar: "الزرقاء",               countryId: "C-007", createdAt: "2024-03-01" },
  { id: "G-020", name_en: "Irbid",                  name_ar: "إربد",                  countryId: "C-007", createdAt: "2024-03-01" },
  { id: "G-021", name_en: "Aqaba",                  name_ar: "العقبة",                countryId: "C-007", createdAt: "2024-03-01" },
  // Egypt (C-008)
  { id: "G-022", name_en: "Cairo",                  name_ar: "القاهرة",               countryId: "C-008", createdAt: "2024-03-01" },
  { id: "G-023", name_en: "Alexandria",             name_ar: "الإسكندرية",            countryId: "C-008", createdAt: "2024-03-01" },
  { id: "G-024", name_en: "Giza",                   name_ar: "الجيزة",                countryId: "C-008", createdAt: "2024-03-01" },
  { id: "G-025", name_en: "Luxor",                  name_ar: "الأقصر",                countryId: "C-008", createdAt: "2024-03-01" },
  { id: "G-026", name_en: "Aswan",                  name_ar: "أسوان",                 countryId: "C-008", createdAt: "2024-03-01" },
  { id: "G-027", name_en: "Port Said",              name_ar: "بورسعيد",               countryId: "C-008", createdAt: "2024-03-01" },
  // Lebanon (C-009)
  { id: "G-028", name_en: "Beirut",                 name_ar: "بيروت",                 countryId: "C-009", createdAt: "2024-03-15" },
  { id: "G-029", name_en: "Tripoli",                name_ar: "طرابلس",                countryId: "C-009", createdAt: "2024-03-15" },
  { id: "G-030", name_en: "Sidon",                  name_ar: "صيدا",                  countryId: "C-009", createdAt: "2024-03-15" },
  { id: "G-031", name_en: "Zahle",                  name_ar: "زحلة",                  countryId: "C-009", createdAt: "2024-03-15" },
  // Morocco (C-010)
  { id: "G-032", name_en: "Casablanca",             name_ar: "الدار البيضاء",         countryId: "C-010", createdAt: "2024-03-15" },
  { id: "G-033", name_en: "Rabat",                  name_ar: "الرباط",                countryId: "C-010", createdAt: "2024-03-15" },
  { id: "G-034", name_en: "Marrakech",              name_ar: "مراكش",                 countryId: "C-010", createdAt: "2024-03-15" },
  { id: "G-035", name_en: "Fez",                    name_ar: "فاس",                   countryId: "C-010", createdAt: "2024-03-15" },
  { id: "G-036", name_en: "Agadir",                 name_ar: "أكادير",                countryId: "C-010", createdAt: "2024-03-15" },
  // France (C-011)
  { id: "G-037", name_en: "Île-de-France",          name_ar: "إيل-دو-فرانس",         countryId: "C-011", createdAt: "2024-04-01" },
  { id: "G-038", name_en: "Provence-Alpes",         name_ar: "بروفانس ألب",           countryId: "C-011", createdAt: "2024-04-01" },
  { id: "G-039", name_en: "Auvergne-Rhône-Alpes",  name_ar: "أوفيرن رون ألب",        countryId: "C-011", createdAt: "2024-04-01" },
  { id: "G-040", name_en: "Nouvelle-Aquitaine",     name_ar: "نوفيل أكيتان",          countryId: "C-011", createdAt: "2024-04-01" },
  // Italy (C-012)
  { id: "G-041", name_en: "Lombardia",              name_ar: "لومباردي",              countryId: "C-012", createdAt: "2024-04-01" },
  { id: "G-042", name_en: "Lazio",                  name_ar: "لاتسيو",                countryId: "C-012", createdAt: "2024-04-01" },
  { id: "G-043", name_en: "Sicilia",                name_ar: "صقلية",                 countryId: "C-012", createdAt: "2024-04-01" },
  { id: "G-044", name_en: "Veneto",                 name_ar: "فينيتو",                countryId: "C-012", createdAt: "2024-04-01" },
  // Senegal (C-013)
  { id: "G-045", name_en: "Dakar",                  name_ar: "داكار",                 countryId: "C-013", createdAt: "2024-04-15" },
  { id: "G-046", name_en: "Thiès",                  name_ar: "تييس",                  countryId: "C-013", createdAt: "2024-04-15" },
  { id: "G-047", name_en: "Saint-Louis",            name_ar: "سانت لويس",             countryId: "C-013", createdAt: "2024-04-15" },
  // Japan (C-014)
  { id: "G-048", name_en: "Tokyo",                  name_ar: "طوكيو",                 countryId: "C-014", createdAt: "2024-04-15" },
  { id: "G-049", name_en: "Osaka",                  name_ar: "أوساكا",                countryId: "C-014", createdAt: "2024-04-15" },
  { id: "G-050", name_en: "Kanagawa",               name_ar: "كاناغاوا",              countryId: "C-014", createdAt: "2024-04-15" },
  { id: "G-051", name_en: "Aichi",                  name_ar: "آيتشي",                 countryId: "C-014", createdAt: "2024-04-15" },
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
