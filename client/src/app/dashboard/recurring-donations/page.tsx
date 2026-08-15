"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { apiClient } from "../../../lib/api-client";

export default function RecurringDonationsAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  const load = () =>
    apiClient
      .get("/recurring-donations", {
        params: { status: status || undefined, limit: 20 },
      })
      .then(({ data }) => setItems((data as any).data));
  useEffect(() => {
    load();
  }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    await apiClient.patch(`/recurring-donations/${id}/status`, {
      status: newStatus,
    });
    load();
  };

  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight">
        Recurring Donations
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        Trial/demo mode — no real charges are processed yet.
      </p>

      <div className="mb-4 flex gap-2">
        {["", "TRIAL", "PENDING_ACTIVATION", "PAUSED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${status === s ? "bg-accent text-white" : "border border-border"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3 font-medium">Campaign</th>
              <th className="px-5 py-3 font-medium">Donor</th>
              <th className="px-5 py-3 font-medium">Amount / cycle</th>
              <th className="px-5 py-3 font-medium">Frequency</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Trial ends</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{r.campaign.title}</td>
                <td className="px-5 py-3">{r.billing.donorName}</td>
                <td className="px-5 py-3">
                  ₹{(r.amount / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{r.frequency}</td>
                <td className="px-5 py-3 font-mono text-xs">{r.status}</td>
                <td className="px-5 py-3 text-xs text-text-secondary">
                  {new Date(r.trialEndsAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-5 py-3">
                  {r.status !== "CANCELLED" && (
                    <div className="flex gap-1">
                      {r.status !== "PAUSED" && (
                        <button
                          onClick={() => updateStatus(r.id, "PAUSED")}
                          className="rounded-md border border-border px-2 py-1 text-xs"
                        >
                          Pause
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(r.id, "CANCELLED")}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  No recurring donations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
