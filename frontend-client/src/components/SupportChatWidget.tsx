"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supportChatApi, ChatTurn } from "../lib/support-chat-api";

const SUGGESTIONS = [
  "How do I donate?",
  "Is this secure?",
  "Can I get a tax receipt?",
];

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // only attach campaign context when actually on a campaign detail page
  const campaignSlugMatch = pathname.match(/^\/campaigns\/([^/]+)$/);
  const campaignSlug = campaignSlugMatch ? campaignSlugMatch[1] : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    try {
      // send only the last 6 turns — bounds token usage, recent context is what matters most
      const { data } = await supportChatApi.sendMessage(
        text,
        nextHistory.slice(-7, -1),
        campaignSlug,
      );
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that. Please try again or contact support.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="flex h-120 w-80 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-accent px-4 py-3">
            <p className="text-sm font-medium text-white">Support</p>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-text-muted">
                  Hi! Ask me anything about donating, receipts, or how the
                  platform works.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted hover:bg-bg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-accent text-white" : "bg-bg text-text"}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-bg px-3 py-2">
                  <Loader2 size={14} className="animate-spin text-text-muted" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="w-full rounded-full border border-border px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-accent p-2 text-white disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}
