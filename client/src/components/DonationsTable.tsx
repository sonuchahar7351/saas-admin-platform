"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  RotateCcw,
  Eye,
} from "lucide-react";
import { donationsAdminApi, DonationRecord } from "../lib/donations-admin-api";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { useAuthStore } from "../store/auth-store";

const columnHelper = createColumnHelper<DonationRecord>();

export function DonationsTable({ campaignId }: { campaignId?: string }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDonation, setSelectedDonation] =
    useState<DonationRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);
  const canRefund = currentUser?.role === "SUPER_ADMIN";

  const sortBy = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "donations",
      campaignId,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      search,
      startDate,
      endDate,
    ],
    queryFn: () =>
      donationsAdminApi
        .getAll({
          page,
          limit,
          sortBy,
          sortOrder,
          status: status || undefined,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          ...(campaignId && { campaignId }),
        } as any)
        .then((r) => r.data),
  });

  const handleRefund = async (id: string) => {
    if (!confirm("Refund this donation? This cannot be undone.")) return;
    await donationsAdminApi.refund(id);
    setOpenMenuId(null);
    refetch();
  };

  const columns = useMemo(() => {
    const cols = [];

    // hide the campaign column entirely when scoped to a single campaign — it's implied by context
    if (!campaignId) {
      cols.push(
        columnHelper.accessor("campaign.slug", {
          header: "Campaign",
          cell: (info) => (
            <span className="font-mono text-xs">{info.getValue()}</span>
          ),
        }),
      );
    }

    cols.push(
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => `₹${(info.getValue() / 100).toLocaleString("en-IN")}`,
      }),
      columnHelper.accessor("tipAmount", {
        header: "Tip",
        cell: (info) => `₹${(info.getValue() / 100).toLocaleString("en-IN")}`,
      }),
      columnHelper.accessor(
        (row) => (row.isAnonymous ? "Anonymous" : row.customer.name),
        {
          id: "customer.name",
          header: "Donor",
        },
      ),
      columnHelper.accessor("razorpayPaymentId", {
        header: "Payment ID",
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const s = info.getValue();
          const color =
            s === "PAID"
              ? "text-emerald-600"
              : s === "FAILED"
                ? "text-red-600"
                : s === "REFUNDED"
                  ? "text-amber-600"
                  : "text-text-secondary";
          return (
            <span className={`font-mono text-[11px] font-medium ${color}`}>
              {s}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const donation = info.row.original;
          return (
            <div className="relative text-right">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === donation.id ? null : donation.id)
                }
                className="rounded-md p-1.5 hover:bg-bg"
              >
                <MoreVertical size={15} />
              </button>
              {openMenuId === donation.id && (
                <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedDonation(donation);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                  >
                    <Eye size={14} /> View details
                  </button>
                  {canRefund && donation.status === "PAID" && (
                    <button
                      onClick={() => handleRefund(donation.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <RotateCcw size={14} /> Refund
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        },
      }),
    );
    return cols;
  }, [openMenuId, canRefund, campaignId]);

  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form
          onSubmit={runSearch}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
        >
          <Search size={14} className="text-text-secondary" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              campaignId
                ? "Search name, email, payment ID"
                : "Search name, email, payment ID, campaign slug"
            }
            className="w-64 text-sm outline-none"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        >
          <option value="">All statuses</option>
          <option value="CREATED">Created</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        />
        <span className="text-sm text-text-secondary">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary"
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`px-5 py-3 font-medium ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUp size={12} />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDown size={12} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  Loading…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-bg"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>
            Page {page} of {data.totalPages} · {data.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <TransactionDetailModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
}
