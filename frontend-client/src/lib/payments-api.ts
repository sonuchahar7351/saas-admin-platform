import { apiClient } from "./api-client";

export const paymentsApi = {
  createOrder: (amount: number, planName: string) =>
    apiClient.post("/payments/create-order", { amount, planName }),
  getMyPayments: () => apiClient.get("/payments/my-payments"),
};
