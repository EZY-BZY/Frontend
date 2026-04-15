import type { Country } from "@/types";

export const mockCountries: Country[] = [
  {
    id: "C-001", iso: "AE", name_en: "United Arab Emirates", name_ar: "الإمارات العربية المتحدة",
    currencyEn: "UAE Dirham", currencyAr: "درهم إماراتي", currencyFr: "Dirham des Émirats arabes unis",
    flag: "🇦🇪", phoneCode: "+971", regex: "^5[024568]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-002", iso: "SA", name_en: "Saudi Arabia", name_ar: "المملكة العربية السعودية",
    currencyEn: "Saudi Riyal", currencyAr: "ريال سعودي", currencyFr: "Riyal saoudien",
    flag: "🇸🇦", phoneCode: "+966", regex: "^5[013-9]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-003", iso: "KW", name_en: "Kuwait", name_ar: "الكويت",
    currencyEn: "Kuwaiti Dinar", currencyAr: "دينار كويتي", currencyFr: "Dinar koweïtien",
    flag: "🇰🇼", phoneCode: "+965", regex: "^[569]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-004", iso: "QA", name_en: "Qatar", name_ar: "قطر",
    currencyEn: "Qatari Riyal", currencyAr: "ريال قطري", currencyFr: "Riyal qatarien",
    flag: "🇶🇦", phoneCode: "+974", regex: "^[35-7]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-005", iso: "BH", name_en: "Bahrain", name_ar: "البحرين",
    currencyEn: "Bahraini Dinar", currencyAr: "دينار بحريني", currencyFr: "Dinar bahreïnien",
    flag: "🇧🇭", phoneCode: "+973", regex: "^[36]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-006", iso: "OM", name_en: "Oman", name_ar: "عُمان",
    currencyEn: "Omani Rial", currencyAr: "ريال عماني", currencyFr: "Rial omanais",
    flag: "🇴🇲", phoneCode: "+968", regex: "^[79]\\d{7}$", createdAt: "2024-01-01",
  },
  {
    id: "C-007", iso: "JO", name_en: "Jordan", name_ar: "الأردن",
    currencyEn: "Jordanian Dinar", currencyAr: "دينار أردني", currencyFr: "Dinar jordanien",
    flag: "🇯🇴", phoneCode: "+962", regex: "^7[789]\\d{7}$", createdAt: "2024-01-15",
  },
  {
    id: "C-008", iso: "EG", name_en: "Egypt", name_ar: "مصر",
    currencyEn: "Egyptian Pound", currencyAr: "جنيه مصري", currencyFr: "Livre égyptienne",
    flag: "🇪🇬", phoneCode: "+20", regex: "^1[0125]\\d{8}$", createdAt: "2024-01-15",
  },
  {
    id: "C-009", iso: "LB", name_en: "Lebanon", name_ar: "لبنان",
    currencyEn: "Lebanese Pound", currencyAr: "ليرة لبنانية", currencyFr: "Livre libanaise",
    flag: "🇱🇧", phoneCode: "+961", regex: "^[37]\\d{7}$", createdAt: "2024-02-01",
  },
  {
    id: "C-010", iso: "MA", name_en: "Morocco", name_ar: "المغرب",
    currencyEn: "Moroccan Dirham", currencyAr: "درهم مغربي", currencyFr: "Dirham marocain",
    flag: "🇲🇦", phoneCode: "+212", regex: "^[67]\\d{8}$", createdAt: "2024-02-01",
  },
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
