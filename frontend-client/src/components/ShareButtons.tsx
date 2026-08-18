"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled — no action needed */
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-text-muted">Share:</span>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-border p-2 text-text-muted hover:border-accent hover:text-accent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.114 1.522 5.84L0 24l6.335-1.494A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.89 16.945c-.242.68-1.442 1.303-1.99 1.352-.548.049-1.06.246-3.567-.744-3.02-1.198-4.958-4.226-5.108-4.42-.15-.194-1.218-1.618-1.218-3.086 0-1.468.774-2.19 1.048-2.49.274-.3.598-.375.797-.375.199 0 .398.002.573.01.184.008.43-.07.673.514.243.585.826 2.02.9 2.166.075.147.125.32.025.514-.1.194-.15.32-.298.494-.15.174-.313.388-.448.522-.15.15-.306.313-.132.612.174.3.774 1.278 1.663 2.07 1.142 1.019 2.104 1.334 2.403 1.484.3.15.474.125.65-.075.174-.2.748-.874.949-1.174.2-.3.398-.25.673-.15.274.1 1.738.82 2.037.97.298.15.498.224.573.349.075.125.075.72-.166 1.4z" />
        </svg>
      </a>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-border p-2 text-text-muted hover:border-accent hover:text-accent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-border p-2 text-text-muted hover:border-accent hover:text-accent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <button
        onClick={handleCopy}
        className="rounded-full border border-border p-2 text-text-muted hover:border-accent hover:text-accent"
      >
        {copied ? (
          <Check size={14} className="text-accent" />
        ) : (
          <Copy size={14} />
        )}
      </button>
      {typeof navigator !== "undefined" && (navigator as any).share && (
        <button
          onClick={handleNativeShare}
          className="rounded-full border border-border p-2 text-text-muted hover:border-accent hover:text-accent sm:hidden"
        >
          <Share2 size={14} />
        </button>
      )}
    </div>
  );
}
