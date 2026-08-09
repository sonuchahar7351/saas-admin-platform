import { apiClient } from "./api-client";

export interface JourneyRecord {
  id: string;
  title: string;
  description: string;
  order: number;
  imageId: string | null;
  imageUrl: string | null;
}

export const journeyApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<JourneyRecord[]>("/journey", { params: { campaignId } }),
  create: (data: any) => apiClient.post("/journey", data),
  update: (id: string, data: any) => apiClient.patch(`/journey/${id}`, data),
  delete: (id: string) => apiClient.delete(`/journey/${id}`),
  generateAi: (campaignTitle: string, stageContext: string) =>
    apiClient.post("/journey/generate-ai", { campaignTitle, stageContext }),
};
