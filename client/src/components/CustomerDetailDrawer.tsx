"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { customersApi, CustomerHistoryResponse } from "../lib/customers-api";

export function CustomerDetailDrawer({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<CustomerHistoryResponse | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!customerId) return;
    setPage(1);
    customersApi
      .getDonationHistory(customerId, 1)
      .then(({ data }) => setData(data));
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    customersApi
      .getDonationHistory(customerId, page)
      .then(({ data }) => setData(data));
  }, [page]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-lg font-semibold">
            Donation history
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {!data ? (
          <p className="p-6 text-sm text-text-secondary">Loading…</p>
        ) : (
          <>
            <div className="border-b border-border px-6 py-4">
              <p className="font-medium">{data.customer.name}</p>
              <p className="text-sm text-text-secondary">
                {data.customer.email}
              </p>
            </div>

            <div className="divide-y divide-border">
              {data.donations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{d.campaignTitle}</p>
                    <p className="text-xs text-text-secondary">
                      {d.donorName} ·{" "}
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹
                      {((d.amount + d.tipAmount) / 100).toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`font-mono text-[10px] ${d.status === "PAID" ? "text-emerald-600" : "text-text-secondary"}`}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
              {data.donations.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-text-secondary">
                  No donations from this customer yet.
                </p>
              )}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 px-6 py-4 text-sm text-text-secondary">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-border px-2.5 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                  className="rounded-lg border border-border px-2.5 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
