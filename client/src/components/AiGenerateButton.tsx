"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function AiGenerateButton({
  onGenerate,
  disabled,
}: {
  onGenerate: () => Promise<void>;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onGenerate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Sparkles size={13} />
      )}
      {loading ? "Generating…" : "Generate with AI"}
    </button>
  );
}
