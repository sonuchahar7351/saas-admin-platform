import { apiClient } from "./api-client";

export interface Permission {
  id: string;
  resource: string;
  action: string;
}
export interface UserPermission {
  permission: Permission;
}

export const permissionsApi = {
  getAll: () => apiClient.get<Permission[]>("/permissions"),
  getUserPermissions: (userId: string) =>
    apiClient.get<UserPermission[]>(`/permissions/user/${userId}`),
  assign: (userId: string, permissionId: string) =>
    apiClient.post("/permissions/assign", { userId, permissionId }),
  revoke: (userId: string, permissionId: string) =>
    apiClient.delete(`/permissions/revoke/${userId}/${permissionId}`),
};
