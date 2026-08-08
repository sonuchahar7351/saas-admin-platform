"use client";

import { CampaignCard } from "@/components/CampiagnCard";
import { campaignsApi, PublicCampaign } from "@/lib/campaigs-api";
import { useEffect, useState } from "react";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsApi.getAll().then(({ data }) => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-semibold">
          Active campaigns
        </h1>
        <p className="mt-2 text-text-muted">
          Every donation moves someone closer to what they need.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-text-muted">
          Loading campaigns…
        </p>
      ) : campaigns.length === 0 ? (
        <p className="text-center text-sm text-text-muted">
          No active campaigns right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
