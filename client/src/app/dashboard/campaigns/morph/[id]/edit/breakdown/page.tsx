"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  morphCampaignsApi,
  SourceBreakdownItem,
} from "@/lib/morph-campaign-api";

export default function MorphBreakdownPage() {
  const { id } = useParams();
  const [morph, setMorph] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<SourceBreakdownItem[]>([]);

  useEffect(() => {
    morphCampaignsApi.getById(id as string).then(({ data }: any) => {
      setMorph(data);
      if (data.parent?.id) {
        morphCampaignsApi
          .getSourceBreakdown(data.parent.id)
          .then(({ data: b }) => setBreakdown(b));
      }
    });
  }, [id]);

  const total = breakdown.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-text-secondary">
        How the parent campaign's total (₹
        {(total / 100).toLocaleString("en-IN")}) breaks down by source — the
        parent campaign itself and every Morph variant.
      </p>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Donations</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((b) => (
              <tr
                key={b.sourceCampaignId}
                className={`border-b border-border last:border-0 ${b.sourceCampaignId === morph?.id ? "bg-purple-50/50" : ""}`}
              >
                <td className="px-5 py-3 font-medium">
                  {b.sourceTitle}{" "}
                  {b.sourceCampaignId === morph?.parent?.id && (
                    <span className="text-xs text-text-secondary">
                      (parent)
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">{b.donationCount}</td>
                <td className="px-5 py-3">
                  ₹{(b.totalAmount / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-text-secondary">
                  {total > 0 ? Math.round((b.totalAmount / total) * 100) : 0}%
                </td>
              </tr>
            ))}
            {breakdown.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-text-secondary"
                >
                  No donations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
