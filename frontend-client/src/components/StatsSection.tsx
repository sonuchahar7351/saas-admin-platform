"use client";

import { Users, Heart, IndianRupee, CheckCircle2 } from "lucide-react";
import { formatIndianCompact, formatCount } from "../lib/format";

export function StatsSection({ initialStats }: { initialStats: any }) {
  if (!initialStats) return null;

  const items = [
    {
      icon: Users,
      label: "Donors",
      value: formatCount(initialStats.totalDonors),
    },
    {
      icon: IndianRupee,
      label: "Funds Raised",
      value: formatIndianCompact(initialStats.totalRaised),
    },
    {
      icon: Heart,
      label: "Campaigns",
      value: formatCount(initialStats.totalCampaigns),
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: formatCount(initialStats.completedCampaigns),
    },
  ];

  return (
    <section className="my-16 rounded-3xl bg-surface py-10">
      <div className="grid grid-cols-2 gap-6 px-6 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <item.icon size={20} className="mx-auto text-accent" />
            <p className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
