"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { NgoRecord, ngosApi } from "@/lib/ngo-api";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function NgosContent() {
  const [items, setItems] = useState<NgoRecord[]>([]);
  const [editing, setEditing] = useState<Partial<NgoRecord> | null>(null);
  const [error, setError] = useState("");

  const load = () => ngosApi.getAll().then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  const openNew = () =>
    setEditing({
      name: "",
      logoId: null,
      description: "",
      website: "",
      email: "",
      phone: "",
      address: "",
    });

  const handleSave = async () => {
    if (!editing?.name) return;
    setError("");
    try {
      if (editing.id) await ngosApi.update(editing.id, editing);
      else await ngosApi.create(editing);
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this NGO?")) return;
    try {
      await ngosApi.delete(id);
      load();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Could not delete — it may still be in use by a campaign.",
      );
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            NGOs
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {items.length} organizations
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> New NGO
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-border last:border-0 hover:bg-bg"
                >
                  <td className="px-5 py-3 font-medium">{n.name}</td>
                  <td className="px-5 py-3 text-text-secondary">
                    {n.email || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() =>
                        ngosApi
                          .update(n.id, { isActive: !n.isActive })
                          .then(load)
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${n.isActive ? "bg-emerald-50 text-emerald-600" : "bg-bg text-text-secondary"}`}
                    >
                      {n.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(n)}
                        className="rounded-md p-1.5 hover:bg-bg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-text-secondary"
                  >
                    No NGOs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit NGO" : "New NGO"}
            </h2>
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="space-y-3">
              <input
                placeholder="Name"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <textarea
                placeholder="Description"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Website"
                value={editing.website || ""}
                onChange={(e) =>
                  setEditing({ ...editing, website: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Email"
                value={editing.email || ""}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Phone"
                value={editing.phone || ""}
                onChange={(e) =>
                  setEditing({ ...editing, phone: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Address"
                value={editing.address || ""}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <ImageUploadField
                label="Logo"
                category="CATEGORY"
                mediaId={editing.logoId || null}
                onChange={(id) => setEditing({ ...editing, logoId: id })}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setEditing(null);
                  setError("");
                }}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NgosPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <NgosContent />
    </ProtectedRoute>
  );
}
