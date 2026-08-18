import { apiClient } from "./api-client";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const supportChatApi = {
  sendMessage: (message: string, history: ChatTurn[], campaignSlug?: string) =>
    apiClient.post<{ reply: string }>("/ai/support-chat", {
      message,
      history,
      campaignSlug,
    }),
};
