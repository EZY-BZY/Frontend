import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BEasyEmployeeRead,
  BEasyMemberCreate,
  BEasyMemberUpdate,
  BEasySuperUserCreate,
  ListEmployeesParams,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function createSuperUser(
  payload: BEasySuperUserCreate
): Promise<ApiResponse<BEasyEmployeeRead>> {
  return apiClient.post("/api/v1/beasy/employees/super-user", {
    body: payload,
  });
}

export function createMember(
  payload: BEasyMemberCreate
): Promise<ApiResponse<BEasyEmployeeRead>> {
  return apiClient.post("/api/v1/beasy/employees", { body: payload });
}

export function listMembers(
  params?: ListEmployeesParams
): Promise<ApiResponse<PaginatedResponse<BEasyEmployeeRead>>> {
  return apiClient.get("/api/v1/beasy/employees", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getMember(
  employeeId: string
): Promise<ApiResponse<BEasyEmployeeRead>> {
  return apiClient.get(`/api/v1/beasy/employees/${employeeId}`);
}

export function updateMember(
  employeeId: string,
  payload: BEasyMemberUpdate
): Promise<ApiResponse<BEasyEmployeeRead>> {
  return apiClient.patch(`/api/v1/beasy/employees/${employeeId}`, {
    body: payload,
  });
}

export function deactivateMember(
  employeeId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/employees/${employeeId}`);
}
