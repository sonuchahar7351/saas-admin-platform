import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="space-y-8 rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
        <div className="max-w-2xl space-y-4">
          <p className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            Contact Us
          </p>
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
            We’re here to help.
          </h1>
          <p className="text-base leading-8 text-text-muted sm:text-lg">
            Have a question about donations, campaign creation, or platform
            features? Reach out and our support team will get back to you as
            soon as possible.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-white/20 p-6">
            <h2 className="font-semibold">Support</h2>
            <p className="mt-3 text-sm leading-7 ">
              For help with your account, campaigns, or donations, email us at:
            </p>
            <p className="mt-3 break-words text-sm font-medium text-text">
              <Link
                href="mailto:support@giveforward.example.com"
                className="text-accent hover:underline"
              >
                support@giveforward.example.com
              </Link>
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-white/20 p-6">
            <h2 className="font-semibold">General inquiries</h2>
            <p className="mt-3 text-sm leading-7 text-text-muted">
              Send us an email or connect with us on our platform to learn more
              about how GiveForward can support your fundraising goals.
            </p>
            <div className="mt-6 space-y-3 text-sm leading-7">
              <p>
                <span className="font-medium text-text">Phone:</span> +1 (555)
                123-4567
              </p>
              <p>
                <span className="font-medium text-text">Address:</span> 148
                Giving Lane, Community City, CA 94016
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-border/5 p-6">
          <h3 className="text-lg font-semibold">Need fast answers?</h3>
          <p className="mt-3 text-sm leading-7 text-text-muted">
            Check out our campaign pages to discover active fundraisers, or
            visit the homepage to explore featured stories and donation options.
          </p>
        </div>
      </div>
    </div>
  );
}
