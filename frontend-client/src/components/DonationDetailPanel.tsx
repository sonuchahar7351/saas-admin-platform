"use client";

import { X, Download } from "lucide-react";
import { DonationSummary } from "../lib/donations-api";

export function DonationDetailPanel({
  donation,
  onClose,
}: {
  donation: DonationSummary | null;
  onClose: () => void;
}) {
  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
      <div className="h-full w-full max-w-md overflow-y-auto bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-heading text-lg font-semibold">
            Donation details
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="font-heading text-sm font-semibold">
            {donation.campaignTitle}
          </p>

          <div className="mt-4 space-y-2 rounded-xl border border-border p-4 text-sm">
            {donation.donationType === "AMOUNT" ? (
              <div className="flex justify-between">
                <span className="text-text-muted">Donation amount</span>
                <span>₹{(donation.amount / 100).toLocaleString("en-IN")}</span>
              </div>
            ) : (
              donation.products.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-text-muted">
                    {p.title} × {p.quantity}
                  </span>
                  <span>₹{(p.amount / 100).toLocaleString("en-IN")}</span>
                </div>
              ))
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Tip</span>
              <span>₹{(donation.tipAmount / 100).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>
                ₹{(donation.totalAmount / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Donor</span>
              <span>{donation.donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <span>{donation.status}</span>
            </div>
            {donation.paymentId && (
              <div className="flex justify-between">
                <span className="text-text-muted">Payment ID</span>
                <span className="font-mono text-xs">{donation.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Date</span>
              <span>
                {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {donation.message && (
              <div className="mt-2 rounded-lg bg-bg p-3 text-xs italic text-text-muted">
                "{donation.message}"
              </div>
            )}
          </div>

          {donation.receiptUrl && (
            <a
              href={donation.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Download size={15} /> Download receipt
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
