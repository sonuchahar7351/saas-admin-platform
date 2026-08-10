import { apiClient } from "./api-client";

export interface CampaignTestimonial {
  id: string;
  name: string;
  designation: string | null;
  description: string;
  imageUrl: string | null;
}

export const campaignTestimonialsApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<CampaignTestimonial[]>("/testimonials/public", {
      params: { campaignId },
    }),
};
