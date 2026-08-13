import { apiClient } from "./api-client";

export const eightyGAdminApi = {
  getAll: (page = 1, limit = 10, status?: string) =>
    apiClient.get("/eighty-g", { params: { page, limit, status } }),
  approve: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("certificate", file);
    return apiClient.post(`/eighty-g/${id}/approve`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  reject: (id: string, reason: string) =>
    apiClient.patch(`/eighty-g/${id}/reject`, { reason }),
};
