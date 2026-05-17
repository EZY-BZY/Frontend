import { tokenStore } from "@/lib/api-client";
import type { ApiResponse, DashboardLoginRequest, TokenResponse } from "@/types/api";

export interface LoginResult {
  data: ApiResponse<TokenResponse>;
  httpStatus: number;
}

// Use raw fetch so the apiClient's 401-refresh interceptor does not fire on
// wrong credentials — a 401 here means "bad password", not "token expired".
export async function dashboardLogin(
  payload: DashboardLoginRequest
): Promise<LoginResult> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/beasy/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: ApiResponse<TokenResponse>;
  try {
    data = (await res.json()) as ApiResponse<TokenResponse>;
  } catch {
    return {
      data: { Message: "Invalid server response", Data: null } as unknown as ApiResponse<TokenResponse>,
      httpStatus: res.status,
    };
  }

  if (res.ok && data.Data) {
    tokenStore.set(data.Data.access_token, data.Data.refresh_token);
  }

  return { data, httpStatus: res.status };
}

export function logout(): void {
  tokenStore.clear();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
