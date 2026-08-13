"use client";

import { useEffect, useState, useRef } from "react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { eightyGAdminApi } from "../../../lib/eighty-g-admin-api";

export default function EightyGAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("PENDING");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = () =>
    eightyGAdminApi
      .getAll(1, 20, status)
      .then(({ data }) => setItems((data as any).data));
  useEffect(() => {
    load();
  }, [status]);

  const handleApprove = async (id: string) => {
    const file = fileInputRefs.current[id]?.files?.[0];
    if (!file) {
      alert("Select a certificate PDF first.");
      return;
    }
    await eightyGAdminApi.approve(id, file);
    load();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    await eightyGAdminApi.reject(id, reason);
    load();
  };

  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">
        80G Applications
      </h1>
      <div className="mb-4 flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? "bg-accent text-white" : "border border-border"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((app) => (
          <div
            key={app.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-sm font-medium">
              {app.fullName} — {app.donation.campaign.title}
            </p>
            <p className="text-xs text-text-secondary">
              {app.email} · PAN: {app.panNumber}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{app.address}</p>
            {status === "PENDING" && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  ref={(el) => {
                    fileInputRefs.current[app.id] = el;
                  }}
                  className="text-xs"
                />
                <button
                  onClick={() => handleApprove(app.id)}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(app.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-text-secondary">
            No {status.toLowerCase()} applications.
          </p>
        )}
      </div>
    </ProtectedRoute>
  );
}
