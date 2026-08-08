import { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  format = 'number',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  format?: 'currency' | 'number';
}) {
  const display =
    format === 'currency'
      ? `₹${(value / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : value.toLocaleString('en-IN');

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <Icon size={14} className="text-text-secondary" />
      </div>
      <p className="mt-2 font-display text-xl font-semibold">{display}</p>
    </div>
  );
}