import { apiClient } from "./api-client";

export interface CategoryRecord {
  id: string;
  name: string;
  imageId: string | null;
  isActive: boolean;
}

export const categoriesApi = {
  getAll: () => apiClient.get<CategoryRecord[]>("/category"),
  create: (data: { name: string; imageId?: string }) =>
    apiClient.post("/category", data),
  update: (
    id: string,
    data: Partial<{ name: string; imageId: string; isActive: boolean }>,
  ) => apiClient.patch(`/category/${id}`, data),
  delete: (id: string) => apiClient.delete(`/category/${id}`),
};
