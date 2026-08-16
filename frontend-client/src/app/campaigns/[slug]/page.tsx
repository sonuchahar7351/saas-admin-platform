import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetch } from "../../../lib/server-api";
import { CampaignDetailClient } from "@/components/campaign/CampaignClientDetail";

export const revalidate = 60; // ISR — regenerate at most once per minute per campaign

interface CampaignData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  goalAmount: number;
  raisedAmount: number;
  expiryDate: string;
  cardImageUrl: string | null;
  bannerImageUrls: string[];
  category: { id: string; name: string };
  ngo: { id: string; name: string };
  story: any;
  isAddress: boolean;
  donationPresets: { amount: number; isDefault: boolean }[];
  tipPresets: { percentage: number; isDefault: boolean }[];
}

async function getCampaign(slug: string) {
  return serverFetch<CampaignData>(`/campaigns/public/${slug}`, 60);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign: any = await getCampaign(slug);
  if (!campaign) return { title: "Campaign not found" };

  return {
    title: `${campaign.title} | GiveForward`,
    description: campaign.shortDescription,
    openGraph: {
      title: campaign.title,
      description: campaign.shortDescription,
      images: campaign.cardImageUrl
        ? [{ url: campaign.cardImageUrl, width: 1200, height: 630 }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description: campaign.shortDescription,
      images: campaign.cardImageUrl ? [campaign.cardImageUrl] : [],
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign: any = await getCampaign(slug);
  if (!campaign) notFound();

  return <CampaignDetailClient campaign={campaign} />;
}
