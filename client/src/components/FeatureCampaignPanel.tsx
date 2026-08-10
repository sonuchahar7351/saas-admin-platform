"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { campaignsApi } from "../lib/campaigns-api";
import { ImageUploadField } from "./ImageUploadField";

export function FeatureCampaignPanel({
  campaign,
  onUpdated,
}: {
  campaign: any;
  onUpdated: () => void;
}) {
  const [isFeatured, setIsFeatured] = useState(campaign.isFeatured);
  const [order, setOrder] = useState(campaign.featuredOrder ?? 0);
  const [desktopId, setDesktopId] = useState(campaign.featureImageDesktopId);
  const [mobileId, setMobileId] = useState(campaign.featureImageMobileId);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    try {
      await campaignsApi.setFeatured(campaign.id, {
        isFeatured,
        featuredOrder: order,
        featureImageDesktopId: desktopId || undefined,
        featureImageMobileId: mobileId || undefined,
      });
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update.");
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Star size={16} className="text-amber-500" />
        <p className="text-sm font-medium">Homepage feature</p>
      </div>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />
        Show in homepage hero carousel
      </label>
      {isFeatured && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Order (lower = shown first)
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <ImageUploadField
            label="Desktop feature image"
            category="CAMPAIGN"
            mediaId={desktopId}
            initialUrl={campaign.featureImageDesktopUrl}
            onChange={setDesktopId}
          />
          <ImageUploadField
            label="Mobile feature image"
            category="CAMPAIGN"
            mediaId={mobileId}
            initialUrl={campaign.featureImageMobileUrl}
            onChange={setMobileId}
          />
        </div>
      )}
      <button
        onClick={handleSave}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Save
      </button>
    </div>
  );
}
