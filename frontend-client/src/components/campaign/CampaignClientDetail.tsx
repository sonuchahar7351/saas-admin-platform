"use client";

import { useEffect } from "react";
import { StoryRenderer } from "../StoryRenderer";
import { DonationSelector } from "./DonationSelector";
import { CampaignGallery } from "./CampaignGallery";
import { DonorList } from "./DonorList";
import { ProductsSection } from "./ProductsSection";
import { CampaignTestimonials } from "./CampaignTestimonials";
import { UpdatesTimeline } from "./UpdatesTimeline";
import { JourneyTimeline } from "./JourneyTimeline";
import { useCartStore } from "../../store/cart-store";

export function CampaignDetailClient({ campaign }: { campaign: any }) {
  const initCampaign = useCartStore((s) => s.initCampaign);

  useEffect(() => {
    initCampaign({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      tipPresets: campaign.tipPresets,
      isAddress: campaign.isAddress,
    });
  }, [campaign.id]);

  const percent = Math.min(
    100,
    Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
  );
  const galleryImages = [
    campaign.cardImageUrl,
    ...(campaign.bannerImageUrls || []),
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <CampaignGallery images={galleryImages} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-wide text-accent">
              {campaign.category.name}
            </span>
            <h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
              {campaign.title}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              by {campaign.ngo.name}
            </p>
          </div>

          <div className="block sm:hidden space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDEBE4]">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-2xl font-semibold">
                  ₹{(campaign.raisedAmount / 100).toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-text-muted">
                  raised of ₹
                  {(campaign.goalAmount / 100).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <DonationSelector campaign={campaign} />
          </div>

          {campaign.story && <StoryRenderer content={campaign.story} />}

          <ProductsSection campaignId={campaign.id} />
          <JourneyTimeline campaignId={campaign.id} />
          <UpdatesTimeline campaignId={campaign.id} />
          <CampaignTestimonials campaignId={campaign.id} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDEBE4]">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-semibold">
                ₹{(campaign.raisedAmount / 100).toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-text-muted">
                raised of ₹{(campaign.goalAmount / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <DonationSelector campaign={campaign} />
          </div>
          <DonorList campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}
