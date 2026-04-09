import type { Product } from "@/types";

export const mockProducts: Product[] = [
  { id: "PRD-001", name: "Industrial Valve B-100", sku: "IVB-100-001", category: "Industrial Equipment", price: 349.99, stock: 85, status: "active", description: "High-pressure industrial valve for pipeline systems.", createdAt: "2025-01-10" },
  { id: "PRD-002", name: "Control Panel CP-X200", sku: "CPX-200-002", category: "Control Systems", price: 1299.00, stock: 32, status: "active", description: "Advanced PLC-compatible control panel.", createdAt: "2025-01-15" },
  { id: "PRD-003", name: "Pressure Gauge PG-50", sku: "PG-50-003", category: "Measurement", price: 89.99, stock: 210, status: "active", description: "Stainless steel pressure gauge, 0–50 bar range.", createdAt: "2025-02-01" },
  { id: "PRD-004", name: "Hydraulic Pump HP-3000", sku: "HP-3000-004", category: "Hydraulics", price: 2450.00, stock: 18, status: "active", description: "Industrial hydraulic pump with 3000 PSI output.", createdAt: "2025-02-10" },
  { id: "PRD-005", name: "Safety Relay SR-24V", sku: "SR-24V-005", category: "Electrical", price: 149.50, stock: 0, status: "archived", description: "24V DC safety relay for machine guarding.", createdAt: "2024-11-20" },
  { id: "PRD-006", name: "Flow Meter FM-Digital", sku: "FM-DIG-006", category: "Measurement", price: 599.00, stock: 45, status: "active", description: "Digital flow meter with RS485 output.", createdAt: "2025-03-01" },
  { id: "PRD-007", name: "Pneumatic Cylinder PC-80", sku: "PC-80-007", category: "Pneumatics", price: 189.75, stock: 120, status: "active", description: "Double-acting pneumatic cylinder, 80mm bore.", createdAt: "2025-03-12" },
  { id: "PRD-008", name: "Temperature Sensor TS-PT100", sku: "TS-PT100-008", category: "Measurement", price: 59.99, stock: 300, status: "active", description: "PT100 resistance temperature detector.", createdAt: "2025-03-20" },
  { id: "PRD-009", name: "Motor Drive MD-VFD", sku: "MD-VFD-009", category: "Electrical", price: 899.00, stock: 22, status: "draft", description: "Variable frequency drive for 3-phase motors.", createdAt: "2025-04-01" },
  { id: "PRD-010", name: "Level Sensor LS-Ultrasonic", sku: "LS-ULT-010", category: "Measurement", price: 279.00, stock: 67, status: "active", description: "Non-contact ultrasonic level measurement.", createdAt: "2025-04-02" },
  { id: "PRD-011", name: "Solenoid Valve SV-NC", sku: "SV-NC-011", category: "Industrial Equipment", price: 74.99, stock: 450, status: "active", description: "Normally-closed solenoid valve, G1/2 thread.", createdAt: "2025-04-03" },
  { id: "PRD-012", name: "SCADA Gateway SGW-Ethernet", sku: "SGW-ETH-012", category: "Control Systems", price: 1750.00, stock: 8, status: "draft", description: "Ethernet SCADA gateway with Modbus TCP support.", createdAt: "2025-04-04" },
];
