"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import {
  campaignTestimonialsApi,
  CampaignTestimonial,
} from "../../lib/campaign-testimonials-api";

export function CampaignTestimonials({ campaignId }: { campaignId: string }) {
  const [items, setItems] = useState<CampaignTestimonial[]>([]);

  useEffect(() => {
    campaignTestimonialsApi
      .getByCampaign(campaignId)
      .then(({ data }) => setItems(data));
  }, [campaignId]);

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-semibold">
        What people are saying
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <Quote size={16} className="text-accent/40" />
            <p className="mt-2 text-sm text-text-muted">{t.description}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              {t.imageUrl ? (
                <img
                  src={t.imageUrl}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-xs">
                  {t.name[0]}
                </div>
              )}
              <div>
                <p className="text-xs font-medium">{t.name}</p>
                {t.designation && (
                  <p className="text-xs text-text-muted">{t.designation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
