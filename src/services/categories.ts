import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CategoryCreate,
  CategoryPublicRead,
  CategoryUpdate,
  ListCategoriesParams,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

export function listCategories(
  params?: ListCategoriesParams
): Promise<ApiResponse<PaginatedResponse<CategoryPublicRead>>> {
  return apiClient.get("/api/v1/beasy/categories", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getCategory(
  categoryId: string
): Promise<ApiResponse<CategoryPublicRead>> {
  return apiClient.get(`/api/v1/beasy/categories/${categoryId}`);
}

export function createCategory(
  payload: CategoryCreate
): Promise<ApiResponse<CategoryPublicRead>> {
  const formData = new FormData();
  formData.append("name_en", payload.name_en);
  formData.append("name_ar", payload.name_ar);
  if (payload.name_fr) formData.append("name_fr", payload.name_fr);
  if (payload.description_en) formData.append("description_en", payload.description_en);
  if (payload.description_ar) formData.append("description_ar", payload.description_ar);
  if (payload.description_fr) formData.append("description_fr", payload.description_fr);
  if (payload.company_id) formData.append("company_id", payload.company_id);
  if (payload.image) formData.append("image", payload.image);
  return apiClient.post("/api/v1/beasy/categories", { body: formData });
}

export function updateCategory(
  categoryId: string,
  payload: CategoryUpdate
): Promise<ApiResponse<CategoryPublicRead>> {
  return apiClient.patch(`/api/v1/beasy/categories/${categoryId}`, {
    body: payload,
  });
}

export function deleteCategory(
  categoryId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/categories/${categoryId}`);
}
