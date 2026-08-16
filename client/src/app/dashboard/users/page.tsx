"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { usersApi, UserRecord } from "../../../lib/users-api";
import { rolesApi } from "../../../lib/roles-api";
import { useAuthStore } from "../../../store/auth-store";
import { RoleBadge } from "../../../components/RoleBadge";
import { Avatar } from "../../../components/Avatar";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    roleId: "",
  });
  const [error, setError] = useState("");
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await usersApi.getAll();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    if (isSuperAdmin) rolesApi.getAll().then(({ data }) => setRoles(data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await usersApi.create(form);
      setForm({ email: "", password: "", name: "", roleId: "" });
      setShowPanel(false);
      loadUsers();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Users
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isSuperAdmin
              ? `${users.length} people across your organization`
              : "People you've added to the platform"}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowPanel(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover cursor-pointer"
          >
            <Plus size={16} /> New user
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-text-secondary" />
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none placeholder:text-[#9599A3]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-sm font-medium">No users yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              {isSuperAdmin
                ? "Create the first user to get your team started."
                : "Users you create will show up here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#FAFAFB] text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-[#FAFAFB]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="font-mono text-xs text-text-secondary">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={u.role.name} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: u.isActive ? "#16A34A" : "#9CA3AF",
                          }}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over create panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
          <div className="h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold">New user</h2>
              <button
                onClick={() => setShowPanel(false)}
                className="text-text-secondary hover:text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 px-6 py-6">
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Role
                </label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Create user
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
