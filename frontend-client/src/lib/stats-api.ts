import { apiClient } from "./api-client";

export const statsApi = {
  getPublic: () =>
    apiClient.get<{
      totalRaised: number;
      totalCampaigns: number;
      completedCampaigns: number;
      totalDonors: number;
    }>("/analytics/public/stats"),
};
