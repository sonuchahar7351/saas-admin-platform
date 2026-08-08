"use client";

import { X } from "lucide-react";
import { DonationRecord } from "../lib/donations-admin-api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function TransactionDetailModal({
  donation,
  onClose,
}: {
  donation: DonationRecord | null;
  onClose: () => void;
}) {
  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Transaction detail
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-2">
          <Row label="Campaign" value={donation.campaign.title} />
          <Row
            label="Campaign slug"
            value={
              <span className="font-mono text-xs">
                {donation.campaign.slug}
              </span>
            }
          />
          <Row
            label="Donor"
            value={donation.isAnonymous ? "Anonymous" : donation.customer.name}
          />
          <Row
            label="Donor email"
            value={donation.isAnonymous ? "—" : donation.customer.email}
          />
          <Row
            label="User ID"
            value={
              <span className="font-mono text-xs">{donation.customer.id}</span>
            }
          />
          <Row
            label="Amount"
            value={`₹${(donation.amount / 100).toLocaleString("en-IN")}`}
          />
          <Row
            label="Tip amount"
            value={`₹${(donation.tipAmount / 100).toLocaleString("en-IN")}`}
          />
          <Row
            label="Payment ID"
            value={
              <span className="font-mono text-xs">
                {donation.razorpayPaymentId || "—"}
              </span>
            }
          />
          <Row
            label="Payment reference"
            value={
              <span className="font-mono text-xs">
                {donation.razorpayOrderId}
              </span>
            }
          />
          <Row label="Status" value={donation.status} />
          <Row
            label="Created"
            value={new Date(donation.createdAt).toLocaleString("en-IN")}
          />
          <Row label="Message" value={donation.message || "—"} />
        </div>

        {donation.paymentMetadata && (
          <div className="border-t border-border px-5 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
              Gateway response
            </p>
            <pre className="overflow-x-auto rounded-lg bg-bg p-3 font-mono text-[11px] text-text-secondary">
              {JSON.stringify(donation.paymentMetadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
