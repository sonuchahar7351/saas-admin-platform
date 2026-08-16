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
  Pause,
  Play,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import {
  recurringAdminApi,
  RecurringRecord,
} from "../../../lib/recurring-donations-admin-api";
import { RecurringStatusBadge } from "../../../components/RecurringStatusBadge";

const columnHelper = createColumnHelper<RecurringRecord>();

function ExportPanel({
  filters,
  selectedIds,
}: {
  filters: any;
  selectedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("100");
  const [error, setError] = useState("");

  const download = async (mode: "bulk" | "range" | "selected") => {
    setError("");
    if (mode === "selected" && selectedIds.length === 0) {
      setError("Select at least one row first.");
      return;
    }
    setLoading(true);
    try {
      const response = await recurringAdminApi.export({
        ...filters,
        mode,
        ...(mode === "range" && {
          rangeStart: Number(rangeStart),
          rangeEnd: Number(rangeEnd),
        }),
        ...(mode === "selected" && { selectedIds }),
      });
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `recurring-donations-${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? "You don't have permission to export."
          : "Export failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-bg"
      >
        <Download size={14} /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-72 rounded-lg border border-border bg-surface p-4 shadow-lg">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={() => download("bulk")}
            disabled={loading}
            className="w-full rounded-lg border border-border py-2 text-sm hover:bg-bg disabled:opacity-50"
          >
            Download all filtered results
          </button>
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-text-secondary">
              Download by range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm outline-none"
              />
              <span className="text-xs text-text-secondary">to</span>
              <input
                type="number"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm outline-none"
              />
              <button
                onClick={() => download("range")}
                disabled={loading}
                className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Go
              </button>
            </div>
          </div>
          <button
            onClick={() => download("selected")}
            disabled={loading || selectedIds.length === 0}
            className="mt-3 w-full rounded-lg border border-border py-2 text-sm hover:bg-bg disabled:opacity-40"
          >
            Download selected ({selectedIds.length})
          </button>
          {loading && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
              <Loader2 size={12} className="animate-spin" /> Generating file…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RecurringDonationsContent() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [frequency, setFrequency] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const sortBy = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "recurring",
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      frequency,
      search,
    ],
    queryFn: () =>
      recurringAdminApi
        .getAll({
          page,
          limit,
          sortBy,
          sortOrder,
          status: status || undefined,
          frequency: frequency || undefined,
          search: search || undefined,
        })
        .then((r) => r.data),
  });

  const handlePause = async (id: string) => {
    await recurringAdminApi.pause(id);
    setOpenMenuId(null);
    refetch();
  };
  const handleResume = async (id: string) => {
    await recurringAdminApi.resume(id);
    setOpenMenuId(null);
    refetch();
  };
  const handleCancel = async (id: string) => {
    if (
      !confirm(
        "Cancel this recurring donation? This stops future charges immediately.",
      )
    )
      return;
    await recurringAdminApi.cancel(id);
    setOpenMenuId(null);
    refetch();
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),

      columnHelper.accessor("campaign.title", { header: "Campaign" }),
      columnHelper.accessor((r) => r.billing.donorName, {
        id: "donorName",
        header: "Donor",
      }),
      columnHelper.accessor("amount", {
        header: "Amount / cycle",
        cell: (info) => `₹${(info.getValue() / 100).toLocaleString("en-IN")}`,
      }),
      columnHelper.accessor("frequency", {
        header: "Frequency",
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <RecurringStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Started",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const r = info.row.original;
          return (
            <div className="relative text-right">
              <button
                onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                className="rounded-md p-1.5 hover:bg-bg"
              >
                <MoreVertical size={15} />
              </button>
              {openMenuId === r.id && (
                <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg">
                  {r.status === "ACTIVE" && (
                    <button
                      onClick={() => handlePause(r.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  )}
                  {r.status === "PAUSED" && (
                    <button
                      onClick={() => handleResume(r.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                    >
                      <Play size={14} /> Resume
                    </button>
                  )}
                  {!["CANCELLED", "COMPLETED"].includes(r.status) && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    [openMenuId],
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    enableRowSelection: true,
  });

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Recurring Donations
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {data?.total ?? 0} total
          </p>
        </div>
        <ExportPanel
          filters={{
            status: status || undefined,
            frequency: frequency || undefined,
            search: search || undefined,
          }}
          selectedIds={
            Object.keys(rowSelection)
              .map((idx) => data?.data[Number(idx)]?.id)
              .filter(Boolean) as string[]
          }
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form
          onSubmit={runSearch}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
        >
          <Search size={14} className="text-text-secondary" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search donor, campaign, subscription ID"
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
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="HALTED">Halted</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        >
          <option value="">All frequencies</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
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
                    No recurring donations found.
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
    </div>
  );
}

export default function RecurringDonationsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <RecurringDonationsContent />
    </ProtectedRoute>
  );
}
