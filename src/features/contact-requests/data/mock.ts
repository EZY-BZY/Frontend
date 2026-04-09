export type RequestStatus = "new" | "inProgress" | "resolved" | "closed";

export interface ContactRequest {
  id: string;
  clientName: string;
  email: string;
  companyName: string;
  status: RequestStatus;
  date: string;
  message: string;
}

export const mockContactRequests: ContactRequest[] = [
  {
    id: "REQ-001",
    clientName: "Alice Martin",
    email: "alice.martin@nexcorp.com",
    companyName: "NexCorp Industries",
    status: "new",
    date: "2026-04-01",
    message: "We are interested in a bulk order of your industrial products. Please send pricing details.",
  },
  {
    id: "REQ-002",
    clientName: "Mohamed Al-Rashid",
    email: "m.alrashid@globaltech.ae",
    companyName: "GlobalTech UAE",
    status: "inProgress",
    date: "2026-03-29",
    message: "Looking for a partnership opportunity in the MENA region.",
  },
  {
    id: "REQ-003",
    clientName: "Sophie Dupont",
    email: "s.dupont@frenchbizz.fr",
    companyName: "FrenchBizz SARL",
    status: "resolved",
    date: "2026-03-27",
    message: "Request for a product demonstration at our Paris office.",
  },
  {
    id: "REQ-004",
    clientName: "Carlos Mendes",
    email: "carlos@ibericagroup.es",
    companyName: "Iberica Group",
    status: "new",
    date: "2026-03-26",
    message: "Need a custom quote for 500 units of the B-Series equipment.",
  },
  {
    id: "REQ-005",
    clientName: "Yuki Tanaka",
    email: "y.tanaka@nipponlogistics.jp",
    companyName: "Nippon Logistics",
    status: "closed",
    date: "2026-03-22",
    message: "Inquiry about shipping solutions and after-sales support in Japan.",
  },
  {
    id: "REQ-006",
    clientName: "Anna Kowalski",
    email: "a.kowalski@polbuild.pl",
    companyName: "PolBuild Sp. z o.o.",
    status: "inProgress",
    date: "2026-03-20",
    message: "We need technical specifications for your latest catalog items.",
  },
  {
    id: "REQ-007",
    clientName: "James Okafor",
    email: "j.okafor@afrilinkng.com",
    companyName: "AfriLink Nigeria",
    status: "new",
    date: "2026-03-18",
    message: "Requesting distributorship terms for West African markets.",
  },
  {
    id: "REQ-008",
    clientName: "Lena Schneider",
    email: "lena.s@techdrive.de",
    companyName: "TechDrive GmbH",
    status: "resolved",
    date: "2026-03-15",
    message: "Follow-up on the previous order (Order #TDG-2026-089). All good.",
  },
  {
    id: "REQ-009",
    clientName: "Priya Sharma",
    email: "priya@quantumsols.in",
    companyName: "Quantum Solutions India",
    status: "new",
    date: "2026-04-02",
    message: "Interested in your SaaS dashboard licensing for our enterprise.",
  },
  {
    id: "REQ-010",
    clientName: "Omar Benali",
    email: "o.benali@maghrebtech.dz",
    companyName: "Maghreb Tech",
    status: "inProgress",
    date: "2026-04-03",
    message: "Looking for integration support for your API with our ERP system.",
  },
  {
    id: "REQ-011",
    clientName: "Fatima Zahra Idrissi",
    email: "fz.idrissi@atlasbiz.ma",
    companyName: "Atlas Business Group",
    status: "closed",
    date: "2026-03-10",
    message: "Inquiry was resolved via phone. No further action needed.",
  },
  {
    id: "REQ-012",
    clientName: "David Chen",
    email: "d.chen@sinobridge.cn",
    companyName: "SinoBridge Corp",
    status: "new",
    date: "2026-04-04",
    message: "We represent several manufacturers and want to explore co-branding opportunities.",
  },
];
