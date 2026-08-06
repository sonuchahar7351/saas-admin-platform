import { apiClient } from "./api-client";

export interface NgoRecord {
  id: string;
  name: string;
}

export const ngosApi = {
  getAll: () => apiClient.get<NgoRecord[]>("/ngo"),
};
