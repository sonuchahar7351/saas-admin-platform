"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { ProtectedRoute } from "../../../../components/ProtectedRoute";
import { campaignsApi } from "../../../../lib/campaigns-api";
import { CampaignStatusBadge } from "../../../../components/CampaignStatusBadge";
import { MorphBadge } from "../../../../components/MorphBadge";
import { MorphCampaign, morphCampaignsApi } from "@/lib/morph-campaign-api";

// same transition map as CampaignCard — status changes follow the identical rules,
// since a Morph is a Campaign row and goes through the same changeStatus endpoint
const NEXT_STATUS: Record<string, string[]> = {
  CREATED: ["ACTIVE", "DELETED", "COMPLETED"],
  ACTIVE: ["COMPLETED", "DELETED", "CREATED"],
  COMPLETED: ["ACTIVE", "DELETED"], // reactivation now allowed — backend gates it against the PARENT's numbers
  DELETED: [],
};

function MorphActionsMenu({
  morph,
  onChanged,
}: {
  morph: MorphCampaign;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = async (status: string) => {
    setError("");
    try {
      await campaignsApi.changeStatus(morph.id, status);
      setOpen(false);
      onChanged();
    } catch (err: any) {
      // this is where a Morph-specific rejection actually shows up — e.g. the parent
      // hasn't had its goal/expiry resolved yet, so reactivation is blocked
      setError(err.response?.data?.message || "Could not change status.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this Morph campaign? Its content will be removed, but donation history is preserved on the parent.",
      )
    )
      return;
    await campaignsApi.delete(morph.id);
    setOpen(false);
    onChanged();
  };

  const options = NEXT_STATUS[morph.status] || [];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 -top-8 z-10 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
          {error && (
            <p className="mx-2 mb-1 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-600">
              {error}
            </p>
          )}
          {options
            .filter((s) => s !== "DELETED")
            .map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
              >
                Mark as {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          {morph.status !== "DELETED" && (
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MorphListContent() {
  const [morphs, setMorphs] = useState<MorphCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    morphCampaignsApi.getAll().then(({ data }) => {
      setMorphs(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Morph Campaigns
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Marketing/ad versions sharing a parent campaign's donation pool.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/morph/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Create Morph Campaign
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : morphs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="font-display text-sm font-medium">
            No Morph campaigns yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Create one from an existing active campaign to use in ad campaigns.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Parent Campaign</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3"></th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {morphs.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.title}</span>
                        <MorphBadge />
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-text-secondary">
                        /{m.slug}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/campaigns/${m.parent.id}/edit`}
                        className="text-accent hover:underline"
                      >
                        {m.parent.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <CampaignStatusBadge status={m.status} />
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/campaigns/morph/${m.id}/edit`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MorphActionsMenu morph={m} onChanged={load} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MorphListPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <MorphListContent />
    </ProtectedRoute>
  );
}
