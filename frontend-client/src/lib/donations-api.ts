import { verify } from "crypto";
import { apiClient } from "./api-client";

export interface DonorDto {
  name: string;
  email: string;
  pincode?: string;
  city?: string;
  state?: string;
  streetAddress?: string;
}

export interface DonationSummary {
  id: string;
  status: string;
  donationType: "AMOUNT" | "PRODUCT";
  campaignTitle: string;
  campaignSlug: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  paymentId: string | null;
  createdAt: string;
  message: string | null;
  products: { title: string; quantity: number; amount: number }[];
  receiptUrl: string | null;
}

export interface DonationListItem {
  id: string;
  campaignTitle: string;
  campaignSlug: string;
  donorName: string;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  status: string;
  donationType: "AMOUNT" | "PRODUCT";
  createdAt: string;
}

export interface PaginatedDonations {
  data: DonationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const donationsSummaryApi = {
  get: (id: string) =>
    apiClient.get<DonationSummary>(`/donations/public/${id}/summary`),
};

export const donationsApi = {
  createOrder: (data: {
    campaignId: string;
    amount: number;
    tipAmount?: number;
    message?: string;
    isAnonymous?: boolean;
    donationType: "AMOUNT" | "PRODUCT";
    products?: any[];
    donor: DonorDto;
    guestPassword?: string;
  }) => apiClient.post("/donations/create-order", data),

  getMyDonations: () => apiClient.get("/donations/my-donations"),

  verifyDonation: ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    apiClient.post("/donations/verify", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
};

export const myDonationsApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<PaginatedDonations>("/donations/my-donations", {
      params: { page, limit },
    }),
  getById: (id: string) =>
    apiClient.get<DonationSummary>(`/donations/my-donations/${id}`),
};
