"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StoryRenderer } from "../../../components/StoryRenderer";
import { DonationForm } from "../../../components/DonationForm";
import { CampaignGallery } from "../../../components/campaign/CampaignGallery";
import { DonorList } from "../../../components/campaign/DonorList";
import { ProductsSection } from "../../../components/campaign/ProductsSection";
import { CampaignTestimonials } from "../../../components/campaign/CampaignTestimonials";
import { UpdatesTimeline } from "../../../components/campaign/UpdatesTimeline";
import { JourneyTimeline } from "../../../components/campaign/JourneyTimeline";
import { campaignsApi } from "@/lib/campaigs-api";

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsApi.getBySlug(slug as string).then(({ data }) => {
      setCampaign(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading)
    return <p className="p-16 text-center text-sm text-text-muted">Loading…</p>;
  if (!campaign)
    return (
      <p className="p-16 text-center text-sm text-text-muted">
        Campaign not found.
      </p>
    );

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
          <DonationForm campaign={campaign} />
          <DonorList campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}
