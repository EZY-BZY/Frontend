import type { Category } from "@/types";

export const mockCategories: Category[] = [
  { id: "CAT-001", name: "Industrial Equipment", slug: "industrial-equipment", description: "Heavy-duty industrial components and machinery.", productCount: 24, createdAt: "2024-01-01" },
  { id: "CAT-002", name: "Control Systems", slug: "control-systems", description: "PLCs, HMIs, and SCADA systems.", productCount: 18, createdAt: "2024-01-15" },
  { id: "CAT-003", name: "Measurement", slug: "measurement", description: "Sensors, gauges and monitoring equipment.", productCount: 41, createdAt: "2024-02-01" },
  { id: "CAT-004", name: "Hydraulics", slug: "hydraulics", description: "Hydraulic systems, pumps and cylinders.", productCount: 12, createdAt: "2024-02-10" },
  { id: "CAT-005", name: "Pneumatics", slug: "pneumatics", description: "Compressed air systems and actuators.", productCount: 29, createdAt: "2024-03-01" },
  { id: "CAT-006", name: "Electrical", slug: "electrical", description: "Drives, relays and electrical components.", productCount: 35, createdAt: "2024-03-15" },
  { id: "CAT-007", name: "Safety & Protection", slug: "safety-protection", description: "Machine guarding and safety devices.", productCount: 16, createdAt: "2024-04-01" },
  { id: "CAT-008", name: "Automation Software", slug: "automation-software", description: "SCADA, MES and process optimization software.", productCount: 9, createdAt: "2024-04-20" },
];
