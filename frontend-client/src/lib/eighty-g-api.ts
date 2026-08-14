import { apiClient } from "./api-client";

export interface EightyGStatus {
  applied: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  certificateUrl?: string | null;
  rejectionReason?: string | null;
}

export const eightyGApi = {
  getStatus: (donationId: string) =>
    apiClient.get<EightyGStatus>(`/eighty-g/status/${donationId}`),
  apply: (data: {
    donationId: string;
    panNumber: string;
    fullName: string;
    email: string;
    address: string;
  }) => apiClient.post("/eighty-g/apply", data),
};
