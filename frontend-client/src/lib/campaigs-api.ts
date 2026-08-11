import { apiClient } from "./api-client";

export interface PublicCampaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  goalAmount: number;
  raisedAmount: number;
  expiryDate: string;
  cardImageUrl: string | null;
  category: { id: string; name: string };
  ngo: { id: string; name: string };
  story?: any;
  isAddress: boolean;
  donationPresets: { amount: number; isDefault: boolean }[];
  tipPresets: { percentage: number; isDefault: boolean }[];
}

export interface FeaturedCampaign extends PublicCampaign {
  featureImageDesktopUrl: string | null;
  featureImageMobileUrl: string | null;
}

export interface CampaignsQuery {
  categoryId?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
export interface PaginatedCampaigns {
  data: PublicCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const campaignsApi = {
  getAll: (query?: CampaignsQuery) =>
    apiClient.get<PaginatedCampaigns>("/campaigns/public", { params: query }),

  getBySlug: (slug: string) =>
    apiClient.get<PublicCampaign>(`/campaigns/public/${slug}`),

  // add to campaignsApi:
  getFeatured: () =>
    apiClient.get<FeaturedCampaign[]>("/campaigns/public/featured"),
};
