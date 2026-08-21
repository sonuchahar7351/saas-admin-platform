"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../../../../components/ProtectedRoute";
import { campaignsApi, CampaignRecord } from "../../../../../lib/campaigns-api";
import { morphCampaignsApi } from "@/lib/morph-campaign-api";

function NewMorphContent() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [parentId, setParentId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    campaignsApi.getAll({ limit: 100 }).then(({ data }) => {
      // client-side filter mirrors the backend rule — normal campaigns only, never a Morph as parent
      setCampaigns(
        data.data.filter((c: any) => !c.isMorph && c.status !== "DELETED"),
      );
    });
  }, []);

  const selectedParent = campaigns.find((c) => c.id === parentId);

  const handleCreate = async () => {
    if (!parentId || !title) return;
    setError("");
    setCreating(true);
    try {
      const { data } = await morphCampaignsApi.create({
        parentCampaignId: parentId,
        title,
      });
      router.push(`/dashboard/campaigns/morph/${(data as any).id}/edit`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Could not create Morph campaign.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Create Morph Campaign
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Copies content from a parent campaign into a new marketing/ad variant
        that shares its donation pool.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            1. Select parent campaign
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Select a campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
          {selectedParent && (
            <p className="mt-1.5 text-xs text-text-secondary">
              Goal ₹
              {((selectedParent as any).goalAmount / 100).toLocaleString(
                "en-IN",
              )}{" "}
              · Raised ₹
              {((selectedParent as any).raisedAmount / 100).toLocaleString(
                "en-IN",
              )}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            2. Morph campaign title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Help 100 Children Get Education"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <p className="mt-1.5 text-xs text-text-secondary">
            Content (story, images, journey, updates, testimonials, products)
            will be copied from the parent and can be edited independently
            afterward.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={!parentId || !title || creating}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create Morph Campaign"}
        </button>
      </div>
    </div>
  );
}

export default function NewMorphPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <NewMorphContent />
    </ProtectedRoute>
  );
}
