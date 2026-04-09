"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockEmployees } from "../data/mock";
import type { EmployeeStatus } from "@/types";

const statusConfig: Record<EmployeeStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  active: { label: "Active", icon: <UserCheck className="h-3 w-3" />, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  inactive: { label: "Inactive", icon: <UserX className="h-3 w-3" />, cls: "bg-red-50 text-red-600 border-red-100" },
  onLeave: { label: "On Leave", icon: <Coffee className="h-3 w-3" />, cls: "bg-amber-50 text-amber-700 border-amber-100" },
};

export function EmployeesView() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");

  const departments = useMemo(
    () => ["all", ...Array.from(new Set(mockEmployees.map((e) => e.department)))],
    []
  );

  const filtered = useMemo(
    () =>
      mockEmployees.filter((e) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q);
        const matchesDept = dept === "all" || e.department === dept;
        return matchesSearch && matchesDept;
      }),
    [search, dept]
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 bg-white border-gray-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                dept === d
                  ? "bg-[#0A3D62] text-white border-[#0A3D62]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3D62] hover:text-[#0A3D62]"
              }`}
            >
              {d === "all" ? "All Departments" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Employee", "Role", "Department", "Phone", "Status", "Joined"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-start font-semibold text-gray-500 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-gray-400">No employees found</td>
                </tr>
              ) : (
                filtered.map((emp, i) => {
                  const s = statusConfig[emp.status];
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Employee col with avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold select-none"
                            style={{ backgroundColor: emp.avatarColor }}
                          >
                            {emp.avatarInitials}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{emp.role}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-[#EBF3FB] text-[#0A3D62] px-2.5 py-0.5 text-xs font-medium">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{emp.phone}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(emp.joinDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          <span>
            Showing <strong className="text-gray-600">{filtered.length}</strong> of{" "}
            <strong className="text-gray-600">{mockEmployees.length}</strong> employees
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active: {mockEmployees.filter((e) => e.status === "active").length}
            <span className="ms-2 h-2 w-2 rounded-full bg-amber-400" /> On leave: {mockEmployees.filter((e) => e.status === "onLeave").length}
            <span className="ms-2 h-2 w-2 rounded-full bg-red-400" /> Inactive: {mockEmployees.filter((e) => e.status === "inactive").length}
          </div>
        </div>
      </div>
    </div>
  );
}
