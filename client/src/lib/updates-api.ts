import { apiClient } from "./api-client";

export interface GlimpseImage {
  id: string;
  mediaId: string;
  url: string | null;
  order: number;
}
export interface GlimpseRecord {
  id: string;
  order: number;
  images: GlimpseImage[];
}
export interface UpdateRecord {
  id: string;
  title: string;
  content: any;
  glimpses: GlimpseRecord[];
  createdAt: string;
}

export const updatesApi = {
  getByCampaign: (campaignId: string) =>
    apiClient.get<UpdateRecord[]>("/updates", { params: { campaignId } }),
  create: (data: { campaignId: string; title: string; content: any }) =>
    apiClient.post<UpdateRecord>("/updates", data),
  update: (id: string, data: { title?: string; content?: any }) =>
    apiClient.patch(`/updates/${id}`, data),
  delete: (id: string) => apiClient.delete(`/updates/${id}`),
  generateAi: (campaignTitle: string, context: string) =>
    apiClient.post<{ content: any }>("/updates/generate-ai", {
      campaignTitle,
      context,
    }),
  createGlimpse: (updateId: string, mediaIds: string[]) =>
    apiClient.post<GlimpseRecord>("/updates/glimpses", { updateId, mediaIds }),
  deleteGlimpse: (id: string) => apiClient.delete(`/updates/glimpses/${id}`),
  addGlimpseImages: (glimpseId: string, mediaIds: string[]) =>
    apiClient.post<GlimpseRecord>(`/updates/glimpses/${glimpseId}/images`, {
      mediaIds,
    }),
  removeGlimpseImage: (id: string) =>
    apiClient.delete(`/updates/glimpse-images/${id}`),
};
