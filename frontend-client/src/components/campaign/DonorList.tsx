"use client";

import { CampaignDonor, donorsApi } from "@/lib/donor-api";
import { useEffect, useState } from "react";
import { DonorListModal } from "./DonorListModal";

export function DonorList({ campaignId }: { campaignId: string }) {
  const [donors, setDonors] = useState<CampaignDonor[]>([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    donorsApi.getByCampaign(campaignId, 1, 10).then(({ data }) => {
      setDonors(data.data);
      setTotal(data.total);
    });
  }, [campaignId]);

  if (donors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">
          {total} supporter{total !== 1 ? "s" : ""}
        </p>
        {total > 10 && (
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-medium text-accent hover:underline"
          >
            View all
          </button>
        )}
      </div>

      <div className="scrollbar-thin max-h-65 space-y-3 overflow-y-auto pr-1">
        {donors.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate font-medium">{d.donorName}</p>
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

      <DonorListModal
        campaignId={campaignId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
