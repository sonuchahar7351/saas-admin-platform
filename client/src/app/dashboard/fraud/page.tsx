"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Sparkles } from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { apiClient } from "../../../lib/api-client";

const SEVERITY_STYLES: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "#DC2626", bg: "#FDEDEC" },
  MEDIUM: { color: "#D97706", bg: "#FEF6E9" },
  LOW: { color: "#6B7178", bg: "#F1F2F4" },
};

function FraudContent() {
  const [flags, setFlags] = useState<any[]>([]);
  const [severity, setSeverity] = useState("");
  const [showReviewed, setShowReviewed] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplain, setLoadingExplain] = useState<string | null>(null);

  const load = () =>
    apiClient
      .get("/donations/fraud-flags", {
        params: {
          severity: severity || undefined,
          reviewed: showReviewed ? undefined : false,
          limit: 30,
        },
      })
      .then(({ data }) => setFlags((data as any).data));

  useEffect(() => {
    load();
  }, [severity, showReviewed]);

  const handleReview = async (id: string) => {
    await apiClient.patch(`/donations/fraud-flags/${id}/review`);
    load();
  };

  const handleExplain = async (id: string) => {
    setLoadingExplain(id);
    try {
      const { data } = await apiClient.get(
        `/donations/fraud-flags/${id}/explain`,
      );
      setExplanations((e) => ({ ...e, [id]: (data as any).explanation }));
    } finally {
      setLoadingExplain(null);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert size={22} className="text-red-600" />
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Fraud Flags
        </h1>
      </div>
      <p className="mb-6 text-sm text-text-secondary">
        Rule-based flags for review. Nothing here is auto-blocked — every
        donation still processes normally.
      </p>

      <div className="mb-4 flex gap-2">
        {["", "HIGH", "MEDIUM", "LOW"].map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${severity === s ? "bg-accent text-white" : "border border-border"}`}
          >
            {s || "All"}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={showReviewed}
            onChange={(e) => setShowReviewed(e.target.checked)}
          />{" "}
          Show reviewed
        </label>
      </div>

      <div className="space-y-3">
        {flags.map((f) => {
          const style = SEVERITY_STYLES[f.severity];
          return (
            <div
              key={f.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[11px] font-medium"
                      style={{ color: style.color, backgroundColor: style.bg }}
                    >
                      {f.severity}
                    </span>
                    <span className="font-mono text-xs text-text-secondary">
                      {f.ruleCode}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">
                    {f.donation.billing.donorName} — {f.donation.campaign.title}
                  </p>
                  <p className="text-xs text-text-secondary">
                    ₹{(f.donation.amount / 100).toLocaleString("en-IN")} ·{" "}
                    {new Date(f.createdAt).toLocaleString("en-IN")}
                  </p>
                  <pre className="mt-2 rounded-lg bg-bg p-2 font-mono text-[11px] text-text-secondary">
                    {JSON.stringify(f.details)}
                  </pre>

                  {explanations[f.id] && (
                    <p className="mt-2 rounded-lg border border-accent/20 bg-accent/5 p-2.5 text-xs">
                      {explanations[f.id]}
                    </p>
                  )}
                </div>
                {!f.reviewed && (
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button
                      onClick={() => handleExplain(f.id)}
                      disabled={loadingExplain === f.id}
                      className="flex items-center gap-1 rounded-lg border border-accent/30 px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 disabled:opacity-50"
                    >
                      <Sparkles size={12} />{" "}
                      {loadingExplain === f.id ? "…" : "Explain"}
                    </button>
                    <button
                      onClick={() => handleReview(f.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-bg"
                    >
                      Mark reviewed
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {flags.length === 0 && (
          <p className="py-10 text-center text-sm text-text-secondary">
            No flags to show.
          </p>
        )}
      </div>
    </div>
  );
}

export default function FraudPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"]}>
      <FraudContent />
    </ProtectedRoute>
  );
}
