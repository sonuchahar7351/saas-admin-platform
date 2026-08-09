"use client";

import { useParams } from "next/navigation";
import { DonationsTable } from "../../../../../../components/DonationsTable";

export default function CampaignTransactionsPage() {
  const { id } = useParams();
  return <DonationsTable campaignId={id as string} />;
}
