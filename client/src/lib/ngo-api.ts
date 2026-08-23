import { apiClient } from "./api-client";

export interface NgoRecord {
  id: string;
  name: string;
  logoId: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

export const ngosApi = {
  getAll: () => apiClient.get<NgoRecord[]>("/ngo"),
  create: (data: Partial<NgoRecord>) => apiClient.post("/ngo", data),
  update: (id: string, data: Partial<NgoRecord>) =>
    apiClient.patch(`/ngo/${id}`, data),
  delete: (id: string) => apiClient.delete(`/ngo/${id}`),
};
