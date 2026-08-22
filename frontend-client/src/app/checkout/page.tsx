"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useCartStore } from "@/store/cart-store";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { donationsApi } from "@/lib/donations-api";
import { recurringDonationsApi } from "@/lib/recurring-donations-api";
import { Currency } from "lucide-react";
import { showError, showWarning } from "@/lib/toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { customer } = useCustomerAuthStore();
  const cart = useCartStore();
  const {
    campaignId,
    campaignTitle,
    isAddress,
    donationType,
    donationAmount,
    productCart,
    tipPresets,
    tipPercentage,
    tipAmount,
    grandTotal,
    setTipPercentage,
    clearCart,
  } = cart;

  const [donor, setDonor] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    pincode: "",
    city: "",
    state: "",
    streetAddress: "",
  });
  const [guestPassword, setGuestPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const baseAmount =
    donationType === "PRODUCT"
      ? productCart.reduce((s, p) => s + p.unitAmount * p.quantity, 0)
      : donationAmount;

  if (!campaignId || !donationType) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-text-muted">
          Your donation selection has expired or wasn't found.
        </p>
        <button
          onClick={() => router.push("/campaigns")}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Browse campaigns
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!donor.name || !donor.email || !donor.pincode) {
      showWarning("Please fill in your name, email, and pincode.");
      return;
    }
    if (isAddress && (!donor.city || !donor.state || !donor.streetAddress)) {
      showWarning("This campaign requires a full address.");
      return;
    }
    if (!customer && !guestPassword) {
      showWarning(
        "Please set a password to continue — this creates your donor account.",
      );
      return;
    }

    if (cart.isRecurring) {
      setSubmitting(true);
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Could not load payment gateway.");
          return;
        }

        const { data } = await recurringDonationsApi.setup({
          campaignId,
          frequency: cart.recurringFrequency,
          amount: donationAmount,
          tipPercentage,
          donor,
          guestPassword: customer ? undefined : guestPassword,
        });

        const options = {
          key: (data as any).keyId,
          subscription_id: (data as any).subscriptionId,
          name: campaignTitle,
          description: `${cart.recurringFrequency} recurring donation`,
          prefill: { name: donor.name, email: donor.email },
          theme: { color: "#059669" },
          handler: (response: any) => {
            console.log(response);
            clearCart();
            router.push(
              `/thank-you?recurringId=${(data as any).recurringDonationId}`,
            );
          },
          modal: { ondismiss: () => setSubmitting(false) },
        };
        new (window as any).Razorpay(options).open();
      } catch (err: any) {
        showError(err);
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment gateway.");
        return;
      }

      const { data } = await donationsApi.createOrder({
        campaignId: campaignId!,
        donationType,
        amount: baseAmount,
        tipAmount,
        ...(donationType === "PRODUCT" && {
          products: productCart.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        }),
        donor,
        guestPassword: customer ? undefined : guestPassword,
        message: message || undefined,
        isAnonymous,
      });

      const options = {
        key: (data as any).keyId,
        amount: (data as any).amount,
        currency: "INR",
        name: campaignTitle || "Donation",
        order_id: (data as any).orderId,
        prefill: { name: donor.name, email: donor.email },
        theme: { color: "#059669" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const res: any = await donationsApi.verifyDonation({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            router.push(`/thank-you?donationId=${(data as any).donationId}`);
          } catch (verifyErr: any) {
            setError(
              verifyErr.response?.data?.message ||
                "Payment succeeded but verification failed. Contact support with your payment ID.",
            );
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (resp: any) => {
        setError(
          resp.error?.description || "Payment failed. Please try again.",
        );
        setSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      showError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold">
        Complete your donation
      </h1>
      <p className="mt-1 text-sm text-text-muted">for {campaignTitle}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-medium">Donation summary</p>
          <div className="space-y-1.5 text-sm">
            {donationType === "AMOUNT" ? (
              <div className="flex justify-between">
                <span className="text-text-muted">Donation amount</span>
                <span>₹{baseAmount.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              productCart.map((p) => (
                <div key={p.productId} className="flex justify-between">
                  <span className="text-text-muted">
                    {p.title} × {p.quantity}
                  </span>
                  <span>
                    ₹{(p.unitAmount * p.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Tip</span>
              <span>₹{tipAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tipPresets.map((t) => (
              <button
                type="button"
                key={t.percentage}
                onClick={() => setTipPercentage(t.percentage)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${tipPercentage === t.percentage ? "bg-accent text-white" : "border border-border text-text-muted hover:bg-bg"}`}
              >
                {t.percentage}%
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-border pt-3">
            <span className="font-medium">Total payable</span>
            <span className="font-heading text-lg font-semibold">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-medium">Your details</p>
          <p className="mb-3 text-xs text-text-muted">
            Donating on behalf of someone else? Enter their details — they'll
            appear on the campaign's donor list.
          </p>
          <div className="space-y-3">
            <input
              placeholder="Full name"
              value={donor.name}
              onChange={(e) => setDonor({ ...donor, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={donor.email}
              onChange={(e) => setDonor({ ...donor, email: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
            <input
              placeholder="Pincode"
              value={donor.pincode}
              onChange={(e) => setDonor({ ...donor, pincode: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
              required
            />
            {isAddress && (
              <>
                <input
                  placeholder="City"
                  value={donor.city}
                  onChange={(e) => setDonor({ ...donor, city: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
                <input
                  placeholder="State"
                  value={donor.state}
                  onChange={(e) =>
                    setDonor({ ...donor, state: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
                <input
                  placeholder="Street address"
                  value={donor.streetAddress}
                  onChange={(e) =>
                    setDonor({ ...donor, streetAddress: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                  required
                />
              </>
            )}
            {!customer && (
              <input
                type="password"
                placeholder="Create a password (for your donor account)"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                required
              />
            )}
            <textarea
              placeholder="Leave a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Donate anonymously
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting
            ? "Processing…"
            : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
        </button>
      </form>
    </div>
  );
}
