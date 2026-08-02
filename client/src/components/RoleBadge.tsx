const ROLE_STYLES: Record<string, { var: string; bg: string }> = {
  SUPER_ADMIN: { var: "var(--color-role-super)", bg: "#F3F0FE" },
  SUB_ADMIN: { var: "var(--color-role-sub)", bg: "#FEF6E9" },
  ADMIN: { var: "var(--color-role-admin)", bg: "#EDFAF8" },
};

export function RoleBadge({
  role,
  variant = "light",
}: {
  role: string;
  variant?: "light" | "dark";
}) {
  const style = ROLE_STYLES[role] || {
    var: "var(--color-text-secondary)",
    bg: "#F1F2F4",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide"
      style={
        variant === "dark"
          ? { color: style.var, backgroundColor: "rgba(255,255,255,0.06)" }
          : { color: style.var, backgroundColor: style.bg }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.var }}
      />
      {role}
    </span>
  );
}
