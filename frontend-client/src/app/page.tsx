"use client";

import { useEffect, useState } from "react";
import { HeroCarousel } from "../components/HeroCarousel";
import { StatsSection } from "../components/StatsSection";
import { ActiveCampaignsSection } from "../components/ActiveCampaignsSection";
import {
  campaignsApi,
  FeaturedCampaign,
  PublicCampaign,
} from "@/lib/campaigs-api";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";

export default function HomePage() {
  const [featured, setFeatured] = useState<FeaturedCampaign[]>([]);
  const [active, setActive] = useState<PublicCampaign[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingActive, setLoadingActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setLoadingActive(true);
    campaignsApi
      .getAll({
        status: "ACTIVE",
        categoryId: selectedCategory || undefined,
        limit: 7,
      })
      .then(({ data }) => {
        setLoadingActive(false);
        setActive(data.data);
      });
  }, [selectedCategory]);

  useEffect(() => {
    campaignsApi.getFeatured().then(({ data }) => {
      setFeatured(data);
      setLoadingFeatured(false);
    });
  }, []);

  // exclude featured campaigns from the active grid, per spec — they already got their spotlight in the hero
  const featuredIds = new Set(featured.map((f) => f.id));
  const nonFeaturedActive = active
    ?.filter((c: any) => !featuredIds.has(c.id))
    ?.slice(0, 6); // homepage shows a limited preview

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {loadingFeatured ? (
        <div className="h-105 animate-pulse rounded-3xl bg-border/40 sm:h-120" />
      ) : featured.length > 0 ? (
        <HeroCarousel campaigns={featured} />
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

      <StatsSection />

      <WhyChooseUsSection />
      <TestimonialsSection />
      <FaqSection />
    </div>
  );
}
