"use client";

import { useEffect, useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignDonor, donorsApi } from "@/lib/donor-api";

export function DonorListModal({
  campaignId,
  open,
  onClose,
}: {
  campaignId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [donors, setDonors] = useState<CampaignDonor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearch("");
    setSearchInput("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    donorsApi
      .getByCampaign(campaignId, page, 15, search || undefined)
      .then(({ data }) => {
        setDonors(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      });
  }, [open, page, search]);

  if (!open) return null;

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">
            {total} supporters
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={runSearch}
          className="flex items-center gap-2 border-b border-border px-5 py-3"
        >
          <Search size={14} className="text-text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name"
            className="w-full text-sm outline-none"
          />
        </form>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">Loading…</p>
          ) : donors.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No supporters found.
            </p>
          ) : (
            <div className="space-y-3">
              {donors.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate font-medium">{d.donorName}</p>
                    {d.message && (
                      <p className="line-clamp-1 text-xs text-text-muted">
                        "{d.message}"
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-text-muted">
                    ₹{(d.amount / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-border px-5 py-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
