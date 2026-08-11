export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="space-y-6 rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            About GiveForward
          </p>
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
            Empowering changemakers through simple fundraising.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
            GiveForward connects donors and campaigns with a modern, trust-first
            platform designed to help every story find support. We make it easy
            to discover meaningful causes, give with confidence, and track the
            impact of every gift.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-white/20 p-6">
            <h2 className="font-semibold">Our mission</h2>
            <p className="mt-3 text-sm leading-7 ">
              Build a safer, more transparent way for communities to support
              people and projects they care about.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white/30 p-6">
            <h2 className="font-semibold">For supporters</h2>
            <p className="mt-3 text-sm leading-7 ">
              Discover verified campaigns, donate securely, and stay updated on
              campaign progress from one place.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white/30 p-6">
            <h2 className="font-semibold">For organizers</h2>
            <p className="mt-3 text-sm leading-7 ">
              Launch campaigns quickly, manage donations, and grow your impact
              with clear progress tracking.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Why GiveForward?</h2>
            <p className="text-base leading-8 text-text-muted">
              We believe in the power of everyday generosity. Our platform is
              built to support authentic campaigns with easy browsing, fast
              payment flows, and simple tools for campaign owners. Whether
              you're giving for the first time or looking to scale a fundraising
              effort, GiveForward helps make every donation count.
            </p>
            <ul className="space-y-3 text-sm leading-7 text-text-muted">
              <li>
                • Clean campaign discovery with clear categories and featured
                stories.
              </li>
              <li>
                • Secure donation processing and transparent campaign updates.
              </li>
              <li>• Dedicated support for both donors and organizers.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-border/5 p-6">
            <h3 className="font-semibold">Our values</h3>
            <div className="mt-4 space-y-4 text-sm leading-7 text-text-muted">
              <p>
                Integrity: We keep campaign information honest and easy to
                verify.
              </p>
              <p>
                Community: We put people first and help supporters connect with
                causes.
              </p>
              <p>
                Impact: We measure success by real outcomes, not just numbers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
