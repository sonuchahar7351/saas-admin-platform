"use client";

import { useEffect, useState } from "react";
import {
  campaignUpdatesApi,
  CampaignUpdate,
} from "../../lib/campaign-updates-api";
import { StoryRenderer } from "../StoryRenderer";

export function UpdatesTimeline({ campaignId }: { campaignId: string }) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);

  useEffect(() => {
    campaignUpdatesApi
      .getByCampaign(campaignId)
      .then(({ data }) => setUpdates(data));
  }, [campaignId]);

  if (updates.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-semibold">Updates</h2>
      <div className="space-y-6 border-l border-border pl-5">
        {updates.map((u) => (
          <div key={u.id} className="relative">
            <span className="absolute -left-6.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-xs text-text-muted">
              {new Date(u.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="mt-1 font-heading text-base font-semibold">
              {u.title}
            </p>
            <div className="mt-1 text-sm text-text-muted">
              <StoryRenderer content={u.content} />
            </div>
            {u.glimpses.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {u.glimpses
                  .flatMap((g) => g.images)
                  .map(
                    (img, i) =>
                      img.url && (
                        <img
                          key={i}
                          src={img.url}
                          alt=""
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ),
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
