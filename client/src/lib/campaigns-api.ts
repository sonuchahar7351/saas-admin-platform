import { apiClient } from "./api-client";

export interface CampaignRecord {
  id: string;
  title: string;
  slug: string;
  goalAmount: number;
  expiryDate: string;
  status: "CREATED" | "ACTIVE" | "COMPLETED" | "DELETED";
  cardImageId: string | null;
  category: { id: string; name: string };
  ngo: { id: string; name: string };
  createdAt: string;
}

export const campaignsApi = {
  getAll: (params?: { status?: string; categoryId?: string }) =>
    apiClient.get<CampaignRecord[]>("/campaigns", { params }),
  getById: (id: string) => apiClient.get<CampaignRecord>(`/campaigns/${id}`),
  changeStatus: (id: string, status: string) =>
    apiClient.patch(`/campaigns/${id}/status`, { status }),
  duplicate: (id: string) => apiClient.post(`/campaigns/${id}/duplicate`),
  delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
};
