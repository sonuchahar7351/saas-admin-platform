import { apiClient } from "./api-client";

export const mediaApi = {
  upload: (file: File, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return apiClient.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getById: (id: string) =>
    apiClient.get<{ id: string; url: string }>(`/media/${id}`),
};
