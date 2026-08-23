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

export interface MorphQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  parentCampaignId?: string;
}

export interface PaginatedMorphs {
  data: MorphCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const morphCampaignsApi = {
  getAll: (query: MorphQuery) =>
    apiClient.get<PaginatedMorphs>("/campaigns/morph", { params: query }),
  getParentCandidates: () =>
    apiClient.get<{ id: string; title: string }[]>(
      "/campaigns/morph-parent-candidates",
    ),

  getById: (id: string) => apiClient.get<any>(`/campaigns/morph/${id}`),
  create: (data: { parentCampaignId: string; title: string }) =>
    apiClient.post("/campaigns/morph", data),
  getSourceBreakdown: (parentId: string) =>
    apiClient.get<SourceBreakdownItem[]>(
      `/campaigns/${parentId}/source-breakdown`,
    ),
};
