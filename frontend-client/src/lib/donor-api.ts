import { apiClient } from "./api-client";

export interface CampaignDonor {
  donorName: string;
  amount: number;
  message: string | null;
  createdAt: string;
}

export const donorsApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<CampaignDonor[]>(
      `/donations/public/campaign/${campaignId}/donors`,
    ),
};
