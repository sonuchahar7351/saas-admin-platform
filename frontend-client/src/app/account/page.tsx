"use client";

import { useEffect, useState } from "react";
import { paymentsApi } from "../../lib/donations-api";
import { useCustomerAuthStore } from "../../store/customer-auth-store";

interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const customer = useCustomerAuthStore((s) => s.customer);

  useEffect(() => {
    paymentsApi
      .getMyPayments()
      .then(({ data }) => setPayments(data as PaymentRecord[]));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">Your account</h1>
      <p className="mt-1 text-sm text-text-muted">{customer?.email}</p>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-text-muted">
          Payment history
        </h2>
        <div className="rounded-xl border border-border bg-surface">
          {payments.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No payments yet.</p>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-border p-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{p.planName}</p>
                  <p className="font-mono text-xs text-text-muted">
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ₹{(p.amount / 100).toFixed(2)}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      p.status === "PAID"
                        ? "text-emerald-600"
                        : p.status === "FAILED"
                          ? "text-red-600"
                          : "text-amber-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
