import { apiClient } from "./api-client";

export interface DonationRecord {
  id: string;
  amount: number;
  tipAmount: number;
  status: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string;
  message: string | null;
  isAnonymous: boolean;
  paymentMetadata: any;
  createdAt: string;
  campaign: { title: string; slug: string };
  customer: { id: string; name: string; email: string };
}

export interface DonationsQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const donationsAdminApi = {
  getAll: (params: DonationsQuery) =>
    apiClient.get<{
      data: DonationRecord[];
      total: number;
      totalPages: number;
    }>("/donations", { params }),
  getById: (id: string) => apiClient.get<DonationRecord>(`/donations/${id}`),
  refund: (id: string) => apiClient.post(`/donations/${id}/refund`),
};
