"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { customerAuthApi } from "../../lib/customer-auth-api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  const token = useSearchParams().get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }
    try {
      await customerAuthApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "This link is invalid or has expired.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="font-heading text-xl font-semibold">
          Set a new password
        </h1>
        {done ? (
          <p className="mt-3 text-sm text-text-muted">
            Password updated. Redirecting to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
