"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { productsApi, PublicProduct } from "@/lib/product-api";

function SmallProductCard({ p }: { p: PublicProduct }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      {p.imageUrl && (
        <img
          src={p.imageUrl}
          alt=""
          className="h-12 w-12 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{p.title}</p>
        <p className="text-xs text-text-muted">
          ₹{(p.amount / 100).toLocaleString("en-IN")}
        </p>
      </div>
      <button className="shrink-0 rounded-lg border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5">
        Donate
      </button>
    </div>
  );
}

function MediumProductCard({ p }: { p: PublicProduct }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {p.imageUrl && (
        <img src={p.imageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="p-4">
        <p className="font-heading text-sm font-semibold">{p.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-text-muted">
          {p.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-base font-semibold">
            ₹{(p.amount / 100).toLocaleString("en-IN")}
          </span>
          <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover">
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}

function MegaProductCard({ p }: { p: PublicProduct }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-linear-to-br from-accent/5 to-transparent">
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium text-white">
        <Sparkles size={10} /> Mega impact
      </div>
      {p.imageUrl && (
        <img src={p.imageUrl} alt="" className="h-44 w-full object-cover" />
      )}
      <div className="p-5">
        <p className="font-heading text-lg font-semibold">{p.title}</p>
        <p className="mt-1 text-sm text-text-muted">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-heading text-xl font-semibold text-accent">
            ₹{(p.amount / 100).toLocaleString("en-IN")}
          </span>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
            Donate this
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsSection({ campaignId }: { campaignId: string }) {
  const [products, setProducts] = useState<PublicProduct[]>([]);

  useEffect(() => {
    productsApi.getByCampaign(campaignId).then(({ data }) => setProducts(data));
  }, [campaignId]);

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-semibold">Ways to help</h2>
      <div className="space-y-3">
        {products
          .filter((p) => p.type === "SMALL")
          .map((p) => (
            <SmallProductCard key={p.id} p={p} />
          ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {products
          .filter((p) => p.type === "MEDIUM")
          .map((p) => (
            <MediumProductCard key={p.id} p={p} />
          ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {products
          .filter((p) => p.type === "MEGA")
          .map((p) => (
            <MegaProductCard key={p.id} p={p} />
          ))}
      </div>
    </div>
  );
}
