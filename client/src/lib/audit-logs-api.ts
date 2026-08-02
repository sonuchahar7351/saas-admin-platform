import { apiClient } from "./api-client";

export interface AuditLogRecord {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  user: { name: string; email: string };
}

export const auditLogsApi = {
  getAll: (params: { resource?: string; page?: number; limit?: number }) =>
    apiClient.get<{ data: AuditLogRecord[]; total: number }>("/audit-logs", {
      params,
    }),
};
