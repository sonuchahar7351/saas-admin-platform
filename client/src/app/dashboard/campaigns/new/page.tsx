"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../../../components/ProtectedRoute";
import {
  CampaignForm,
  CampaignFormValues,
} from "../../../../components/CampaignForm";
import { campaignsApi } from "../../../../lib/campaigns-api";

function CreateCampaignContent() {
  const router = useRouter();

  const handleSubmit = async (values: CampaignFormValues) => {
    await campaignsApi.create({
      title: values.title,
      slug: values.slug || undefined,
      ngoId: values.ngoId,
      categoryId: values.categoryId,
      goalAmount: Number(values.goalAmount),
      shortDescription: values.shortDescription,
      cardImageId: values.cardImageId || undefined,
      expiryDate: new Date(values.expiryDate).toISOString(),
      isAddress: values.isAddress,
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Create campaign
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Section 1 — content and basics.
      </p>
      <CampaignForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <CreateCampaignContent />
    </ProtectedRoute>
  );
}
