export function DonationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string; bg: string }> = {
    PAID: { color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" },
    CREATED: { color: "#D97706", bg: "rgba(217, 119, 6, 0.12)" },
    FAILED: { color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)" },
    REFUNDED: { color: "var(--color-text-muted)", bg: "var(--color-bg)" },
  };
  const style = styles[status] || styles.CREATED;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {status}
    </span>
  );
}
