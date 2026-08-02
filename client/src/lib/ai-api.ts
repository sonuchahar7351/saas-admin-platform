import { apiClient } from "./api-client";

export const aiApi = {
  getAuditSummary: () =>
    apiClient.get<{ summary: string }>("/ai/audit-summary"),
};
