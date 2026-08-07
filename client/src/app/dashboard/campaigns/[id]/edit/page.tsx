"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "../../../../../components/ProtectedRoute";
import {
  CampaignForm,
  CampaignFormValues,
} from "../../../../../components/CampaignForm";
import { campaignsApi } from "../../../../../lib/campaigns-api";
import { mediaApi } from "../../../../../lib/media-api";

function EditCampaignContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] =
    useState<Partial<CampaignFormValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: campaign } = await campaignsApi.getById(id);

      let cardImageUrl: string | null = null;
      if (campaign.cardImageId) {
        try {
          const { data: media } = await mediaApi.getById(campaign.cardImageId);
          cardImageUrl = media.url;
        } catch {
          cardImageUrl = null; // media was deleted separately — degrade gracefully, don't block the edit page
        }
      }

      setInitialValues({
        title: campaign.title,
        slug: campaign.slug,
        ngoId: campaign.ngoId,
        categoryId: campaign.categoryId,
        goalAmount: String(campaign.goalAmount / 100), // paise -> rupees for the input
        shortDescription: campaign.shortDescription,
        expiryDate: campaign.expiryDate.slice(0, 10), // ISO datetime -> yyyy-mm-dd for <input type="date">
        cardImageId: campaign.cardImageId,
        cardImageUrl,
        story: campaign.story,
        donationPresets: campaign.donationPresets.map((p) => ({
          value: p.amount,
          isDefault: p.isDefault,
        })),
        tipPresets: campaign.tipPresets.map((p) => ({
          value: p.percentage,
          isDefault: p.isDefault,
        })),
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (values: CampaignFormValues) => {
    await campaignsApi.update(id, {
      title: values.title,
      ngoId: values.ngoId,
      categoryId: values.categoryId,
      goalAmount: Number(values.goalAmount),
      shortDescription: values.shortDescription,
      cardImageId: values.cardImageId || undefined,
      expiryDate: new Date(values.expiryDate).toISOString(),
      story: values.story,
      donationPresets: values.donationPresets.map((p) => ({
        amount: p.value,
        isDefault: p.isDefault,
      })),
      tipPresets: values.tipPresets.map((p) => ({
        percentage: p.value,
        isDefault: p.isDefault,
      })),
    });
    router.push("/dashboard/campaigns");
  };

  if (loading)
    return <p className="text-sm text-text-secondary">Loading campaign…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Edit campaign
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Update campaign details below.
      </p>
      <CampaignForm
        mode="edit"
        initialValues={initialValues!}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function EditCampaignPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <EditCampaignContent />
    </ProtectedRoute>
  );
}
