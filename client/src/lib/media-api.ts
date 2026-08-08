import { apiClient } from "./api-client";

export interface MediaRecord {
  id: string;
  url: string;
  key: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export const mediaApi = {
  upload: (file: File, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return apiClient.post<MediaRecord>("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  bulkUpload: (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("category", category);
    return apiClient.post<MediaRecord[]>("/media/bulk-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAll: (params?: { category?: string; search?: string }) =>
    apiClient.get<MediaRecord[]>("/media", { params }),

  getById: (id: string) => apiClient.get<MediaRecord>(`/media/${id}`),

  bulkDelete: (ids: string[]) => apiClient.post("/media/bulk-delete", { ids }),

  delete: (id: string) => apiClient.delete(`/media/${id}`),
};
