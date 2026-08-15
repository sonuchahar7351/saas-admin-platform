import { apiClient } from "./api-client";
export const recurringDonationsApi = {
  setup: (data: any) => apiClient.post("/recurring-donations/setup", data),
  cancel: (id: string) => apiClient.patch(`/recurring-donations/${id}/cancel`),
  getMine: () => apiClient.get("/recurring-donations/my"),
};
