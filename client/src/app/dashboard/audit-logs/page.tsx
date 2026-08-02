"use client";

import { useEffect, useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { auditLogsApi, AuditLogRecord } from "../../../lib/audit-logs-api";
import { aiApi } from "../../../lib/ai-api";
import { Avatar } from "../../../components/Avatar";
import { ActionBadge } from "../../../components/ActionBadge";

function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [resourceFilter, setResourceFilter] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const limit = 15;

  useEffect(() => {
    auditLogsApi
      .getAll({ resource: resourceFilter || undefined, page, limit })
      .then(({ data }) => {
        setLogs(data.data);
        setTotal(data.total);
      });
  }, [page, resourceFilter]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await aiApi.getAuditSummary();
      setSummary(data.summary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          A record of every change made across the platform.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">AI activity summary</p>
              <p className="mt-1 text-sm text-text-secondary">
                {summary ||
                  "Generate a plain-language summary of recent activity."}
              </p>
            </div>
          </div>
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-bg disabled:opacity-50"
          >
            {summaryLoading
              ? "Generating…"
              : summary
                ? "Regenerate"
                : "Generate"}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <select
          value={resourceFilter}
          onChange={(e) => {
            setResourceFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">All resources</option>
          <option value="users">Users</option>
          <option value="permissions">Permissions</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3 font-medium">Actor</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-border last:border-0 hover:bg-bg"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={log.user.name} />
                    <span className="font-medium">{log.user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                  {log.resource}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
        <span>
          Page {page} of {totalPages}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <AuditLogsContent />
    </ProtectedRoute>
  );
}
