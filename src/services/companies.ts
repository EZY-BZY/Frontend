import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CompanyRead } from "@/types/api";

export function listCompanies(): Promise<ApiResponse<CompanyRead[]>> {
  return apiClient.get("/api/v1/beasy/companies");
}
