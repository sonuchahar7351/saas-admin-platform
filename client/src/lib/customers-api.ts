import { apiClient } from "./api-client";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalDonationAmount: number;
  totalTipAmount: number;
  totalTransactions: number;
  lastDonationAt: string | null;
}
export interface CustomerDonation {
  id: string;
  campaignTitle: string;
  donorName: string;
  amount: number;
  tipAmount: number;
  status: string;
  createdAt: string;
}
export interface CustomerHistoryResponse {
  customer: { id: string; name: string; email: string };
  donations: CustomerDonation[];
  total: number;
  totalPages: number;
  page: number;
}

export interface CustomersQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
}

export const customersApi = {
  getAll: (query: CustomersQuery) =>
    apiClient.get<{
      data: CustomerRecord[];
      total: number;
      totalPages: number;
    }>("/customers", { params: query }),
  getDonationHistory: (id: string, page = 1) =>
    apiClient.get<CustomerHistoryResponse>(`/customers/${id}/donations`, {
      params: { page },
    }),
};
