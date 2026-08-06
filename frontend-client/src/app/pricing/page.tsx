"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { plans } from "../../config/plans";
import { PlanCard } from "../../components/PlanCard";
import { paymentsApi } from "../../lib/payments-api";
import { loadRazorpayScript } from "../../lib/load-razorpay";
import { useCustomerAuthStore } from "../../store/customer-auth-store";

export default function PricingPage() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { customer, isLoading } = useCustomerAuthStore();

  const handleSubscribe = async (
    planId: string,
    amount: number,
    planName: string,
  ) => {
    if (!customer) {
      router.push("/login");
      return;
    }
    setError("");
    setLoadingPlanId(planId);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError(
          "Could not load payment gateway. Check your connection and try again.",
        );
        return;
      }

      const { data } = await paymentsApi.createOrder(amount, planName);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "SaaS Admin Platform",
        description: `${planName} plan subscription`,
        order_id: data.orderId,
        prefill: { name: customer.name, email: customer.email },
        theme: { color: "#059669" },
        handler: () => {
          // Client-side callback = good for UX only.
          // The webhook is what actually confirms payment server-side.
          router.push("/account?payment=processing");
        },
        modal: {
          ondismiss: () => setLoadingPlanId(null),
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Could not start checkout. Try again.",
      );
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-3xl font-semibold">
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-text-muted">
          Choose the plan that fits your team. Cancel anytime.
        </p>
      </div>

      {error && (
        <p className="mx-auto mb-6 max-w-md rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            loading={loadingPlanId === plan.id}
            onSubscribe={() => handleSubscribe(plan.id, plan.price, plan.name)}
          />
        ))}
      </div>
    </div>
  );
}
