import type { Employee } from "@/types";

const COLORS = [
  "#0A3D62", "#28B8B1", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
];

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export const mockEmployees: Employee[] = [
  { id: "EMP-001", name: "Sarah Johnson", email: "s.johnson@b-easy.com", phone: "+1 555-0101", role: "Product Manager", department: "Product", status: "active", joinDate: "2023-01-15", avatarColor: COLORS[0], avatarInitials: initials("Sarah Johnson") },
  { id: "EMP-002", name: "Ahmed Al-Mansouri", email: "a.mansouri@b-easy.com", phone: "+971 50 123 4567", role: "Senior Engineer", department: "Engineering", status: "active", joinDate: "2022-06-01", avatarColor: COLORS[1], avatarInitials: initials("Ahmed Al-Mansouri") },
  { id: "EMP-003", name: "Claire Dubois", email: "c.dubois@b-easy.com", phone: "+33 6 12 34 56 78", role: "UX Designer", department: "Design", status: "active", joinDate: "2023-03-20", avatarColor: COLORS[2], avatarInitials: initials("Claire Dubois") },
  { id: "EMP-004", name: "James Okonkwo", email: "j.okonkwo@b-easy.com", phone: "+234 80 1234 5678", role: "Sales Lead", department: "Sales", status: "onLeave", joinDate: "2021-11-08", avatarColor: COLORS[3], avatarInitials: initials("James Okonkwo") },
  { id: "EMP-005", name: "Yuki Nakamura", email: "y.nakamura@b-easy.com", phone: "+81 90 1234 5678", role: "Data Analyst", department: "Analytics", status: "active", joinDate: "2023-07-12", avatarColor: COLORS[4], avatarInitials: initials("Yuki Nakamura") },
  { id: "EMP-006", name: "Fatima Zahra", email: "f.zahra@b-easy.com", phone: "+212 6 12 34 56 78", role: "HR Manager", department: "Human Resources", status: "active", joinDate: "2020-09-01", avatarColor: COLORS[5], avatarInitials: initials("Fatima Zahra") },
  { id: "EMP-007", name: "Marco Russo", email: "m.russo@b-easy.com", phone: "+39 333 123 4567", role: "Backend Engineer", department: "Engineering", status: "inactive", joinDate: "2022-02-14", avatarColor: COLORS[6], avatarInitials: initials("Marco Russo") },
  { id: "EMP-008", name: "Priya Patel", email: "p.patel@b-easy.com", phone: "+91 98765 43210", role: "Marketing Specialist", department: "Marketing", status: "active", joinDate: "2023-05-30", avatarColor: COLORS[7], avatarInitials: initials("Priya Patel") },
  { id: "EMP-009", name: "Carlos Vega", email: "c.vega@b-easy.com", phone: "+52 55 1234 5678", role: "DevOps Engineer", department: "Engineering", status: "active", joinDate: "2022-08-22", avatarColor: COLORS[0], avatarInitials: initials("Carlos Vega") },
  { id: "EMP-010", name: "Amira Hassan", email: "a.hassan@b-easy.com", phone: "+20 100 123 4567", role: "Finance Analyst", department: "Finance", status: "onLeave", joinDate: "2021-04-05", avatarColor: COLORS[1], avatarInitials: initials("Amira Hassan") },
  { id: "EMP-011", name: "Thomas Klein", email: "t.klein@b-easy.com", phone: "+49 151 1234 5678", role: "CTO", department: "Executive", status: "active", joinDate: "2019-03-01", avatarColor: COLORS[2], avatarInitials: initials("Thomas Klein") },
  { id: "EMP-012", name: "Nour El-Din", email: "n.eldin@b-easy.com", phone: "+965 9876 5432", role: "Frontend Engineer", department: "Engineering", status: "active", joinDate: "2023-09-01", avatarColor: COLORS[3], avatarInitials: initials("Nour El-Din") },
];
