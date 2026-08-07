import { apiClient } from "./api-client";

export const aiApi = {
  getAuditSummary: () =>
    apiClient.get<{ summary: string }>("/ai/audit-summary"),

  generateCampaignStory: (data: {
    title: string;
    categoryName: string;
    goalAmount: number;
    description: string;
  }) => apiClient.post<{ story: any }>("/ai/generate-campaign-story", data),
};
