import { apiClient } from "./api-client";

export interface PublicJourneyStep {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl: string | null;
}

export const journeyApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<PublicJourneyStep[]>("/journey/public", {
      params: { campaignId },
    }),
};
