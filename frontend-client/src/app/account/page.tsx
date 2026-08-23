"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Search } from "lucide-react";
import { useCustomerAuthStore } from "../../store/customer-auth-store";
import { customerAuthApi } from "../../lib/customer-auth-api";
import {
  myDonationsApi,
  DonationListItem,
  DonationSummary,
} from "../../lib/donations-api";
import { DonationStatusBadge } from "../../components/DonationStatusBadge";
import { DonationDetailPanel } from "../../components/DonationDetailPanel";
import Link from "next/link";
import { showError } from "@/lib/toast";

export default function AccountPage() {
  const { customer, clearAuth, isLoading } = useCustomerAuthStore();
  const router = useRouter();
  const [donations, setDonations] = useState<DonationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<DonationSummary | null>(null);

  useEffect(() => {
    if (!isLoading && !customer) router.push("/login?redirect=/account");
  }, [isLoading, customer]);

  useEffect(() => {
    if (!customer) return;
    setLoading(true);
    myDonationsApi
      .getAll({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
      })
      .then(({ data }) => {
        setDonations(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        showError(err, "Could not load your donations.");
        setLoading(false);
      });
  }, [customer, page, status, search, sortBy, sortOrder]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openDetail = async (id: string) => {
    const { data } = await myDonationsApi.getById(id);
    setSelected(data);
  };

  const handleLogout = async () => {
    await customerAuthApi.logout();
    clearAuth();
    router.push("/");
  };

  if (isLoading || !customer)
    return <p className="p-16 text-center text-sm text-text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Profile card */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <User size={22} />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">
              {customer.name}
            </p>
            <p className="text-sm text-text-muted">{customer.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-bg"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Donation history */}
      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-lg font-semibold">
            Donation history
          </h2>
          <p className="text-sm text-text-muted">{total} total</p>
          <Link
            href="/account/recurring"
            className="text-sm font-medium text-accent hover:underline"
          >
            Manage recurring donations
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-border/40"
              />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-text-muted">
              You haven't made any donations yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <form
                onSubmit={runSearch}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
              >
                <Search size={14} className="text-text-muted" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search campaign, payment ID"
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
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
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
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {donations.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDetail(d.id)}
                  className="flex w-full items-center justify-between border-b border-border p-4 text-left last:border-0 hover:bg-bg"
                >
                  <div>
                    <p className="text-sm font-medium">{d.campaignTitle}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {d.donorName} ·{" "}
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{(d.totalAmount / 100).toLocaleString("en-IN")}
                    </p>
                    <div className="mt-0.5">
                      <DonationStatusBadge status={d.status} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
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

      <DonationDetailPanel
        donation={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
