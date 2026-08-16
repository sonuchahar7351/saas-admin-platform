import type { Metadata } from "next";
import { serverFetch } from "../lib/server-api";
import { HomeClient } from "../components/HomeClient";

export const revalidate = 60; // same reasoning as campaign detail — donation totals shift, don't go fully static

export const metadata: Metadata = {
  title: "GiveForward — Crowdfunding for the causes that matter",
  description:
    "Discover and support verified campaigns. Every donation is tracked, transparent, and makes a real difference.",
  openGraph: {
    title: "GiveForward — Crowdfunding for the causes that matter",
    description:
      "Discover and support verified campaigns. Every donation is tracked, transparent, and makes a real difference.",
    type: "website",
  },
};

export default async function HomePage() {
  const [featured, active, stats] = await Promise.all([
    serverFetch<any[]>("/campaigns/public/featured", 60),
    serverFetch<{ data: any[] }>("/campaigns/public?status=ACTIVE&limit=7", 60),
    serverFetch<any>("/analytics/public/stats", 60),
  ]);

  return (
    <HomeClient
      initialFeatured={featured || []}
      initialActive={active?.data || []}
      initialStats={stats}
    />
  );
}
