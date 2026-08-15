import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartProductItem {
  productId: string;
  title: string;
  unitAmount: number; // rupees
  quantity: number;
  imageUrl?: string | null;
}

interface TipPreset {
  percentage: number;
  isDefault: boolean;
}

interface CartState {
  campaignId: string | null;
  campaignSlug: string | null;
  campaignTitle: string | null;
  tipPresets: TipPreset[];
  isAddress: boolean;

  donationType: "AMOUNT" | "PRODUCT" | null;
  donationAmount: number; // rupees — 0 whenever donationType is PRODUCT
  productCart: CartProductItem[]; // empty whenever donationType is AMOUNT

  tipPercentage: number;
  tipAmount: number;
  grandTotal: number;

  baseAmount: number;

  isRecurring: boolean;
  recurringFrequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | null;
  toggleRecurring: (on: boolean) => void;
  setRecurringFrequency: (freq: "WEEKLY" | "MONTHLY" | "QUARTERLY") => void;

  initCampaign: (info: {
    id: string;
    slug: string;
    title: string;
    tipPresets: TipPreset[];
    isAddress: boolean;
  }) => void;
  setDonationAmount: (amount: number) => void;
  addProduct: (
    product: {
      id: string;
      title: string;
      amount: number;
      imageUrl?: string | null;
    },
    quantity: number,
  ) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  setTipPercentage: (pct: number) => void;
  clearCart: () => void;
}

function computeTotals(
  donationAmount: number,
  productCart: CartProductItem[],
  tipPercentage: number,
) {
  const baseAmount =
    productCart.length > 0
      ? productCart.reduce((sum, p) => sum + p.unitAmount * p.quantity, 0)
      : donationAmount;
  const tipAmount = Math.round((baseAmount * tipPercentage) / 100);
  return { baseAmount, tipAmount, grandTotal: baseAmount + tipAmount };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      campaignId: null,
      campaignSlug: null,
      campaignTitle: null,
      tipPresets: [],
      isAddress: false,
      donationType: null,
      donationAmount: 0,
      productCart: [],
      tipPercentage: 0,
      tipAmount: 0,
      grandTotal: 0,
      productPrice: 0,
      baseAmount: 0,
      isRecurring: false,
      recurringFrequency: null,

      initCampaign: (info) => {
        const current = get();
        // switching to a different campaign resets the cart entirely — a cart from
        // Campaign A should never leak into a donation for Campaign B
        if (current.campaignId === info.id) {
          set({
            campaignSlug: info.slug,
            campaignTitle: info.title,
            tipPresets: info.tipPresets,
            isAddress: info.isAddress,
          });
          return;
        }
        const defaultTip =
          info.tipPresets.find((t) => t.isDefault)?.percentage || 0;
        set({
          campaignId: info.id,
          campaignSlug: info.slug,
          campaignTitle: info.title,
          tipPresets: info.tipPresets,
          isAddress: info.isAddress,
          donationType: null,
          donationAmount: 0,
          productCart: [],
          tipPercentage: defaultTip,
          tipAmount: 0,
          grandTotal: 0,
          baseAmount: 0,
        });
      },

      setDonationAmount: (amount) => {
        const { tipPercentage } = get();
        const { tipAmount, grandTotal, baseAmount } = computeTotals(
          amount,
          [],
          tipPercentage,
        );
        // selecting/entering an amount always clears the product cart — mutual exclusivity
        set({
          donationType: "AMOUNT",
          donationAmount: amount,
          productCart: [],
          tipAmount,
          grandTotal,
          baseAmount,
        });
      },

      addProduct: (product, quantity) => {
        const { productCart, tipPercentage } = get();
        const existing = productCart.find((p) => p.productId === product.id);
        const nextCart = existing
          ? productCart.map((p) =>
              p.productId === product.id
                ? { ...p, quantity: p.quantity + quantity }
                : p,
            )
          : [
              ...productCart,
              {
                productId: product.id,
                title: product.title,
                unitAmount: product.amount,
                quantity,
                imageUrl: product.imageUrl,
              },
            ];
        const { tipAmount, grandTotal, baseAmount } = computeTotals(
          0,
          nextCart,
          tipPercentage,
        );
        // adding a product always zeroes the amount — mutual exclusivity, the other direction
        set({
          donationType: "PRODUCT",
          donationAmount: 0,
          productCart: nextCart,
          tipAmount,
          grandTotal,
          baseAmount,
        });
      },

      updateProductQuantity: (productId, quantity) => {
        const { productCart, tipPercentage } = get();
        const nextCart =
          quantity <= 0
            ? productCart.filter((p) => p.productId !== productId)
            : productCart.map((p) =>
                p.productId === productId ? { ...p, quantity } : p,
              );
        const { tipAmount, grandTotal, baseAmount } = computeTotals(
          0,
          nextCart,
          tipPercentage,
        );
        set({
          productCart: nextCart,
          donationType: nextCart.length > 0 ? "PRODUCT" : null,
          tipAmount,
          grandTotal,
          baseAmount,
        });
      },

      removeProduct: (productId) => get().updateProductQuantity(productId, 0),

      setTipPercentage: (pct) => {
        const { donationAmount, productCart } = get();
        const { tipAmount, grandTotal } = computeTotals(
          donationAmount,
          productCart,
          pct,
        );
        set({ tipPercentage: pct, tipAmount, grandTotal });
      },

      toggleRecurring: (on) =>
        set({ isRecurring: on, recurringFrequency: on ? "MONTHLY" : null }),
      setRecurringFrequency: (recurringFrequency) =>
        set({ recurringFrequency }),

      clearCart: () =>
        set({
          donationType: null,
          donationAmount: 0,
          productCart: [],
          tipAmount: 0,
          grandTotal: 0,
        }),
    }),
    { name: "donation-cart", storage: createJSONStorage(() => sessionStorage) },
  ),
);
