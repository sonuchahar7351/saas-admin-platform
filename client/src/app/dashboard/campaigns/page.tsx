"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { campaignsApi, CampaignRecord } from "../../../lib/campaigns-api";
import { CampaignCard } from "../../../components/CampaignCard";
import { showError, showSuccess } from "@/lib/toast";

const TABS = [
  { label: "All", value: "" },
  { label: "Created", value: "CREATED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Deleted", value: "DELETED" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data } = await campaignsApi.getAll({
        status: activeTab || undefined,
        search: search || undefined,
        page,
        limit: 12,
      });
      setCampaigns(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab, search, page]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await campaignsApi.changeStatus(id, status);
      showSuccess(`Campaign marked as ${status.toLowerCase()}`);
      load();
    } catch (err) {
      showError(err); // this is exactly where the Morph reactivation rejection message now surfaces cleanly
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await campaignsApi.duplicate(id);
      showSuccess("Campaign duplicated");
      load();
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?...")) return;
    try {
      await campaignsApi.delete(id);
      showSuccess("Campaign deleted");
      load();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{total} campaigns</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Create campaign
        </Link>
      </div>

      <form
        onSubmit={runSearch}
        className="mb-4 flex max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
      >
        <Search size={14} className="text-text-secondary" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title, slug, or NGO"
          className="w-full text-sm outline-none"
        />
      </form>

      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-accent text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="font-display text-sm font-medium">No campaigns found</p>
          <p className="mt-1 text-sm text-text-secondary">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onStatusChange={handleStatusChange}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
