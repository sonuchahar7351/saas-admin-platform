import { Check } from "lucide-react";
import { Plan } from "../config/plans";

export function PlanCard({
  plan,
  onSubscribe,
  loading,
}: {
  plan: Plan;
  onSubscribe: () => void;
  loading: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        plan.highlighted
          ? "border-accent bg-accent/3 shadow-sm"
          : "border-border bg-surface"
      }`}
    >
      {plan.highlighted && (
        <span className="mb-3 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-white">
          Most popular
        </span>
      )}
      <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-text-muted">{plan.description}</p>
      <p className="mt-4">
        <span className="font-heading text-3xl font-semibold">
          ₹{plan.price}
        </span>
        <span className="text-sm text-text-muted">{plan.period}</span>
      </p>

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check size={16} className="mt-0.5 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={loading}
        className={`mt-6 w-full rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
          plan.highlighted
            ? "bg-accent text-white hover:bg-accent-hover"
            : "border border-border hover:bg-bg"
        }`}
      >
        {loading ? "Processing…" : "Subscribe"}
      </button>
    </div>
  );
}
