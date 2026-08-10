import { apiClient } from "./api-client";

export interface PublicProduct {
  id: string;
  title: string;
  description: string;
  amount: number;
  quantity: number;
  type: "SMALL" | "MEDIUM" | "MEGA";
  imageUrl: string | null;
}

export const productsApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<PublicProduct[]>("/products/public", {
      params: { campaignId },
    }),
};
