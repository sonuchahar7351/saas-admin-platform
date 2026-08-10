"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CategoryPills } from "../../components/CategoryPills";
import { campaignsApi, PublicCampaign } from "@/lib/campaigs-api";
import { CampaignCard } from "@/components/CampiagnCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostFunded", label: "Most funded" },
  { value: "leastFunded", label: "Least funded" },
  { value: "endingSoon", label: "Ending soon" },
];

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    campaignsApi
      .getAll({
        categoryId: category || undefined,
        search: search || undefined,
        status: status || undefined,
        sortBy,
        page,
        limit,
      })
      .then(({ data }) => {
        setCampaigns(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      });
  }, [category, search, status, sortBy, page]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-semibold">
          Explore campaigns
        </h1>
        <p className="mt-2 text-text-muted">
          {total} campaign{total !== 1 ? "s" : ""} making a difference.
        </p>
      </div>

      <form
        onSubmit={runSearch}
        className="mx-auto mb-5 flex max-w-md items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5"
      >
        <Search size={16} className="text-text-muted" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title, NGO, or category"
          className="w-full text-sm outline-none"
        />
      </form>

      <div className="mb-5">
        <CategoryPills
          selected={category}
          onSelect={(id) => {
            setCategory(id);
            setPage(1);
          }}
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">Active & Completed</option>
          <option value="ACTIVE">Active only</option>
          <option value="COMPLETED">Completed only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-border/40"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">
          No campaigns match your filters.
        </p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c: any) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
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
