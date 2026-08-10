"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeaturedCampaign } from "@/lib/campaigs-api";

export function HeroCarousel({ campaigns }: { campaigns: FeaturedCampaign[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % campaigns.length),
    [campaigns.length],
  );
  const prev = () =>
    setIndex((i) => (i - 1 + campaigns.length) % campaigns.length);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, campaigns.length]);

  if (campaigns.length === 0) return null;

  const active = campaigns[index];
  const percent = Math.min(
    100,
    Math.round((active.raisedAmount / active.goalAmount) * 100),
  );

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="relative h-105 sm:h-120">
        {/* desktop image */}
        {active.featureImageDesktopUrl && (
          <img
            src={active.featureImageDesktopUrl}
            alt={active.title}
            className="absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-500 sm:block"
          />
        )}
        {/* mobile image — falls back to desktop if no mobile-specific one was set */}
        <img
          src={
            active.featureImageMobileUrl || active.featureImageDesktopUrl || ""
          }
          alt={active.title}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 sm:hidden"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white backdrop-blur-sm">
            {active.category.name}
          </span>
          <h2 className="mt-3 max-w-xl font-heading text-2xl font-semibold text-white sm:text-3xl">
            {active.title}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            {active.shortDescription}
          </p>

          <div className="mt-4 max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-white/80">
              ₹{(active.raisedAmount / 100).toLocaleString("en-IN")} raised of ₹
              {(active.goalAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>

          <Link
            href={`/campaigns/${active.slug}`}
            className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Donate now
          </Link>
        </div>

        {campaigns.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-4 right-6 flex gap-1.5">
              {campaigns.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
