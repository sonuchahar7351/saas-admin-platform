import axios from "axios";
import { useCustomerAuthStore } from "../store/customer-auth-store";
import { silentRefresh } from "./auth-refresh";

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1`,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useCustomerAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest?.url?.includes("/customer-auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(apiClient(originalRequest)));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await silentRefresh();
        useCustomerAuthStore.getState().setAccessToken(data.accessToken);
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return apiClient(originalRequest);
      } catch {
        useCustomerAuthStore.getState().clearAuth();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
