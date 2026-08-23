"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { categoriesApi, CategoryRecord } from "@/lib/categories-api";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { showError, showSuccess } from "@/lib/toast";

function CategoriesContent() {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [editing, setEditing] = useState<Partial<CategoryRecord> | null>(null);
  const [error, setError] = useState("");

  const load = () => categoriesApi.getAll().then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  const openNew = () => setEditing({ name: "", imageId: null });

  const handleSave = async () => {
    if (!editing?.name) return;
    try {
      if (editing.id) {
        await categoriesApi.update(editing.id, {
          name: editing.name,
          imageId: editing.imageId || undefined,
          isActive: editing.isActive,
        });
        showSuccess("Category updated successfully");
      } else
        await categoriesApi.create({
          name: editing.name,
          imageId: editing.imageId || undefined,
        });
      showSuccess("Category created successfully");
      setEditing(null);
      load();
    } catch (err: any) {
      showError(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoriesApi.delete(id);
      showSuccess("Category deleted");
      load();
    } catch (err: any) {
      showError(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {items.length} categories
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> New category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-bg"
                >
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() =>
                        categoriesApi
                          .update(c.id, { isActive: !c.isActive })
                          .then(load)
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-bg text-text-secondary"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        className="rounded-md p-1.5 hover:bg-bg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                    colSpan={3}
                    className="px-5 py-10 text-center text-text-secondary"
                  >
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit category" : "New category"}
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
              <ImageUploadField
                label="Image"
                category="CATEGORY"
                mediaId={editing.imageId || null}
                initialUrl={editing.imageUrl}
                onChange={(id) => setEditing({ ...editing, imageId: id })}
                className="w-48 h-40"
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

export default function CategoriesPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <CategoriesContent />
    </ProtectedRoute>
  );
}
