import { GitBranch } from "lucide-react";

export function MorphBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-medium text-purple-600">
      <GitBranch size={10} /> MORPH
    </span>
  );
}
