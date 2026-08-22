"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  CheckCircle2,
  Download,
  XCircle,
} from "lucide-react";
import { eightyGApi, EightyGStatus } from "../lib/eighty-g-api";
import { showError, showSuccess } from "@/lib/toast";

export function EightyGSection({
  donationId,
  donorName,
  donorEmail,
}: {
  donationId: string;
  donorName: string;
  donorEmail: string;
}) {
  const [status, setStatus] = useState<EightyGStatus | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    panNumber: "",
    fullName: donorName,
    email: donorEmail,
    address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    eightyGApi.getStatus(donationId).then(({ data }) => setStatus(data));
  }, [donationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await eightyGApi.apply({
        donationId,
        ...form,
        panNumber: form.panNumber.toUpperCase(),
      });
      setStatus({ applied: true, status: "PENDING" });
      setShowForm(false);
      showSuccess("Application submitted — you'll be notified once reviewed.");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!status) return null;

  // Already applied — show status, no form
  if (status.applied) {
    return (
      <div className="rounded-xl border border-border bg-bg p-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText size={15} className="text-text-muted" />
          <span className="font-medium">80G Certificate</span>
        </div>
        {status.status === "PENDING" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
            <Loader2 size={12} className="animate-spin" /> Application under
            review
          </p>
        )}
        {status.status === "APPROVED" && status.certificateUrl && (
          <a
            href={status.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-2 text-xs font-medium text-white hover:bg-accent-hover"
          >
            <Download size={13} /> Download certificate
          </a>
        )}
        {status.status === "REJECTED" && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
            <XCircle size={12} className="mt-0.5 shrink-0" />{" "}
            {status.rejectionReason || "Application was not approved."}
          </p>
        )}
      </div>
    );
  }

  // Not applied yet
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex items-center gap-2 text-sm">
        <FileText size={15} className="text-text-muted" />
        <span className="font-medium">
          Need an 80G certificate for tax exemption?
        </span>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 w-full rounded-lg border border-accent py-2 text-xs font-medium text-accent hover:bg-accent/5"
        >
          Apply for 80G certificate
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
          {error && (
            <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
              {error}
            </p>
          )}
          <input
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-accent"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-accent"
            required
          />
          <input
            placeholder="PAN number (e.g. ABCDE1234F)"
            value={form.panNumber}
            onChange={(e) =>
              setForm({ ...form, panNumber: e.target.value.toUpperCase() })
            }
            maxLength={10}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs uppercase outline-none focus:border-accent"
            required
          />
          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-accent"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-border py-2 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-accent py-2 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
