"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerAuthApi } from "../../lib/customer-auth-api";
import { useCustomerAuthStore } from "../../store/customer-auth-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useCustomerAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await customerAuthApi.login(email, password);
      setAuth(data.customer, data.accessToken);
      router.push("/pricing");
    } catch {
      setError("That email or password doesn't match our records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Sign in to manage your subscription.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-accent hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
