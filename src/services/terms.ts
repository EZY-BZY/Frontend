import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ListTermHistoryParams,
  MessageResponse,
  PaginatedResponse,
  TermCreate,
  TermHistoryDayGroupRead,
  TermRead,
  TermType,
  TermUpdate,
} from "@/types/api";

export function createTerm(
  payload: TermCreate
): Promise<ApiResponse<TermRead>> {
  return apiClient.post("/api/v1/beasy/terms", { body: payload });
}

export function listTermsByType(
  termType: TermType
): Promise<ApiResponse<TermRead[]>> {
  return apiClient.get(`/api/v1/beasy/terms/${termType}`);
}

export function listTermHistory(
  termType: TermType,
  params?: ListTermHistoryParams
): Promise<ApiResponse<PaginatedResponse<TermHistoryDayGroupRead>>> {
  return apiClient.get(`/api/v1/beasy/terms/${termType}/history`, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function updateTerm(
  termId: string,
  payload: TermUpdate
): Promise<ApiResponse<TermRead>> {
  return apiClient.patch(`/api/v1/beasy/terms/${termId}`, { body: payload });
}

export function deleteTerm(
  termId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/terms/${termId}`);
}
