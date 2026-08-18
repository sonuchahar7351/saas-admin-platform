"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useCustomerAuthStore } from "../../../store/customer-auth-store";
import { recurringDonationsApi } from "../../../lib/recurring-donations-api";

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
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !customer)
      router.push("/login?redirect=/account/recurring");
  }, [isLoading, customer]);

  const load = () => {
    if (!customer) return;
    setLoading(true);
    recurringDonationsApi.getMine().then(({ data }) => {
      setItems(data as any[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [customer]);

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
      load();
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading || !customer)
    return <p className="p-16 text-center text-sm text-text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold">
        Recurring donations
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Manage your ongoing support for campaigns.
      </p>

      <div className="mt-8">
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
              You don't have any recurring donations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const status = STATUS_STYLES[r.status] || STATUS_STYLES.CREATED;
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
                    <span className={`text-xs font-medium ${status.color}`}>
                      {status.label}
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
      </div>
    </div>
  );
}
