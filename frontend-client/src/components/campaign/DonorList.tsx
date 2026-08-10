"use client";

import { CampaignDonor, donorsApi } from "@/lib/donor-api";
import { useEffect, useState } from "react";

export function DonorList({ campaignId }: { campaignId: string }) {
  const [donors, setDonors] = useState<CampaignDonor[]>([]);

  useEffect(() => {
    donorsApi.getByCampaign(campaignId).then(({ data }) => setDonors(data));
  }, [campaignId]);

  if (donors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="mb-3 text-sm font-medium">
        {donors.length} recent supporters
      </p>
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {donors.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{d.donorName}</p>
              {d.message && (
                <p className="line-clamp-1 text-xs text-text-muted">
                  "{d.message}"
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-xs text-text-muted">
              ₹{(d.amount / 100).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
