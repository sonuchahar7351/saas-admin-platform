import { apiClient } from "./api-client";

export interface CampaignDonor {
  donorName: string;
  amount: number;
  message: string | null;
  createdAt: string;
}
export interface PaginatedDonors {
  data: CampaignDonor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const donorsApi = {
  getByCampaign: (campaignId: string, page = 1, limit = 10, search?: string) =>
    apiClient.get<PaginatedDonors>(
      `/donations/public/campaign/${campaignId}/donors`,
      { params: { page, limit, search } },
    ),
};
