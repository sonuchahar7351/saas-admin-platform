export function DonationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "text-emerald-600 bg-emerald-50",
    CREATED: "text-amber-600 bg-amber-50",
    FAILED: "text-red-600 bg-red-50",
    REFUNDED: "text-text-muted bg-bg",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.CREATED}`}
    >
      {status}
    </span>
  );
}
