import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CompanyOwnerAdminRead,
  ListOwnersParams,
  OwnerStatusUpdateRequest,
} from "@/types/api";

export function listOwners(
  params?: ListOwnersParams
): Promise<ApiResponse<CompanyOwnerAdminRead[]>> {
  return apiClient.get("/api/v1/beasy/owners", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getOwner(
  ownerId: string
): Promise<ApiResponse<CompanyOwnerAdminRead>> {
  return apiClient.get(`/api/v1/beasy/owners/${ownerId}`);
}

export function searchOwners(
  query: string
): Promise<ApiResponse<CompanyOwnerAdminRead[]>> {
  return apiClient.get("/api/v1/beasy/owners/search", {
    params: { query },
  });
}

export function changeOwnerStatus(
  ownerId: string,
  payload: OwnerStatusUpdateRequest
): Promise<ApiResponse<CompanyOwnerAdminRead>> {
  return apiClient.patch(`/api/v1/beasy/owners/${ownerId}/status`, {
    body: payload,
  });
}
