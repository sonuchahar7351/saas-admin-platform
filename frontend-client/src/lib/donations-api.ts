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
