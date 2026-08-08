import { PublicCampaign } from "@/lib/campaigs-api";
import Link from "next/link";

function daysLeft(expiryDate: string) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
}

export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const percent = Math.min(
    100,
    Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
  );

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="h-44 overflow-hidden bg-[#F1EFE9]">
        {campaign.cardImageUrl ? (
          <img
            src={campaign.cardImageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No image
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
          {campaign.category.name}
        </span>
        <h3 className="mt-1 line-clamp-2 font-heading text-base font-semibold leading-snug">
          {campaign.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {campaign.shortDescription}
        </p>

        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDEBE4]">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-medium">
              ₹{(campaign.raisedAmount / 100).toLocaleString("en-IN")}{" "}
              <span className="font-normal text-text-muted">
                raised of ₹{(campaign.goalAmount / 100).toLocaleString("en-IN")}
              </span>
            </span>
            <span className="text-text-muted">
              {daysLeft(campaign.expiryDate)}d left
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
