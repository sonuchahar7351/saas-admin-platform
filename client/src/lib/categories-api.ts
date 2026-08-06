import { apiClient } from "./api-client";

export interface CategoryRecord {
  id: string;
  name: string;
}

export const categoriesApi = {
  getAll: () => apiClient.get<CategoryRecord[]>("/category"),
};
