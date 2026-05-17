import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AppPermissionCreate,
  AppPermissionHistoryRead,
  AppPermissionRead,
  AppPermissionUpdate,
  MessageResponse,
} from "@/types/api";

export function listAppPermissions(): Promise<ApiResponse<AppPermissionRead[]>> {
  return apiClient.get("/api/v1/beasy/app-permissions");
}

export function createAppPermission(
  payload: AppPermissionCreate
): Promise<ApiResponse<AppPermissionRead>> {
  return apiClient.post("/api/v1/beasy/app-permissions", { body: payload });
}

export function getAppPermission(
  permissionId: string
): Promise<ApiResponse<AppPermissionRead>> {
  return apiClient.get(`/api/v1/beasy/app-permissions/${permissionId}`);
}

export function listAppPermissionHistory(
  permissionId: string
): Promise<ApiResponse<AppPermissionHistoryRead[]>> {
  return apiClient.get(
    `/api/v1/beasy/app-permissions/${permissionId}/history`
  );
}

export function updateAppPermission(
  permissionId: string,
  payload: AppPermissionUpdate
): Promise<ApiResponse<AppPermissionRead>> {
  return apiClient.patch(`/api/v1/beasy/app-permissions/${permissionId}`, {
    body: payload,
  });
}

export function deleteAppPermission(
  permissionId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/app-permissions/${permissionId}`);
}
