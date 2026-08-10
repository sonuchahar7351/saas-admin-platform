import { apiClient } from "./api-client";

export interface HomepageTestimonial {
  id: string;
  name: string;
  designation: string | null;
  description: string;
  imageUrl: string | null;
  campaign: { title: string; slug: string };
}

export const testimonialsApi = {
  getForHomepage: (limit = 6) =>
    apiClient.get<HomepageTestimonial[]>("/testimonials/public/homepage", {
      params: { limit },
    }),
};
