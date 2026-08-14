"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { donationsAdminApi } from "../lib/donations-admin-api";

export function ExportPanel({
  filters,
  selectedIds,
}: {
  filters: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    campaignId?: string;
  };
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
      const response = await donationsAdminApi.export({
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
      link.download = `donations-export-${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? "You don't have permission to export."
          : "Export failed. Try again.",
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
