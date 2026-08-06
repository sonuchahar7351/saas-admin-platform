"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { campaignsApi, CampaignRecord } from "../../../lib/campaigns-api";
import { CampaignCard } from "../../../components/CampaignCard";

const TABS = [
  { label: "All", value: "" },
  { label: "Created", value: "CREATED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Deleted", value: "DELETED" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data } = await campaignsApi.getAll(
        activeTab ? { status: activeTab } : undefined,
      );
      setCampaigns(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab]);

  const handleStatusChange = async (id: string, status: string) => {
    await campaignsApi.changeStatus(id, status);
    load();
  };

  const handleDuplicate = async (id: string) => {
    await campaignsApi.duplicate(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this campaign? This marks it as deleted but preserves donation history.",
      )
    )
      return;
    await campaignsApi.delete(id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {campaigns.length} campaigns
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Create campaign
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-accent text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="font-display text-sm font-medium">
            No campaigns here yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Create your first campaign to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onStatusChange={handleStatusChange}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
