"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How can I donate?",
    a: 'Browse any active campaign and click "Donate now." You can choose a preset amount or enter a custom one, then complete payment securely.',
  },
  {
    q: "Do I need an account to donate?",
    a: "No. You can donate as a guest — an account is created automatically using your email so you can track your donation history later.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant gateway. We never store your card details.",
  },
  {
    q: "Can I donate on behalf of someone else?",
    a: "Yes. During checkout you can enter different donor details than your account — the campaign will show the donor name you provide.",
  },
  {
    q: "Where can I see my donations?",
    a: "Log in and visit your Profile page to see your complete donation history and receipts.",
  },
  {
    q: "Will I receive a donation receipt?",
    a: "Yes, a receipt is generated automatically after every successful donation and can be downloaded as a PDF from your profile.",
  },
  {
    q: "Can I donate to multiple campaigns?",
    a: "Yes, there is no limit — you can support as many campaigns as you like.",
  },
  {
    q: "How do I know how much a campaign has raised?",
    a: "Every campaign page shows a live progress bar with the amount raised against its goal.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="my-20">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Frequently asked questions
        </h2>
      </div>
      <div className="mx-auto max-w-6xl divide-y divide-border rounded-2xl border border-border bg-surface">
        {FAQS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
            >
              {item.q}
              <ChevronDown
                size={16}
                className={`shrink-0 text-text-muted transition-transform ${openIndex === i ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: openIndex === i ? "200px" : "0px" }}
            >
              <p className="px-5 pb-4 text-sm text-text-muted">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
