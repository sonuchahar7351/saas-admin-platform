"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { apiClient } from "../lib/api-client";

const MEDAL_COLORS = ["#D4AF37", "#A8A8A8", "#B87333"]; // gold, silver, bronze — ranks 1-3 only

export function LeaderboardWidget({
  campaignId,
  title = "Top supporters",
}: {
  campaignId?: string;
  title?: string;
}) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiClient
      .get("/donations/public/leaderboard", { params: { campaignId } })
      .then(({ data }) => setItems(data as any[]));
  }, [campaignId]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={16} className="text-accent" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <div className="space-y-2.5">
        {items.map((d) => (
          <div
            key={d.rank}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{
                  backgroundColor:
                    MEDAL_COLORS[d.rank - 1] || "var(--color-border)",
                  color: d.rank <= 3 ? "white" : "var(--color-text-muted)",
                }}
              >
                {d.rank}
              </span>
              <span className="font-medium">{d.donorName}</span>
            </div>
            <span className="font-mono text-xs text-text-muted">
              ₹{(d.totalAmount / 100).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
