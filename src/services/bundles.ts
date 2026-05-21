import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BundleCreate,
  BundleRead,
  ListBundlesParams,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function listBundles(
  params?: ListBundlesParams
): Promise<ApiResponse<PaginatedResponse<BundleRead>>> {
  return apiClient.get("/api/v1/beasy/bundles", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getBundle(
  bundleId: string
): Promise<ApiResponse<BundleRead>> {
  return apiClient.get(`/api/v1/beasy/bundles/${bundleId}`);
}

export function createBundle(
  payload: BundleCreate
): Promise<ApiResponse<BundleRead>> {
  return apiClient.post("/api/v1/beasy/bundles", { body: payload });
}

export function moveBundleToHistory(
  bundleId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.post(`/api/v1/beasy/bundles/${bundleId}/move-to-history`);
}
