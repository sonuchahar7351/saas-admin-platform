import { apiClient } from "./api-client";

export interface UpdateGlimpseImage {
  id: string;
  url: string | null;
}
export interface UpdateGlimpse {
  id: string;
  images: UpdateGlimpseImage[];
}
export interface CampaignUpdate {
  id: string;
  title: string;
  content: any;
  createdAt: string;
  glimpses: UpdateGlimpse[];
}

export const campaignUpdatesApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<CampaignUpdate[]>("/updates/public", {
      params: { campaignId },
    }),
};
