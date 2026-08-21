import { apiClient } from "./api-client";

export interface MorphCampaign {
  id: string;
  title: string;
  slug: string;
  status: string;
  cardImageUrl: string | null;
  parent: { id: string; title: string; slug: string };
  createdAt: string;
}

export interface SourceBreakdownItem {
  sourceCampaignId: string;
  sourceTitle: string;
  totalAmount: number;
  donationCount: number;
}

export const morphCampaignsApi = {
  getAll: (parentCampaignId?: string) =>
    apiClient.get<MorphCampaign[]>("/campaigns/morph", {
      params: { parentCampaignId },
    }),
  getById: (id: string) => apiClient.get<any>(`/campaigns/morph/${id}`),
  create: (data: { parentCampaignId: string; title: string }) =>
    apiClient.post("/campaigns/morph", data),
  getSourceBreakdown: (parentId: string) =>
    apiClient.get<SourceBreakdownItem[]>(
      `/campaigns/${parentId}/source-breakdown`,
    ),
};
