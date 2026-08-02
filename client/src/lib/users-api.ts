import { apiClient } from "./api-client";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: { id: string; name: string };
  createdAt: string;
}

export const usersApi = {
  getAll: () => apiClient.get<UserRecord[]>("/users"),
  create: (data: {
    email: string;
    password: string;
    name: string;
    roleId: string;
  }) => apiClient.post("/users", data),
};
