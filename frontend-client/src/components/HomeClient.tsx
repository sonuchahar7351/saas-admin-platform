"use client";

import { useEffect, useState } from "react";
import { HeroCarousel } from "./HeroCarousel";
import { StatsSection } from "./StatsSection";
import { ActiveCampaignsSection } from "./ActiveCampaignsSection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { FaqSection } from "./FaqSection";
import {
  campaignsApi,
  FeaturedCampaign,
  PublicCampaign,
} from "@/lib/campaigs-api";

export function HomeClient({
  initialFeatured,
  initialActive,
  initialStats,
}: {
  initialFeatured: FeaturedCampaign[];
  initialActive: PublicCampaign[];
  initialStats: any;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [active, setActive] = useState<PublicCampaign[]>(initialActive);
  const [loadingActive, setLoadingActive] = useState(false);

  // server gave us the unfiltered ("All") result already — only refetch when the person actually picks a category
  useEffect(() => {
    if (selectedCategory === null) {
      setActive(initialActive);
      return;
    }
    setLoadingActive(true);
    campaignsApi
      .getAll({ status: "ACTIVE", categoryId: selectedCategory, limit: 7 })
      .then(({ data }) => {
        setActive(data.data);
        setLoadingActive(false);
      });
  }, [selectedCategory]);

  const featuredIds = new Set(initialFeatured.map((f) => f.id));
  const nonFeaturedActive = active
    .filter((c) => !featuredIds.has(c.id))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {initialFeatured.length > 0 ? (
        <HeroCarousel campaigns={initialFeatured} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <p className="font-heading text-lg font-semibold">
            No featured campaigns right now
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Check back soon, or explore all active campaigns.
          </p>
        </div>
      )}

      <ActiveCampaignsSection
        campaigns={nonFeaturedActive}
        loading={loadingActive}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <WhyChooseUsSection />
      <StatsSection initialStats={initialStats} />

      <TestimonialsSection />
      <FaqSection />
    </div>
  );
}
