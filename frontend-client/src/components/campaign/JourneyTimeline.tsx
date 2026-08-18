"use client";

import { useEffect, useState } from "react";
import { journeyApi, PublicJourneyStep } from "../../lib/journey-api";

export function JourneyTimeline({ campaignId }: { campaignId: string }) {
  const [steps, setSteps] = useState<PublicJourneyStep[]>([]);

  useEffect(() => {
    journeyApi
      .getByCampaign(campaignId)
      .then(({ data }) => setSteps(data.sort((a, b) => a.order - b.order)));
  }, [campaignId]);

  if (steps.length === 0) return null;

  return (
    <div className="">
      <h2 className="mb-4 font-heading text-xl font-semibold text-left">
        Campaign journey
      </h2>
      <div className="space-y-6 border-l-2 border-dashed border-border pl-5">
        {steps.map((s) => (
          <div key={s.id} className="relative">
            <span className="absolute -left-6.75 top-0 flex h-3 w-3 items-center justify-center rounded-full border-2 border-accent bg-surface" />
            <div className="flex gap-3">
              {s.imageUrl && (
                <img
                  src={s.imageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-heading text-sm font-semibold">{s.title}</p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {s.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
