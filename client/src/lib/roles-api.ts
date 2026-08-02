import { apiClient } from "./api-client";

export const rolesApi = {
  getAll: () => apiClient.get<{ id: string; name: string }[]>("/roles"),
};
