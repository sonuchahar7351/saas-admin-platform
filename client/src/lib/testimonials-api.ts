import { apiClient } from "./api-client";

export interface TestimonialRecord {
  id: string;
  name: string;
  designation: string | null;
  description: string;
  imageId: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export const testimonialsApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<TestimonialRecord[]>("/testimonials", {
      params: { campaignId },
    }),
  create: (data: any) => apiClient.post("/testimonials", data),
  update: (id: string, data: any) =>
    apiClient.patch(`/testimonials/${id}`, data),
  delete: (id: string) => apiClient.delete(`/testimonials/${id}`),
  generateAi: (campaignTitle: string, personaContext: string) =>
    apiClient.post("/testimonials/generate-ai", {
      campaignTitle,
      personaContext,
    }),
};
