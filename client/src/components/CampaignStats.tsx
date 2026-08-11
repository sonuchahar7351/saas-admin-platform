"use client";

import {
  Target,
  Heart,
  CalendarClock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

type CampaignStatsProps = {
  goalAmount?: number;
  raisedAmount?: number;
  expiryDate?: string | Date;
};

export default function CampaignStats({
  goalAmount = 0,
  raisedAmount = 0,
  expiryDate,
}: CampaignStatsProps) {
  const progress =
    goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  const getExpiryInfo = () => {
    if (!expiryDate) {
      return {
        expired: false,
        daysLeft: 0,
      };
    }

    const now = new Date();
    const expiry = new Date(expiryDate);

    // Compare dates without time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const expiryDay = new Date(
      expiry.getFullYear(),
      expiry.getMonth(),
      expiry.getDate(),
    );

    const difference = expiryDay.getTime() - today.getTime();

    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return {
      expired: daysLeft < 0,
      daysLeft: Math.max(daysLeft, 0),
    };
  };

  const { expired, daysLeft } = getExpiryInfo();

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Goal */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <Target size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Goal</p>

            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatAmount(goalAmount)}
            </p>
          </div>
        </div>

        {/* Raised */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <Heart size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Raised</p>

            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatAmount(raisedAmount)}
            </p>
          </div>
        </div>

        {/* Expiry */}
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            expired
              ? "bg-red-50 dark:bg-red-500/10"
              : "bg-gray-50 dark:bg-gray-800/60"
          }`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              expired
                ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            }`}
          >
            {expired ? <CheckCircle2 size={22} /> : <CalendarClock size={22} />}
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {expired ? "Campaign Status" : "Time Left"}
            </p>

            <p
              className={`text-lg font-bold ${
                expired
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {expired
                ? "Campaign Ended"
                : daysLeft === 0
                  ? "Ends Today"
                  : daysLeft === 1
                    ? "1 Day Left"
                    : `${daysLeft} Days Left`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-orange-500" />

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress.toFixed(0)}% funded
            </span>
          </div>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatAmount(raisedAmount)} of {formatAmount(goalAmount)}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Expired message */}
      {expired && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
          <CheckCircle2 size={20} className="shrink-0 text-red-500" />

          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">
              This campaign has ended
            </p>

            <p className="text-sm text-red-600/80 dark:text-red-400/70">
              Thank you to everyone who supported this campaign.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
