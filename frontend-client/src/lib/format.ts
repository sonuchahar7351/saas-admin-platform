export function formatIndianCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1_00_00_000) return `₹${(rupees / 1_00_00_000).toFixed(1)}Cr+`;
  if (rupees >= 1_00_000) return `₹${(rupees / 1_00_000).toFixed(1)}L+`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K+`;
  return `₹${rupees.toFixed(0)}`;
}

export function formatCount(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr+`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}+`;
}
