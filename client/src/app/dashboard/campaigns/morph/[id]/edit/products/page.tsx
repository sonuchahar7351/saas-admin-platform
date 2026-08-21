"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { ProductRecord, productsApi } from "@/lib/products-api";
import { campaignsApi } from "@/lib/campaigns-api";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const TYPES = ["SMALL", "MEDIUM", "MEGA"];

function ProductsContent() {
  const { id: campaignId } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editing, setEditing] = useState<Partial<ProductRecord> | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const { data } = await productsApi.getByCampaign(campaignId as string);
    setProducts(data);
  };

  useEffect(() => {
    campaignsApi
      .getById(campaignId as string)
      .then(({ data }) => setCampaign(data));
    load();
  }, [campaignId]);

  const openNew = () =>
    setEditing({
      title: "",
      description: "",
      quantity: 1,
      priority: 0,
      amount: 0,
      type: "SMALL",
      imageId: null,
    });

  const handleGenerateAi = async () => {
    if (!campaign) return;
    setGenerating(true);
    try {
      const { data } = await productsApi.generateAi(
        campaign.title,
        campaign.category?.name || "",
      );
      setEditing({
        title: (data as any).title,
        description: (data as any).description,
        amount: (data as any).amount,
        priority: (data as any).priority,
        quantity: 1,
        type: "SMALL",
        imageId: null,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) {
      await productsApi.update(editing.id, editing);
    } else {
      await productsApi.create({ ...editing, campaignId });
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{campaign?.title}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAi}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            <Sparkles size={15} />{" "}
            {generating ? "Generating…" : "Generate with AI"}
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-bg"
              >
                <td className="px-5 py-3 font-medium">{p.title}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.type}</td>
                <td className="px-5 py-3">
                  ₹{(p.amount / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3">{p.quantity}</td>
                <td className="px-5 py-3">{p.priority}</td>
                <td className="px-5 py-3">{p.isActive ? "Yes" : "No"}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() =>
                        setEditing({ ...p, amount: p.amount / 100 })
                      }
                      className="rounded-md p-1.5 hover:bg-bg"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit product" : "New product"}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <textarea
                placeholder="Description"
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-sm text-text-muted">Amount</span>
                  <input
                    type="number"
                    placeholder="Amount ₹"
                    value={editing.amount}
                    onChange={(e) =>
                      setEditing({ ...editing, amount: Number(e.target.value) })
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-sm text-text-muted">Qty</span>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={editing.quantity}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                  <span className="text-sm text-text-muted">Priority</span>
                  <input
                    type="number"
                    placeholder="Priority"
                    value={editing.priority}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        priority: Number(e.target.value),
                      })
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
              <select
                value={editing.type}
                onChange={(e) =>
                  setEditing({ ...editing, type: e.target.value as any })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ImageUploadField
                label="Product image"
                category="PRODUCT"
                mediaId={editing.imageId || null}
                initialUrl={editing.imageUrl || null}
                onChange={(id) => setEditing({ ...editing, imageId: id })}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setEditing(null)}
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

export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <ProductsContent />
    </ProtectedRoute>
  );
}
