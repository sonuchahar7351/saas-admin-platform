import { apiClient } from "./api-client";

export const customerAuthApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post("/customer-auth/register", data),
  login: (email: string, password: string) =>
    apiClient.post("/customer-auth/login", { email, password }),
  logout: () => apiClient.post("/customer-auth/logout"),
};
