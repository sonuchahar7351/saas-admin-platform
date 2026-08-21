"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProtectedRoute } from "../../../../components/ProtectedRoute";

import { CampaignStatusBadge } from "../../../../components/CampaignStatusBadge";
import { MorphBadge } from "../../../../components/MorphBadge";
import { MorphCampaign, morphCampaignsApi } from "@/lib/morph-campaign-api";

function MorphListContent() {
  const [morphs, setMorphs] = useState<MorphCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    morphCampaignsApi.getAll().then(({ data }) => {
      setMorphs(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Morph Campaigns
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Marketing/ad versions sharing a parent campaign's donation pool.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/morph/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Create Morph Campaign
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : morphs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="font-display text-sm font-medium">
            No Morph campaigns yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Create one from an existing active campaign to use in ad campaigns.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Parent Campaign</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {morphs.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-0 hover:bg-bg"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.title}</span>
                      <MorphBadge />
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-text-secondary">
                      /{m.slug}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/campaigns/${m.parent.id}/edit`}
                      className="text-accent hover:underline"
                    >
                      {m.parent.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <CampaignStatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {new Date(m.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/campaigns/morph/${m.id}/edit`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MorphListPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <MorphListContent />
    </ProtectedRoute>
  );
}
