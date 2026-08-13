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
} from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { customersApi, CustomerRecord } from "../../../lib/customers-api";
import { CustomerDetailDrawer } from "../../../components/CustomerDetailDrawer";

const columnHelper = createColumnHelper<CustomerRecord>();

function CustomersContent() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortBy = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, limit, sortBy, sortOrder, search],
    queryFn: () =>
      customersApi
        .getAll({ page, limit, sortBy, sortOrder, search: search || undefined })
        .then((r) => r.data),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Name", enableSorting: true }),
      columnHelper.accessor("email", { header: "Email", enableSorting: true }),
      columnHelper.accessor("totalDonationAmount", {
        header: "Total Donated",
        enableSorting: false, // aggregated field — see backend note on why this isn't server-sortable yet
        cell: (info) => `₹${(info.getValue() / 100).toLocaleString("en-IN")}`,
      }),
      columnHelper.accessor("totalTipAmount", {
        header: "Total Tip",
        enableSorting: false,
        cell: (info) => `₹${(info.getValue() / 100).toLocaleString("en-IN")}`,
      }),
      columnHelper.accessor("totalTransactions", {
        header: "Transactions",
        enableSorting: false,
      }),
      columnHelper.accessor("lastDonationAt", {
        header: "Last Donation",
        enableSorting: false,
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()!).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—",
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        enableSorting: true,
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
        cell: (info) => (
          <button
            onClick={() => setSelectedId(info.row.original.id)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-bg"
          >
            View
          </button>
        ),
      }),
    ],
    [],
  );

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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Customers
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {data?.total ?? 0} total
          </p>
        </div>
      </div>

      <form
        onSubmit={runSearch}
        className="mb-4 flex max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
      >
        <Search size={14} className="text-text-secondary" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email"
          className="w-full text-sm outline-none"
        />
      </form>

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
                  No customers found.
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

      <CustomerDetailDrawer
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <CustomersContent />
    </ProtectedRoute>
  );
}
