const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  CREATED: { color: "#6B7178", bg: "#F1F2F4" },
  ACTIVE: { color: "#0D9488", bg: "#EDFAF8" },
  COMPLETED: { color: "#4F46E5", bg: "#F0EFFE" },
  DELETED: { color: "#DC2626", bg: "#FDEDEC" },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.CREATED;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      {status}
    </span>
  );
}
