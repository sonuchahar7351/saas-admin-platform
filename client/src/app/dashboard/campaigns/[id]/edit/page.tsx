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
  const { id } = useParams();
  const [initialValues, setInitialValues] =
    useState<Partial<CampaignFormValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: campaign } = await campaignsApi.getById(id as string);
      let cardImageUrl: string | null = null;
      if (campaign.cardImageId) {
        try {
          const { data: media } = await mediaApi.getById(campaign.cardImageId);
          cardImageUrl = media.url;
        } catch {
          cardImageUrl = null;
        }
      }
      setInitialValues({
        title: campaign.title,
        slug: campaign.slug,
        ngoId: campaign.ngoId,
        categoryId: campaign.categoryId,
        goalAmount: String(campaign.goalAmount / 100),
        shortDescription: campaign.shortDescription,
        expiryDate: campaign.expiryDate.slice(0, 10),
        cardImageId: campaign.cardImageId,
        cardImageUrl,
        story: campaign.story,
        donationPresets: campaign.donationPresets.map((p: any) => ({
          value: p.amount,
          isDefault: p.isDefault,
        })),
        tipPresets: campaign.tipPresets.map((p: any) => ({
          value: p.percentage,
          isDefault: p.isDefault,
        })),
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (values: CampaignFormValues) => {
    await campaignsApi.update(id as string, {
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
    router.push(`/dashboard/campaigns/${id}/edit`);
  };

  if (loading)
    return <p className="text-sm text-text-secondary">Loading campaign…</p>;

  return (
    <CampaignForm
      mode="edit"
      initialValues={initialValues!}
      onSubmit={handleSubmit}
    />
  );
}

export default function EditCampaignPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <EditCampaignContent />
    </ProtectedRoute>
  );
}
