import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CompanyEmployeeBeasyRead,
  ListCompanyEmployeesParams,
} from "@/types/api";

export function listCompanyEmployees(
  params?: ListCompanyEmployeesParams
): Promise<ApiResponse<CompanyEmployeeBeasyRead[]>> {
  return apiClient.get("/api/v1/beasy/company-employees", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getCompanyEmployee(
  employeeId: string
): Promise<ApiResponse<CompanyEmployeeBeasyRead>> {
  return apiClient.get(`/api/v1/beasy/company-employees/${employeeId}`);
}
