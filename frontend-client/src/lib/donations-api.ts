import { apiClient } from "./api-client";

export const donationsApi = {
  createOrder: (data: {
    campaignId: string;
    amount: number;
    tipAmount?: number;
    message?: string;
    isAnonymous?: boolean;
  }) => apiClient.post("/donations/create-order", data),
  getMyDonations: () => apiClient.get("/donations/my-donations"),
};
