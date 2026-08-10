"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicCampaign } from "@/lib/campaigs-api";
import { CampaignCard } from "./CampiagnCard";
import { CategoryPills } from "./CategoryPills";

export function ActiveCampaignsSection({
  campaigns,
  loading,
  selectedCategory,
  onCategoryChange,
}: {
  campaigns: PublicCampaign[];
  loading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}) {
  return (
    <section className="my-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Active campaigns
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Every contribution brings someone closer to what they need.
          </p>
        </div>
        <Link
          href="/campaigns"
          className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
        >
          View all campaigns <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mb-6">
        <CategoryPills
          selected={selectedCategory}
          onSelect={onCategoryChange}
        />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-border/40"
            />
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <p className="text-sm text-text-muted">
          No active campaigns right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      <Link
        href="/campaigns"
        className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-accent hover:underline sm:hidden"
      >
        View all campaigns <ArrowRight size={14} />
      </Link>
    </section>
  );
}
