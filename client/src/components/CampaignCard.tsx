"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreVertical,
  ExternalLink,
  Pencil,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { CampaignRecord } from "../lib/campaigns-api";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

function daysRemaining(expiryDate: string): number {
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const NEXT_STATUS: Record<string, string[]> = {
  CREATED: ["ACTIVE", "DELETED"],
  ACTIVE: ["COMPLETED", "DELETED"],
  COMPLETED: ["DELETED"],
  DELETED: [],
};

export function CampaignCard({
  campaign,
  onStatusChange,
  onDuplicate,
  onDelete,
}: {
  campaign: CampaignRecord;
  onStatusChange: (id: string, status: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canView =
    campaign.status === "ACTIVE" || campaign.status === "COMPLETED";
  const days = daysRemaining(campaign.expiryDate);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-sm">
      <div className="relative h-36 bg-[#F1F2F4]">
        {/* image renders once media URLs are wired through — placeholder for now */}
        <div className="flex h-full items-center justify-center text-xs text-text-secondary">
          {campaign.cardImageId ? "Image" : "No image"}
        </div>
        <div className="absolute right-2 top-2">
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-1 font-display text-sm font-semibold">
          {campaign.title}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-text-secondary">
          /{campaign.slug}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
          <span className="text-text-secondary">Goal</span>
          <span className="text-right font-medium">
            ₹{(campaign.goalAmount / 100).toLocaleString("en-IN")}
          </span>
          <span className="text-text-secondary">Category</span>
          <span className="text-right">{campaign.category.name}</span>
          <span className="text-text-secondary">NGO</span>
          <span className="truncate text-right">{campaign.ngo.name}</span>
          <span className="text-text-secondary">Days left</span>
          <span className="text-right">
            {campaign.status === "ACTIVE" ? days : "—"}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1">
            {canView && (
              <a
                href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL}/campaigns/${campaign.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary"
                title="View on storefront"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <Link
              href={`/dashboard/campaigns/${campaign.id}/edit`}
              className="rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary"
              title="Edit"
            >
              <Pencil size={15} />
            </Link>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 -top-40 z-10 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg">
                {NEXT_STATUS[campaign.status]
                  ?.filter((s) => s !== "DELETED")
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusChange(campaign.id, s);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                    >
                      Mark as {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                <button
                  onClick={() => {
                    onDuplicate(campaign.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg"
                  disabled
                  title="Archive coming soon"
                >
                  <Archive size={14} /> Archive
                </button>
                {campaign.status !== "DELETED" && (
                  <button
                    onClick={() => {
                      onDelete(campaign.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
