import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CountryCreate,
  CountryRead,
  CountryUpdate,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function listCountries(params?: {
  page?: number;
  page_size?: number;
}): Promise<ApiResponse<PaginatedResponse<CountryRead>>> {
  return apiClient.get("/api/v1/public/countries", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function createCountry(
  payload: CountryCreate
): Promise<ApiResponse<CountryRead>> {
  return apiClient.post("/api/v1/beasy/countries", { body: payload });
}

export function updateCountry(
  countryId: string,
  payload: CountryUpdate
): Promise<ApiResponse<CountryRead>> {
  return apiClient.patch(`/api/v1/beasy/countries/${countryId}`, {
    body: payload,
  });
}

export function deleteCountry(
  countryId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/countries/${countryId}`);
}
