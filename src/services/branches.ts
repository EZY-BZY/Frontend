import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CompanyBranchBeasyRead,
  ListBranchesParams,
} from "@/types/api";

export function listCompanyBranches(
  params?: ListBranchesParams
): Promise<ApiResponse<CompanyBranchBeasyRead[]>> {
  return apiClient.get("/api/v1/beasy/company-branches", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getCompanyBranch(
  branchId: string
): Promise<ApiResponse<CompanyBranchBeasyRead>> {
  return apiClient.get(`/api/v1/beasy/company-branches/${branchId}`);
}
