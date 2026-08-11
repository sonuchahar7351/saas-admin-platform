"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/cart-store";
import { PublicCampaign } from "@/lib/campaigs-api";

export function DonationSelector({ campaign }: { campaign: PublicCampaign }) {
  const router = useRouter();
  const { setDonationAmount, baseAmount, productCart } = useCartStore();
  const [customAmount, setCustomAmount] = useState("");

  const defaultPreset =
    campaign.donationPresets.find((p) => p.isDefault)?.amount ||
    campaign.donationPresets[0]?.amount ||
    0;

  const pick = (amount: number) => {
    setCustomAmount(amount.toString());
    setDonationAmount(amount);
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    if (val) setDonationAmount(Number(val));
  };

  const isSelected = (amount: number) => baseAmount === amount;

  useEffect(() => {
    if (productCart.length == 0) {
      pick(defaultPreset);
    }
  }, [productCart.length]);

  useEffect(() => {
    if (baseAmount >= 0) {
      setCustomAmount(baseAmount.toString());
    }
  }, [baseAmount]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold">
        Donate to this campaign
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {campaign.donationPresets.map((p) => (
          <button
            key={p.amount}
            onClick={() => pick(p.amount)}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
              isSelected(p.amount)
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
        onChange={(e) => handleCustomChange(e.target.value)}
        placeholder="Or enter a custom amount"
        className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={() => router.push("/checkout")}
        disabled={baseAmount < 1}
        className="mt-4 w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        Donate {`₹${baseAmount.toLocaleString("en-IN")}`}
      </button>
    </div>
  );
}
