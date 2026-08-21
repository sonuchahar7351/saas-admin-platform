"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CampaignStatusBadge } from "../../../../../../components/CampaignStatusBadge";
import { MorphBadge } from "../../../../../../components/MorphBadge";
import { morphCampaignsApi } from "@/lib/morph-campaign-api";

const TABS = [
  { key: "content", label: "Content" },
  { key: "images", label: "Images" },
  { key: "products", label: "Products" },
  { key: "journey", label: "Journey" },
  { key: "testimonials", label: "Testimonials" },
  { key: "updates", label: "Updates" },
  { key: "breakdown", label: "Source Breakdown" },
];

export default function MorphEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const pathname = usePathname();
  const [morph, setMorph] = useState<any>(null);
  console.log("morph", morph?.status, morph);

  useEffect(() => {
    morphCampaignsApi.getById(id as string).then(({ data }) => setMorph(data));
  }, [id]);

  const basePath = `/dashboard/campaigns/morph/${id}/edit`;
  const activeTab = pathname.split("/").pop();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {morph?.title || "Loading…"}
            </h1>
            <MorphBadge />
          </div>
          <p className="mt-0.5 font-mono text-xs text-text-secondary">
            /{morph?.slug}
          </p>
        </div>
        {morph && <CampaignStatusBadge status={morph.status} />}
      </div>

      {morph?.parent && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50 px-4 py-2.5 text-sm">
          <span className="text-purple-700">
            Financial data (goal, raised amount, expiry, donation eligibility)
            is managed by the parent campaign.
          </span>
          <Link
            href={`/dashboard/campaigns/${morph.parent.id}/edit`}
            className="flex items-center gap-1 font-medium text-purple-700 hover:underline"
          >
            View parent <ArrowUpRight size={13} />
          </Link>
        </div>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
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
