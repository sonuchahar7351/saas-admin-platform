"use client";

import { DonationsTable } from "@/components/DonationsTable";
import { useParams } from "next/navigation";

export default function CampaignTransactionsPage() {
  const { id } = useParams();
  return <DonationsTable campaignId={id as string} />;
}
