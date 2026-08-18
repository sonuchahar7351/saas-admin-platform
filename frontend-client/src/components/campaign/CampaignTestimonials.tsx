"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import {
  campaignTestimonialsApi,
  CampaignTestimonial,
} from "../../lib/campaign-testimonials-api";
import CustomSwiper from "../CustomSwiper";

export function CampaignTestimonials({ campaignId }: { campaignId: string }) {
  const [items, setItems] = useState<CampaignTestimonial[]>([]);

  useEffect(() => {
    campaignTestimonialsApi
      .getByCampaign(campaignId)
      .then(({ data }) => setItems(data));
  }, [campaignId]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-170">
      <h2 className="mb-4 font-heading text-xl font-semibold">
        What people are saying
      </h2>

      <CustomSwiper
        slidesPerView={1}
        spaceBetween={10}
        showDots={true}
        autoplay={items.length > 3}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 10 },
          768: { slidesPerView: 2, spaceBetween: 15 },
          1024: { slidesPerView: 2, spaceBetween: 20 },
        }}
        loop={items.length > 3}
        wrapperClassName="w-full"
        carouselContainerClassName="relative w-full pb-8"
        paginationColor="#706c64"
        activePaginationColor="#10b981"
      >
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
      </CustomSwiper>
    </div>
  );
}
