import { apiClient } from "./api-client";

export interface MyRecurringQuery {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
export interface PaginatedRecurring {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const recurringDonationsApi = {
  setup: (data: any) => apiClient.post("/recurring-donations/setup", data),
  cancel: (id: string) => apiClient.patch(`/recurring-donations/${id}/cancel`),
  getMine: (query: MyRecurringQuery) =>
    apiClient.get<PaginatedRecurring>("/recurring-donations/my", {
      params: query,
    }),
};
