"use client";

import { useEffect, useState } from "react";
import { Sparkles, Minus, Plus, Check } from "lucide-react";
import { useCartStore } from "../../store/cart-store";
import { productsApi, PublicProduct } from "@/lib/product-api";

function QuantityStepper({
  value,
  onUpdate,
}: {
  value: number;
  onUpdate: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border h-7.5">
      <button
        type="button"
        onClick={() => onUpdate(value - 1)}
        className="p-1.5 text-text-muted hover:text-text"
      >
        <Minus size={13} />
      </button>
      <span className="w-5 text-center text-sm">{value}</span>
      <button
        type="button"
        onClick={() => onUpdate(value + 1)}
        className="p-1.5 text-text-muted hover:text-text"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function ProductCard({
  p,
  size,
  onAdd,
  onUpdate,
  cartQty,
}: {
  p: PublicProduct;
  size: "SMALL" | "MEDIUM" | "MEGA";
  onAdd: (qty: number) => void;
  onUpdate: (qty: number) => void;
  cartQty: number;
}) {
  if (size === "SMALL") {
    return (
      <div className="sm:float-left sm:w-[calc(50%-20px)] sm:m-2.5 m-0  w-full flex items-center gap-3 rounded-xl border border-border bg-surface p-3  h-30">
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{p.title}</p>
          <p className="text-xs text-text-muted">
            ₹{(p.amount / 100).toLocaleString("en-IN")}
          </p>
        </div>
        {cartQty <= 0 ? (
          <button
            onClick={() => onAdd(1)}
            className="shrink-0 rounded-lg border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 h-7.5"
          >
            Add
          </button>
        ) : (
          <QuantityStepper value={cartQty} onUpdate={onUpdate} />
        )}
      </div>
    );
  }

  if (size === "MEDIUM") {
    return (
      <div className="sm:float-left  sm:w-[calc(50%-20px)] sm:m-2.5 m-0 w-full overflow-hidden rounded-2xl border border-border bg-surface h-65">
        {p.imageUrl && (
          <img src={p.imageUrl} alt="" className="h-32 w-full object-cover" />
        )}
        <div className="p-4">
          <p className="font-heading text-sm font-semibold">{p.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-text-muted">
            {p.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-base font-semibold">
              ₹{(p.amount / 100).toLocaleString("en-IN")}
            </span>
            {cartQty <= 0 ? (
              <button
                onClick={() => onAdd(1)}
                className="shrink-0 rounded-lg border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5"
              >
                Add
              </button>
            ) : (
              <QuantityStepper value={cartQty} onUpdate={onUpdate} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-linear-to-br from-accent/5 to-transparent">
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium text-white">
        <Sparkles size={10} /> Mega impact
      </div>
      {p.imageUrl && (
        <img src={p.imageUrl} alt="" className="h-44 w-full object-cover" />
      )}
      <div className="p-5">
        <p className="font-heading text-lg font-semibold">{p.title}</p>
        <p className="mt-1 text-sm text-text-muted">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-heading text-xl font-semibold text-accent">
            ₹{(p.amount / 100).toLocaleString("en-IN")}
          </span>
          {cartQty <= 0 ? (
            <button
              onClick={() => onAdd(1)}
              className="shrink-0 rounded-lg border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 h-7.5"
            >
              Add
            </button>
          ) : (
            <QuantityStepper value={cartQty} onUpdate={onUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductsSection({ campaignId }: { campaignId: string }) {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const { productCart, addProduct, updateProductQuantity } = useCartStore();

  useEffect(() => {
    productsApi.getByCampaign(campaignId).then(({ data }) => setProducts(data));
  }, [campaignId]);

  if (products.length === 0) return null;

  const cartQtyFor = (productId: string) =>
    productCart.find((p) => p.productId === productId)?.quantity || 0;

  const handleAdd = (p: PublicProduct, qty: number) => {
    addProduct(
      {
        id: p.id,
        title: p.title,
        amount: p.amount / 100,
        imageUrl: p.imageUrl,
      },
      qty,
    );
  };

  const handleUpdate = (p: PublicProduct, qty: number) => {
    updateProductQuantity(p.id, qty);
  };

  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-semibold">Ways to help</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {products
          .filter((p) => p.type === "MEGA")
          .map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              size="MEGA"
              onUpdate={(qty) => handleUpdate(p, qty)}
              onAdd={(qty) => handleAdd(p, qty)}
              cartQty={cartQtyFor(p.id)}
            />
          ))}
      </div>
      <div className="relative my-4 flex flex-col gap-2 sm:block">
        {products
          .filter((p) => p.type === "MEDIUM")
          .map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              size="MEDIUM"
              onUpdate={(qty) => handleUpdate(p, qty)}
              onAdd={(qty) => handleAdd(p, qty)}
              cartQty={cartQtyFor(p.id)}
            />
          ))}

        {products
          .filter((p) => p.type === "SMALL")
          .map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              size="SMALL"
              onAdd={(qty) => handleAdd(p, qty)}
              onUpdate={(qty) => handleUpdate(p, qty)}
              cartQty={cartQtyFor(p.id)}
            />
          ))}
      </div>
    </div>
  );
}
