"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { campaignsApi } from "../../../../../lib/campaigns-api";
import { CampaignStatusBadge } from "../../../../../components/CampaignStatusBadge";
import { CAMPAIGN_TABS } from "../../../../../config/campaign-tabs";

export default function EditCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    campaignsApi.getById(id as string).then(({ data }) => setCampaign(data));
  }, [id]);

  const basePath = `/dashboard/campaigns/${id}/edit`;
  const activeTab = pathname.split("/").pop();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {campaign?.title || "Loading…"}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-text-secondary">
            /{campaign?.slug}
          </p>
        </div>
        {campaign && <CampaignStatusBadge status={campaign.status} />}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {CAMPAIGN_TABS.map((tab) => {
          const href =
            tab.key === "content" ? basePath : `${basePath}/${tab.key}`;
          const isActive =
            tab.key === "content"
              ? activeTab === "edit"
              : activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-accent text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
