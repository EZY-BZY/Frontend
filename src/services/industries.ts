import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  IndustryCreate,
  IndustryPublicRead,
  IndustryRead,
  IndustryUpdate,
  ListIndustriesParams,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function listIndustries(
  params?: ListIndustriesParams
): Promise<ApiResponse<PaginatedResponse<IndustryPublicRead>>> {
  return apiClient.get("/api/v1/public/industries", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function createIndustry(
  payload: IndustryCreate
): Promise<ApiResponse<IndustryRead>> {
  return apiClient.post("/api/v1/beasy/industries", { body: payload });
}

export function updateIndustry(
  industryId: string,
  payload: IndustryUpdate
): Promise<ApiResponse<IndustryRead>> {
  return apiClient.patch(`/api/v1/beasy/industries/${industryId}`, {
    body: payload,
  });
}

export function deleteIndustry(
  industryId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/industries/${industryId}`);
}
