import { apiClient } from "./api-client";

export interface RecurringRecord {
  id: string;
  frequency: string;
  amount: number;
  status: string;
  razorpaySubscriptionId: string;
  createdAt: string;
  campaign: { title: string; slug: string };
  billing: { donorName: string; donorEmail: string };
}
export interface RecurringQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  status?: string;
  frequency?: string;
  search?: string;
}

export const recurringAdminApi = {
  getAll: (params: RecurringQuery) =>
    apiClient.get<{
      data: RecurringRecord[];
      total: number;
      totalPages: number;
    }>("/recurring-donations", { params }),
  pause: (id: string) => apiClient.patch(`/recurring-donations/${id}/pause`),
  resume: (id: string) => apiClient.patch(`/recurring-donations/${id}/resume`),
  cancel: (id: string) =>
    apiClient.patch(`/recurring-donations/${id}/admin-cancel`),
  export: (params: any) =>
    apiClient.get("/recurring-donations/export", {
      params,
      responseType: "blob",
    }),
};
