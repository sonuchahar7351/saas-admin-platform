import { apiClient } from "./api-client";

export interface ProductRecord {
  id: string;
  title: string;
  description: string;
  quantity: number;
  priority: number;
  amount: number;
  type: "SMALL" | "MEDIUM" | "MEGA";
  isActive: boolean;
  imageId: string | null;
}

export const productsApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<ProductRecord[]>("/products", { params: { campaignId } }),
  create: (data: any) => apiClient.post("/products", data),
  update: (id: string, data: any) => apiClient.patch(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  generateAi: (campaignTitle: string, categoryName: string) =>
    apiClient.post("/products/generate-ai", { campaignTitle, categoryName }),
};
