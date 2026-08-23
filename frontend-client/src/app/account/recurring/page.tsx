"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCustomerAuthStore } from "../../../store/customer-auth-store";
import { recurringDonationsApi } from "../../../lib/recurring-donations-api";
import { showError, showSuccess } from "../../../lib/toast";
import Link from "next/link";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Awaiting authorization", color: "text-amber-600" },
  ACTIVE: { label: "Active", color: "text-emerald-600" },
  PAUSED: { label: "Paused", color: "text-text-muted" },
  HALTED: { label: "Payment issue — action needed", color: "text-red-600" },
  CANCELLED: { label: "Cancelled", color: "text-text-muted" },
  COMPLETED: { label: "Completed", color: "text-text-muted" },
};

export default function RecurringDonationsPage() {
  const { customer, isLoading } = useCustomerAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !customer)
      router.push("/login?redirect=/account/recurring");
  }, [isLoading, customer]);

  const load = () => {
    if (!customer) return;
    setLoading(true);
    recurringDonationsApi
      .getMine({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
      })
      .then(({ data }) => {
        setItems(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        showError(err, "Could not load your recurring donations.");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [customer, page, status, search, sortBy, sortOrder]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCancel = async (id: string) => {
    if (
      !confirm(
        "Cancel this recurring donation? Future charges will stop immediately.",
      )
    )
      return;
    setCancellingId(id);
    try {
      await recurringDonationsApi.cancel(id);
      showSuccess("Recurring donation cancelled");
      load();
    } catch (err) {
      showError(err);
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading || !customer)
    return <p className="p-16 text-center text-sm text-text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Recurring Donations
          </h2>
          <p className="text-sm text-text-muted">{total} total</p>
        </div>
        <Link
          href="/account"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to account
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <form
          onSubmit={runSearch}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
        >
          <Search size={14} className="text-text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search campaign or subscription ID"
            className="w-56 text-sm outline-none"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">All statuses</option>
          <option value="CREATED">Created</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="HALTED">Halted</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split("-");
            setSortBy(sb);
            setSortOrder(so as "asc" | "desc");
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="createdAt-desc">Latest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
          <option value="nextChargeDate-asc">Next payment date</option>
          <option value="status-asc">Status</option>
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-border/40"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-text-muted">
              No recurring donations found matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const statusInfo =
                STATUS_STYLES[r.status] || STATUS_STYLES.CREATED;
              const canCancel = !["CANCELLED", "COMPLETED"].includes(r.status);
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{r.campaign.title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {r.billing.donorName}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="font-heading font-semibold">
                      ₹{(r.amount / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="text-text-muted">
                      {r.frequency.charAt(0) +
                        r.frequency.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {r.nextChargeDate && r.status === "ACTIVE" && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      Next payment on{" "}
                      {new Date(r.nextChargeDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {r.status === "HALTED" && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                      Your bank declined the last charge. Please cancel and set
                      up a new recurring donation to continue supporting this
                      campaign.
                    </p>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      disabled={cancellingId === r.id}
                      className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === r.id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-text-muted">
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
      </div>
    </div>
  );
}
