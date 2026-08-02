"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { usersApi, UserRecord } from "../../../lib/users-api";
import { permissionsApi, Permission } from "../../../lib/permissions-api";
import { Avatar } from "../../../components/Avatar";
import { RoleBadge } from "../../../components/RoleBadge";
import { Toggle } from "../../../components/Toggle";

function PermissionsContent() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userPermissionIds, setUserPermissionIds] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);

  useEffect(() => {
    usersApi
      .getAll()
      .then(({ data }) =>
        setUsers(data.filter((u) => u.role.name !== "SUPER_ADMIN")),
      );
    permissionsApi.getAll().then(({ data }) => setPermissions(data));
  }, []);

  const selectUser = async (user: UserRecord) => {
    setSelectedUser(user);
    setIsLoadingPerms(true);
    const { data } = await permissionsApi.getUserPermissions(user.id);
    setUserPermissionIds(new Set(data.map((up) => up.permission.id)));
    setIsLoadingPerms(false);
  };

  const togglePermission = async (permissionId: string) => {
    if (!selectedUser) return;
    const hasIt = userPermissionIds.has(permissionId);
    const next = new Set(userPermissionIds);
    hasIt ? next.delete(permissionId) : next.add(permissionId);
    setUserPermissionIds(next);

    try {
      hasIt
        ? await permissionsApi.revoke(selectedUser.id, permissionId)
        : await permissionsApi.assign(selectedUser.id, permissionId);
    } catch {
      setUserPermissionIds(userPermissionIds); // revert on failure
    }
  };

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.resource] ||= []).push(p);
    return acc;
  }, {});
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Permissions
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Assign module access to Sub Admins and Admins individually.
        </p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-5">
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search size={14} className="text-text-secondary" />
            <input
              placeholder="Search people"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-[#9599A3]"
            />
          </div>
          <div className="max-h-130 overflow-y-auto p-1.5">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUser(u)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  selectedUser?.id === u.id ? "bg-accent/10" : "hover:bg-bg"
                }`}
              >
                <Avatar name={u.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <RoleBadge role={u.role.name} />
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="px-2.5 py-4 text-center text-sm text-text-secondary">
                No one found
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          {!selectedUser ? (
            <div className="flex h-full min-h-75 items-center justify-center text-center">
              <div>
                <p className="font-display text-sm font-medium">
                  Select a person
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Choose someone from the left to view and edit their module
                  access.
                </p>
              </div>
            </div>
          ) : isLoadingPerms ? (
            <p className="text-sm text-text-secondary">Loading permissions…</p>
          ) : (
            <div>
              <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                <Avatar name={selectedUser.name} />
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="font-mono text-xs text-text-secondary">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {Object.entries(grouped).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="mb-2 font-mono text-xs uppercase tracking-wide text-text-secondary">
                      {resource}
                    </p>
                    <div className="space-y-1">
                      {perms.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg"
                        >
                          <span className="text-sm capitalize">{p.action}</span>
                          <Toggle
                            checked={userPermissionIds.has(p.id)}
                            onChange={() => togglePermission(p.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <PermissionsContent />
    </ProtectedRoute>
  );
}
