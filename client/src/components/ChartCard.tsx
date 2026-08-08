export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-3 text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}
