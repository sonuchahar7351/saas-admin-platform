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
  donationPresets: { amount: number; isDefault: boolean }[];
  tipPresets: { percentage: number; isDefault: boolean }[];
}

export const campaignsApi = {
  getAll: (categoryId?: string) =>
    apiClient.get<PublicCampaign[]>("/campaigns/public", {
      params: { categoryId },
    }),
  getBySlug: (slug: string) =>
    apiClient.get<PublicCampaign>(`/campaigns/public/${slug}`),
};
