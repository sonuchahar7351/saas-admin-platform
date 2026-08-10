import { apiClient } from "./api-client";

export const customerAuthApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post("/customer-auth/register", data),
  login: (email: string, password: string) =>
    apiClient.post("/customer-auth/login", { email, password }),
  logout: () => apiClient.post("/customer-auth/logout"),
  forgotPassword: (email: string) =>
    apiClient.post("/customer-auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post("/customer-auth/reset-password", { token, newPassword }),
};
