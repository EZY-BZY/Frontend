import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ContactRequestLandingCreate,
  ContactRequestRead,
  ListContactRequestsParams,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function createPublicContactRequest(
  data: ContactRequestLandingCreate
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.post("/api/v1/public/contact-requests", { body: data });
}

export function listContactRequests(
  params?: ListContactRequestsParams
): Promise<ApiResponse<PaginatedResponse<ContactRequestRead>>> {
  return apiClient.get("/api/v1/beasy/contact-requests", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getContactRequest(
  requestId: string
): Promise<ApiResponse<ContactRequestRead>> {
  return apiClient.get(`/api/v1/beasy/contact-requests/${requestId}`);
}

export function solveContactRequest(
  requestId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.post(`/api/v1/beasy/contact-requests/${requestId}/solve`);
}
