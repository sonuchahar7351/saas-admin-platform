import { apiClient } from "./api-client";

export interface CampaignRecord {
  id: string;
  title: string;
  slug: string;
  goalAmount: number;
  expiryDate: string;
  status: "CREATED" | "ACTIVE" | "COMPLETED" | "DELETED";
  cardImageId: string | null;
  cardImageUrl: string | null;
  category: { id: string; name: string };
  ngo: { id: string; name: string };
  createdAt: string;
  featureImageDesktopUrl?: string | null;
  featureImageMobileUrl?: string | null;
  featuredOrder?: number;
  isFeatured?: boolean;
  isAddress: boolean;
}

export interface CreateCampaignPayload {
  title: string;
  slug?: string;
  ngoId: string;
  categoryId: string;
  goalAmount: number;
  shortDescription: string;
  cardImageId?: string;
  story: any;
  expiryDate: string;
  isAddress: boolean;
  donationPresets: { amount: number; isDefault: boolean }[];
  tipPresets: { percentage: number; isDefault: boolean }[];
}

export interface CampaignDetail extends CampaignRecord {
  ngoId: string;
  categoryId: string;
  goalAmount: number;
  shortDescription: string;
  story: any;
  donationPresets: { amount: number; isDefault: boolean }[];
  tipPresets: { percentage: number; isDefault: boolean }[];
}

export const campaignsApi = {
  getAll: (params?: { status?: string; categoryId?: string }) =>
    apiClient.get<CampaignRecord[]>("/campaigns", { params }),
  changeStatus: (id: string, status: string) =>
    apiClient.patch(`/campaigns/${id}/status`, { status }),
  duplicate: (id: string) => apiClient.post(`/campaigns/${id}/duplicate`),
  delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
  create: (data: CreateCampaignPayload) => apiClient.post("/campaigns", data),
  // add to campaignsApi:
  getById: (id: string) => apiClient.get<CampaignDetail>(`/campaigns/${id}`),
  update: (id: string, data: Partial<CreateCampaignPayload>) =>
    apiClient.patch(`/campaigns/${id}`, data),
  setFeatured: (
    id: string,
    data: {
      isFeatured: boolean;
      featuredOrder?: number;
      featureImageDesktopId?: string;
      featureImageMobileId?: string;
    },
  ) => apiClient.patch(`/campaigns/${id}/feature`, data),
  getFeatured: () => apiClient.get("/campaigns/public/featured"),
};
