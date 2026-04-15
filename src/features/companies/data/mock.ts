import type { Company } from "@/types";

export const mockCompanies: Company[] = [
  {
    id: "CO-001",
    name_en: "Al Fanar Group",
    name_ar: "مجموعة الفنار",
    logo: "⚡",
    operatingIn: ["C-001", "C-002", "C-004"],
    createdAt: "2024-01-05",
  },
  {
    id: "CO-002",
    name_en: "Schneider Electric Arabia",
    name_ar: "شنايدر إلكتريك العربية",
    logo: "🔌",
    operatingIn: ["C-001", "C-002", "C-004", "C-005"],
    createdAt: "2024-01-10",
  },
  {
    id: "CO-003",
    name_en: "Siemens Arabia",
    name_ar: "سيمنز العربية",
    logo: "🏭",
    operatingIn: ["C-001", "C-002"],
    createdAt: "2024-01-15",
  },
  {
    id: "CO-004",
    name_en: "ABB MENA",
    name_ar: "ABB الشرق الأوسط",
    logo: "🤖",
    operatingIn: ["C-001", "C-002", "C-003"],
    createdAt: "2024-02-01",
  },
  {
    id: "CO-005",
    name_en: "Honeywell Middle East",
    name_ar: "هانيويل الشرق الأوسط",
    logo: "🌡️",
    operatingIn: ["C-001", "C-002", "C-004", "C-006"],
    createdAt: "2024-02-10",
  },
  {
    id: "CO-006",
    name_en: "Emerson MENA",
    name_ar: "إيمرسون الشرق الأوسط",
    logo: "⚙️",
    operatingIn: ["C-001", "C-002", "C-008"],
    createdAt: "2024-03-01",
  },
];

export async function saveCompany(
  data: Omit<Company, "id" | "createdAt">,
  existingId?: string
): Promise<Company> {
  await new Promise((r) => setTimeout(r, 600));
  if (existingId) {
    const idx = mockCompanies.findIndex((c) => c.id === existingId);
    if (idx !== -1) {
      mockCompanies[idx] = { ...mockCompanies[idx], ...data };
      return mockCompanies[idx];
    }
  }
  const newCompany: Company = {
    id: `CO-${String(Date.now()).slice(-3)}`,
    createdAt: new Date().toISOString().slice(0, 10),
    ...data,
  };
  mockCompanies.push(newCompany);
  return newCompany;
}
