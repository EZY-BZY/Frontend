import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  MediaBatchItemResponse,
  MediaUploadResponse,
} from "@/types/api";

export function uploadImage(file: File): Promise<ApiResponse<MediaUploadResponse>> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post("/api/v1/beasy/media/upload/image", { body: form });
}

export function uploadVideo(file: File): Promise<ApiResponse<MediaUploadResponse>> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post("/api/v1/beasy/media/upload/video", { body: form });
}

export function uploadFile(file: File): Promise<ApiResponse<MediaUploadResponse>> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post("/api/v1/beasy/media/upload/file", { body: form });
}

export function uploadAuto(file: File): Promise<ApiResponse<MediaUploadResponse>> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post("/api/v1/beasy/media/upload/auto", { body: form });
}

export function uploadBatch(
  files: File[]
): Promise<ApiResponse<MediaBatchItemResponse[]>> {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  return apiClient.post("/api/v1/beasy/media/upload/batch", { body: form });
}
