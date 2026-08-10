"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { donationsApi } from "../lib/donations-api";
import { loadRazorpayScript } from "../lib/load-razorpay";
import { useCustomerAuthStore } from "../store/customer-auth-store";
import { PublicCampaign } from "@/lib/campaigs-api";

export function DonationForm({ campaign }: { campaign: PublicCampaign }) {
  const [selectedAmount, setSelectedAmount] = useState(
    campaign.donationPresets.find((p) => p.isDefault)?.amount ||
      campaign.donationPresets[0]?.amount ||
      0,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(
    campaign.tipPresets.find((p) => p.isDefault)?.percentage || 0,
  );
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { customer } = useCustomerAuthStore();

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
  const tipValue = Math.round((finalAmount * tipPercent) / 100);
  const total = finalAmount + tipValue;

  // const handleDonate = async () => {
  //   if (!customer) {
  //     router.push(`/login?redirect=/campaigns/${campaign.slug}`);
  //     return;
  //   }
  //   if (!finalAmount || finalAmount < 1) {
  //     setError("Enter a valid donation amount.");
  //     return;
  //   }
  //   setError("");
  //   setLoading(true);
  //   try {
  //     const scriptLoaded = await loadRazorpayScript();
  //     if (!scriptLoaded) {
  //       setError("Could not load payment gateway. Try again.");
  //       return;
  //     }

  //     const { data } = await donationsApi.createOrder({
  //       campaignId: campaign.id,
  //       amount: finalAmount,
  //       tipAmount: tipValue,
  //       message: message || undefined,
  //       isAnonymous,
  //       donationType: "AMOUNT",
  //       donor: {
  //         name: customer.name,
  //         email: customer.email,
  //         pincode: "283119",
  //       },
  //     });

  //     const options = {
  //       key: (data as any).keyId,
  //       amount: (data as any).amount,
  //       currency: "INR",
  //       name: campaign.title,
  //       description: "Donation",
  //       order_id: (data as any).orderId,
  //       prefill: { name: customer.name, email: customer.email },
  //       theme: { color: "#059669" },
  //       handler: () => {},
  //       modal: { ondismiss: () => setLoading(false) },
  //     };

  //     new (window as any).Razorpay(options).open();
  //   } catch (err: any) {
  //     setError(err.response?.data?.message || "Could not start checkout.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDonate = async () => {
    if (!customer) {
      router.push(`/login?redirect=/campaigns/${campaign.slug}`);
      return;
    }
    if (!finalAmount || finalAmount < 1) {
      setError("Enter a valid donation amount.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment gateway. Try again.");
        setLoading(false);
        return;
      }

      const { data } = await donationsApi.createOrder({
        campaignId: campaign.id,
        amount: finalAmount,
        tipAmount: tipValue,
        message: message || undefined,
        isAnonymous,
        donationType: "AMOUNT",
        donor: {
          name: customer.name,
          email: customer.email,
          pincode: "283119",
        },
      });

      const options = {
        key: (data as any).keyId,
        amount: (data as any).amount,
        currency: "INR",
        name: campaign.title,
        description: "Donation",
        order_id: (data as any).orderId,
        prefill: { name: customer.name, email: customer.email },
        theme: { color: "#059669" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await donationsApi.verifyDonation({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // success — e.g. redirect to a thank-you page or show a success state
            router.push(`/campaigns/${campaign.slug}?donation=success`);
          } catch (verifyErr: any) {
            setError(
              verifyErr.response?.data?.message ||
                "Payment succeeded but verification failed. Contact support with your payment ID.",
            );
          } finally {
            setLoading(false);
          }
        },
        // handler: () => router.push('/account?donation=processing'),
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (resp: any) => {
        setError(
          resp.error?.description || "Payment failed. Please try again.",
        );
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not start checkout.");
      setLoading(false);
    }
    // no top-level finally — loading is now controlled by handler/ondismiss/payment.failed
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold">
        Donate to this campaign
      </h3>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Choose an amount</p>
        <div className="grid grid-cols-3 gap-2">
          {campaign.donationPresets.map((p) => (
            <button
              key={p.amount}
              onClick={() => {
                setSelectedAmount(p.amount);
                setCustomAmount("");
              }}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                !customAmount && selectedAmount === p.amount
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:bg-bg"
              }`}
            >
              ₹{p.amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Or enter a custom amount"
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">
          Add a tip to support the platform
        </p>
        <div className="grid grid-cols-3 gap-2">
          {campaign.tipPresets.map((p) => (
            <button
              key={p.percentage}
              onClick={() => setTipPercent(p.percentage)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                tipPercent === p.percentage
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:bg-bg"
              }`}
            >
              {p.percentage}%
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Leave a message (optional)"
        rows={2}
        className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Donate anonymously
      </label>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-text-muted">Total</span>
        <span className="font-heading text-lg font-semibold">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        onClick={handleDonate}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Processing…" : "Donate now"}
      </button>
    </div>
  );
}
