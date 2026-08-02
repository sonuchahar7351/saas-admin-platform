const ACTION_STYLES: Record<string, { color: string; bg: string }> = {
  CREATE: { color: "#16A34A", bg: "#EEFBF1" },
  UPDATE: { color: "#D97706", bg: "#FEF6E9" },
  DELETE: { color: "#DC2626", bg: "#FDEDEC" },
};

export function ActionBadge({ action }: { action: string }) {
  const style = ACTION_STYLES[action] || { color: "#6B7178", bg: "#F1F2F4" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {action}
    </span>
  );
}
