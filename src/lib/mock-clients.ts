import type { ClientSubscription, PersonalClient, WorkAccount } from "@/types";

/* ─── Brand palette for avatars ─────────────────────────────────── */
const COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

/* ─── Mock clients with embedded WorkAccounts + Subscriptions ─── */
export const mockClients: PersonalClient[] = [
  {
    id: "CLT-001",
    name: "Layla Al-Farsi",
    email: "layla.alfarsi@gmail.com",
    countryCode: "+971",
    phone: "50 234 5678",
    joinDate: "2024-02-10",
    avatarColor: COLORS[0],
    avatarInitials: initials("Layla Al-Farsi"),
    workAccounts: [
      {
        id: "WA-001",
        name: "Al-Farsi Logistics LLC",
        industry: "Logistics",
        status: "active",
        ownerId: "CLT-001",
        createdAt: "2024-02-15",
        employeesCount: 48,
        productsCount: 120,
      },
      {
        id: "WA-002",
        name: "Farsi Tech Solutions",
        industry: "Technology",
        status: "active",
        ownerId: "CLT-001",
        createdAt: "2024-06-01",
        employeesCount: 22,
        productsCount: 35,
      },
    ],
    subscriptions: [
      {
        id: "CS-001",
        workAccountId: "WA-001",
        workAccountName: "Al-Farsi Logistics LLC",
        bundleType: "Enterprise",
        startDate: "2025-05-01",
        endDate: "2026-05-01",
        originalPrice: 9990,
        discountedPrice: 7990,
        currency: "AED",
        status: "active",
      },
      {
        id: "CS-002",
        workAccountId: "WA-002",
        workAccountName: "Farsi Tech Solutions",
        bundleType: "Pro",
        startDate: "2025-09-01",
        endDate: "2026-09-01",
        originalPrice: 4990,
        discountedPrice: 4990,
        currency: "AED",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-002",
    name: "Marco Benedetti",
    email: "m.benedetti@benedetti.it",
    countryCode: "+39",
    phone: "335 678 9012",
    joinDate: "2023-09-05",
    avatarColor: COLORS[1],
    avatarInitials: initials("Marco Benedetti"),
    workAccounts: [
      {
        id: "WA-003",
        name: "Benedetti Costruzioni",
        industry: "Construction",
        status: "active",
        ownerId: "CLT-002",
        createdAt: "2023-09-10",
        employeesCount: 67,
        productsCount: 200,
      },
    ],
    subscriptions: [
      {
        id: "CS-003",
        workAccountId: "WA-003",
        workAccountName: "Benedetti Costruzioni",
        bundleType: "Starter",
        startDate: "2023-10-01",
        endDate: "2024-10-01",
        originalPrice: 499,
        discountedPrice: 399,
        currency: "EUR",
        status: "expired",
      },
      {
        id: "CS-004",
        workAccountId: "WA-003",
        workAccountName: "Benedetti Costruzioni",
        bundleType: "Pro",
        startDate: "2025-10-05",
        endDate: "2026-10-05",
        originalPrice: 1249,
        discountedPrice: 1099,
        currency: "EUR",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-003",
    name: "Amara Diallo",
    email: "amara.diallo@diallocorp.sn",
    countryCode: "+221",
    phone: "77 123 4567",
    joinDate: "2024-01-20",
    avatarColor: COLORS[2],
    avatarInitials: initials("Amara Diallo"),
    workAccounts: [
      {
        id: "WA-004",
        name: "Diallo Import & Export",
        industry: "Trade",
        status: "active",
        ownerId: "CLT-003",
        createdAt: "2024-01-22",
        employeesCount: 34,
        productsCount: 85,
      },
      {
        id: "WA-005",
        name: "Dakar Fresh Market",
        industry: "Retail",
        status: "inactive",
        ownerId: "CLT-003",
        createdAt: "2024-03-10",
        employeesCount: 12,
        productsCount: 300,
      },
      {
        id: "WA-006",
        name: "West Africa Freight",
        industry: "Logistics",
        status: "active",
        ownerId: "CLT-003",
        createdAt: "2024-05-01",
        employeesCount: 55,
        productsCount: 60,
      },
    ],
    subscriptions: [
      {
        id: "CS-005",
        workAccountId: "WA-004",
        workAccountName: "Diallo Import & Export",
        bundleType: "Enterprise",
        startDate: "2025-05-01",
        endDate: "2026-05-01",
        originalPrice: 2700,
        discountedPrice: 2700,
        currency: "USD",
        status: "active",
      },
      {
        id: "CS-006",
        workAccountId: "WA-005",
        workAccountName: "Dakar Fresh Market",
        bundleType: "Starter",
        startDate: "2024-03-15",
        endDate: "2024-09-15",
        originalPrice: 540,
        discountedPrice: 480,
        currency: "USD",
        status: "cancelled",
      },
      {
        id: "CS-007",
        workAccountId: "WA-006",
        workAccountName: "West Africa Freight",
        bundleType: "Pro",
        startDate: "2025-08-01",
        endDate: "2026-08-01",
        originalPrice: 1350,
        discountedPrice: 1199,
        currency: "USD",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-004",
    name: "Sophie Renard",
    email: "sophie.renard@renard-conseil.fr",
    countryCode: "+33",
    phone: "6 78 90 12 34",
    joinDate: "2023-11-14",
    avatarColor: COLORS[3],
    avatarInitials: initials("Sophie Renard"),
    workAccounts: [
      {
        id: "WA-007",
        name: "Renard Conseil SARL",
        industry: "Consulting",
        status: "active",
        ownerId: "CLT-004",
        createdAt: "2023-11-20",
        employeesCount: 18,
        productsCount: 45,
      },
    ],
    subscriptions: [
      {
        id: "CS-008",
        workAccountId: "WA-007",
        workAccountName: "Renard Conseil SARL",
        bundleType: "Pro",
        startDate: "2023-12-01",
        endDate: "2024-12-01",
        originalPrice: 1249,
        discountedPrice: 999,
        currency: "EUR",
        status: "expired",
      },
      {
        id: "CS-009",
        workAccountId: "WA-007",
        workAccountName: "Renard Conseil SARL",
        bundleType: "Enterprise",
        startDate: "2026-01-05",
        endDate: "2027-01-05",
        originalPrice: 2499,
        discountedPrice: 2199,
        currency: "EUR",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-005",
    name: "Hiroshi Tanaka",
    email: "h.tanaka@tanaka-global.jp",
    countryCode: "+81",
    phone: "90 5678 1234",
    joinDate: "2024-04-03",
    avatarColor: COLORS[4],
    avatarInitials: initials("Hiroshi Tanaka"),
    workAccounts: [
      {
        id: "WA-008",
        name: "Tanaka Global Trading",
        industry: "Trade",
        status: "active",
        ownerId: "CLT-005",
        createdAt: "2024-04-05",
        employeesCount: 89,
        productsCount: 410,
      },
      {
        id: "WA-009",
        name: "Nippon Tech Bridge",
        industry: "Technology",
        status: "active",
        ownerId: "CLT-005",
        createdAt: "2024-07-01",
        employeesCount: 31,
        productsCount: 75,
      },
    ],
    subscriptions: [
      {
        id: "CS-010",
        workAccountId: "WA-008",
        workAccountName: "Tanaka Global Trading",
        bundleType: "Starter",
        startDate: "2025-07-01",
        endDate: "2026-07-01",
        originalPrice: 540,
        discountedPrice: 540,
        currency: "USD",
        status: "active",
      },
      {
        id: "CS-011",
        workAccountId: "WA-009",
        workAccountName: "Nippon Tech Bridge",
        bundleType: "Pro",
        startDate: "2025-10-15",
        endDate: "2026-10-15",
        originalPrice: 1350,
        discountedPrice: 1249,
        currency: "USD",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-006",
    name: "Fatou Ndiaye",
    email: "fatou.ndiaye@ndiaye-group.sn",
    countryCode: "+221",
    phone: "78 456 7890",
    joinDate: "2023-07-22",
    avatarColor: COLORS[5],
    avatarInitials: initials("Fatou Ndiaye"),
    workAccounts: [
      {
        id: "WA-010",
        name: "Ndiaye Healthcare",
        industry: "Healthcare",
        status: "inactive",
        ownerId: "CLT-006",
        createdAt: "2023-08-01",
        employeesCount: 9,
        productsCount: 22,
      },
    ],
    subscriptions: [
      {
        id: "CS-012",
        workAccountId: "WA-010",
        workAccountName: "Ndiaye Healthcare",
        bundleType: "Starter",
        startDate: "2023-08-15",
        endDate: "2024-02-15",
        originalPrice: 540,
        discountedPrice: 450,
        currency: "USD",
        status: "cancelled",
      },
    ],
  },
  {
    id: "CLT-007",
    name: "Alexander Petrov",
    email: "a.petrov@petrovholding.ru",
    countryCode: "+7",
    phone: "916 234 5678",
    joinDate: "2024-03-11",
    avatarColor: COLORS[6],
    avatarInitials: initials("Alexander Petrov"),
    workAccounts: [
      {
        id: "WA-011",
        name: "Petrov Industrial Group",
        industry: "Manufacturing",
        status: "active",
        ownerId: "CLT-007",
        createdAt: "2024-03-15",
        employeesCount: 210,
        productsCount: 530,
      },
      {
        id: "WA-012",
        name: "Petrov Energy Solutions",
        industry: "Energy",
        status: "active",
        ownerId: "CLT-007",
        createdAt: "2024-03-15",
        employeesCount: 145,
        productsCount: 88,
      },
    ],
    subscriptions: [
      {
        id: "CS-013",
        workAccountId: "WA-011",
        workAccountName: "Petrov Industrial Group",
        bundleType: "Enterprise",
        startDate: "2025-06-01",
        endDate: "2026-06-01",
        originalPrice: 2700,
        discountedPrice: 1990,
        currency: "USD",
        status: "active",
      },
      {
        id: "CS-014",
        workAccountId: "WA-012",
        workAccountName: "Petrov Energy Solutions",
        bundleType: "Enterprise",
        startDate: "2025-06-01",
        endDate: "2026-06-01",
        originalPrice: 2700,
        discountedPrice: 2400,
        currency: "USD",
        status: "active",
      },
    ],
  },
  {
    id: "CLT-008",
    name: "Nadia Mansour",
    email: "nadia.mansour@mansour-group.ma",
    countryCode: "+212",
    phone: "6 61 23 45 67",
    joinDate: "2024-05-19",
    avatarColor: COLORS[7],
    avatarInitials: initials("Nadia Mansour"),
    workAccounts: [
      {
        id: "WA-013",
        name: "Mansour Retail Morocco",
        industry: "Retail",
        status: "active",
        ownerId: "CLT-008",
        createdAt: "2024-05-22",
        employeesCount: 27,
        productsCount: 640,
      },
    ],
    subscriptions: [
      {
        id: "CS-015",
        workAccountId: "WA-013",
        workAccountName: "Mansour Retail Morocco",
        bundleType: "Pro",
        startDate: "2025-09-01",
        endDate: "2026-09-01",
        originalPrice: 1350,
        discountedPrice: 1190,
        currency: "USD",
        status: "active",
      },
    ],
  },
];

/* ─── Derived flat lists ─────────────────────────────────────── */

/** All WorkAccounts across every client, enriched with owner name */
export const allWorkAccounts: (WorkAccount & { ownerName: string })[] =
  mockClients.flatMap((c) =>
    c.workAccounts.map((wa) => ({ ...wa, ownerName: c.name }))
  );

/** Look up a single client by id */
export function getClientById(id: string): PersonalClient | undefined {
  return mockClients.find((c) => c.id === id);
}

/** Look up a single WorkAccount by id, enriched with owner info */
export function getWorkAccountById(
  id: string
): (WorkAccount & { ownerName: string; ownerAvatarColor: string; ownerAvatarInitials: string }) | undefined {
  for (const client of mockClients) {
    const wa = client.workAccounts.find((w) => w.id === id);
    if (wa) {
      return {
        ...wa,
        ownerName: client.name,
        ownerAvatarColor: client.avatarColor,
        ownerAvatarInitials: client.avatarInitials,
      };
    }
  }
  return undefined;
}

/** Get all subscriptions for a given WorkAccount id */
export function getWorkAccountSubscriptions(workAccountId: string): ClientSubscription[] {
  for (const client of mockClients) {
    if (client.workAccounts.some((wa) => wa.id === workAccountId)) {
      return client.subscriptions.filter((s) => s.workAccountId === workAccountId);
    }
  }
  return [];
}
