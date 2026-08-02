import { apiClient } from "./api-client";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  refresh: () => apiClient.post("/auth/refresh"),

  logout: () => apiClient.post("/auth/logout"),

  getMe: () => apiClient.get("/auth/me"),
};
