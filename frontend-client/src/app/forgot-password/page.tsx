"use client";

import { useState } from "react";
import { customerAuthApi } from "../../lib/customer-auth-api";
import { showInfo } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerAuthApi.forgotPassword(email);
      showInfo("If an account exists for that email, we've sent a reset link.");
      setSent(true);
    } catch {
      showInfo("If an account exists for that email, we've sent a reset link.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="font-heading text-xl font-semibold">
          Reset your password
        </h1>
        {sent ? (
          <p className="mt-3 text-sm text-text-muted">
            If an account exists for that email, we've sent a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
