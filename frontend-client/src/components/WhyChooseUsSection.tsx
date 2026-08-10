import {
  ShieldCheck,
  Lock,
  Zap,
  BadgeCheck,
  TrendingUp,
  CreditCard,
  FileText,
  History,
} from "lucide-react";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Trusted & transparent",
    description:
      "Every campaign is reviewed and every rupee raised is tracked openly.",
  },
  {
    icon: Lock,
    title: "Secure donations",
    description:
      "Payments are processed through encrypted, PCI-compliant gateways.",
  },
  {
    icon: Zap,
    title: "Effortless giving",
    description:
      "Donate in under a minute — no account required to get started.",
  },
  {
    icon: BadgeCheck,
    title: "Verified organizations",
    description:
      "Every NGO on our platform is vetted before their first campaign goes live.",
  },
  {
    icon: TrendingUp,
    title: "Real-time progress",
    description: "Watch campaigns update live as more people join in.",
  },
  {
    icon: CreditCard,
    title: "Flexible payment options",
    description:
      "Cards, UPI, netbanking, and wallets — donate however suits you.",
  },
  {
    icon: FileText,
    title: "Instant receipts",
    description:
      "Every donation comes with a downloadable receipt for your records.",
  },
  {
    icon: History,
    title: "Full donation history",
    description: "Track every campaign you have supported, all in one place.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="my-20">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Why give through us
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
          We built this platform around trust, transparency, and making
          generosity effortless.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl border border-border bg-surface p-5 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <r.icon size={17} />
            </div>
            <p className="mt-3 font-heading text-sm font-semibold">{r.title}</p>
            <p className="mt-1 text-sm text-text-muted">{r.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
