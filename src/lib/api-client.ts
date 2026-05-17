import type { ApiResponse, RefreshTokenRequest, TokenResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TOKEN_KEY = "beasy_access_token";
const REFRESH_KEY = "beasy_refresh_token";
// Presence-only cookie read by the Edge middleware to gate dashboard routes.
// Not httpOnly so JS can set/clear it; real security is JWT-validated on the API.
const AUTH_COOKIE = "beasy_auth";

export const tokenStore = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  set: (access: string, refresh: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Lax`;
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  },
};

// Queues concurrent requests during an in-flight token refresh so only one
// refresh call is ever made at a time.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    tokenStore.clear();
    return null;
  }

  const body: RefreshTokenRequest = { refresh_token: refreshToken };
  const res = await fetch(`${API_BASE_URL}/api/v1/beasy/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    tokenStore.clear();
    return null;
  }

  let data: ApiResponse<TokenResponse>;
  try {
    data = await res.json();
  } catch {
    tokenStore.clear();
    return null;
  }

  if (!data.Data) {
    tokenStore.clear();
    return null;
  }

  tokenStore.set(data.Data.access_token, data.Data.refresh_token);
  return data.Data.access_token;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  // Accept any serialisable object — services pass typed payloads directly.
  body?: BodyInit | object | null;
  params?: Record<string, string | number | boolean | null | undefined>;
};

async function request<T>(
  path: string,
  { params, body, headers: extraHeaders, ...init }: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const buildUrl = (): string => {
    const base = API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const url = new URL(path, base);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined) {
          url.searchParams.set(k, String(v));
        }
      }
    }
    return url.toString();
  };

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    if (!(body instanceof FormData)) {
      h["Content-Type"] = "application/json";
    }
    return { ...h, ...(extraHeaders as Record<string, string> | undefined) };
  };

  const buildBody = (): BodyInit | null | undefined => {
    if (body === null || body === undefined) return undefined;
    if (body instanceof FormData) return body;
    if (typeof body === "object") return JSON.stringify(body as object);
    return body as BodyInit;
  };

  const execute = async (token: string | null): Promise<Response> =>
    fetch(buildUrl(), {
      ...init,
      headers: buildHeaders(token),
      body: buildBody(),
    });

  let token = tokenStore.getAccess();
  let res = await execute(token);

  if (res.status === 401) {
    // Coalesce concurrent refreshes into one promise.
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    token = await refreshPromise;

    if (!token) {
      // Redirect to login on the client side.
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return { status_code: 401, Message: "Unauthorized", Data: null };
    }

    res = await execute(token);
  }

  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      status_code: res.status,
      Message: "Invalid server response",
      Data: null,
    } as unknown as ApiResponse<T>;
  }
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "POST" }),

  patch: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "PATCH" }),

  put: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "PUT" }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
