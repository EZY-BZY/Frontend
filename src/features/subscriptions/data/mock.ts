import type { Subscription } from "@/types";

export const mockSubscriptions: Subscription[] = [
  { id: "SUB-001", clientName: "NexCorp Industries",      plan: "Enterprise", amount: 9990,  currency: "AED", status: "active",    startDate: "2026-04-12", endDate: "2027-04-12" },
  { id: "SUB-002", clientName: "GlobalTech UAE",          plan: "Pro",        amount: 4990,  currency: "AED", status: "active",    startDate: "2026-04-10", endDate: "2027-04-10" },
  { id: "SUB-003", clientName: "FrenchBizz SARL",         plan: "Starter",    amount: 499,   currency: "EUR", status: "trial",     startDate: "2026-04-13", endDate: "2026-05-13" },
  { id: "SUB-004", clientName: "Iberica Group",           plan: "Pro",        amount: 1249,  currency: "EUR", status: "cancelled", startDate: "2026-01-01", endDate: "2026-07-01" },
  { id: "SUB-005", clientName: "Nippon Logistics",        plan: "Enterprise", amount: 2700,  currency: "USD", status: "expired",   startDate: "2025-04-01", endDate: "2026-04-01" },
  { id: "SUB-006", clientName: "PolBuild Sp. z o.o.",     plan: "Starter",    amount: 499,   currency: "EUR", status: "active",    startDate: "2026-03-01", endDate: "2027-03-01" },
  { id: "SUB-007", clientName: "AfriLink Nigeria",        plan: "Starter",    amount: 540,   currency: "USD", status: "trial",     startDate: "2026-04-18", endDate: "2026-05-18" },
  { id: "SUB-008", clientName: "TechDrive GmbH",          plan: "Enterprise", amount: 2499,  currency: "EUR", status: "active",    startDate: "2026-02-15", endDate: "2027-02-15" },
  { id: "SUB-009", clientName: "Quantum Solutions India", plan: "Pro",        amount: 1350,  currency: "USD", status: "active",    startDate: "2026-04-19", endDate: "2027-04-19" },
  { id: "SUB-010", clientName: "Maghreb Tech",            plan: "Starter",    amount: 540,   currency: "USD", status: "cancelled", startDate: "2026-03-10", endDate: "2026-09-10" },
];

/**
 * Returns true if the subscription started within the last 3 days
 * (i.e. the client is still within the cancellation window).
 */
export function canCancel(startDate: string): boolean {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return now - start <= threeDaysMs;
}
