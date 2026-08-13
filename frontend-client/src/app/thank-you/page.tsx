"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Heart,
  Share2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { donationsSummaryApi, DonationSummary } from "../../lib/donations-api";
import { EightyGSection } from "@/components/EightyGSection";

export default function ThankYouPage() {
  const donationId = useSearchParams().get("donationId");
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [confirming, setConfirming] = useState(true);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!donationId) return;

    const poll = async () => {
      const { data } = await donationsSummaryApi.get(donationId);
      setSummary(data);

      // webhook may not have landed yet — poll a few times while status is CREATED
      if (data.status === "CREATED" && attemptsRef.current < 8) {
        attemptsRef.current += 1;
        setTimeout(poll, 2000);
      } else {
        setConfirming(false);
      }
    };
    poll();
  }, [donationId]);

  if (!donationId) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-text-muted">
          We couldn't find that donation.
        </p>
        <Link
          href="/campaigns"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Browse campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <AnimatePresence mode="wait">
        {confirming && !summary ? (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-24 text-center"
          >
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="mt-4 text-sm text-text-muted">
              Confirming your donation…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Success icon */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 size={34} className="text-accent" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-5 font-heading text-2xl font-semibold sm:text-3xl"
              >
                {summary?.status === "PAID"
                  ? "Thank you for your generosity"
                  : "Almost there"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-2 max-w-sm text-sm text-text-muted"
              >
                {summary?.status === "PAID"
                  ? `Your contribution to ${summary.campaignTitle} means more than you know. Someone's story is a little brighter because of you.`
                  : "We're confirming your payment with the bank — this can take a moment. This page will update automatically."}
              </motion.p>
            </div>

            {summary?.status !== "PAID" && confirming && (
              <div className="mt-6 flex justify-center">
                <Loader2 size={16} className="animate-spin text-text-muted" />
              </div>
            )}

            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="border-b border-border p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Donation summary
                  </p>

                  <div className="mt-3 space-y-2 text-sm">
                    {summary.donationType === "AMOUNT" ? (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Donation amount</span>
                        <span className="font-medium">
                          ₹{(summary.amount / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      summary.products.map((p, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-text-muted">
                            {p.title} × {p.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(p.amount / 100).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tip to platform</span>
                      <span className="font-medium">
                        ₹{(summary.tipAmount / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-medium">Total paid</span>
                    <span className="font-heading text-xl font-semibold text-accent">
                      ₹{(summary.totalAmount / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Donor</span>
                    <span>{summary.donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Email</span>
                    <span>{summary.donorEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Campaign</span>
                    <span className="text-right">{summary.campaignTitle}</span>
                  </div>
                  {summary.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment ID</span>
                      <span className="font-mono text-xs">
                        {summary.paymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Date</span>
                    <span>
                      {new Date(summary.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {summary.message && (
                    <div className="mt-2 rounded-lg bg-bg p-3 text-xs italic text-text-muted">
                      "{summary.message}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {summary?.status === "PAID" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex flex-col gap-2.5 sm:flex-row"
              >
                {summary.receiptUrl ? (
                  <a
                    href={summary.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
                  >
                    <Download size={15} /> Download receipt
                  </a>
                ) : (
                  <div className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-text-muted">
                    <Loader2 size={14} className="animate-spin" /> Receipt
                    generating…
                  </div>
                )}
                <Link
                  href={`/campaigns/${summary.campaignSlug}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-bg"
                >
                  Back to campaign <ArrowRight size={14} />
                </Link>
              </motion.div>
            )}

            {summary?.status === "PAID" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-4"
              >
                <EightyGSection
                  donationId={summary?.id}
                  donorName={summary?.donorName}
                  donorEmail={summary?.donorEmail}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-8 flex items-center justify-center gap-1.5 text-xs text-text-muted"
            >
              <Heart size={12} className="text-accent" /> Share this campaign to
              multiply your impact
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
