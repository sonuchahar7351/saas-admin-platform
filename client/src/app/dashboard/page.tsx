"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  Layers,
  PlayCircle,
  CheckCircle2,
  Users,
  XCircle,
  Percent,
  Gift,
} from "lucide-react";
import { analyticsApi } from "../../lib/analytics-api";
import { StatCard } from "../../components/StatCard";
import { ChartCard } from "../../components/ChartCard";

const CHART_COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#0D9488",
  "#D97706",
  "#DC2626",
  "#0EA5E9",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [period, setPeriod] = useState("day");
  const [topCampaigns, setTopCampaigns] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.getSummary().then(({ data }) => setSummary(data));
    analyticsApi
      .getTopCampaigns()
      .then(({ data }) => setTopCampaigns(data as any[]));
    analyticsApi
      .getCategoryDistribution()
      .then(({ data }) => setCategoryDist(data as any[]));
    analyticsApi
      .getPaymentStatus()
      .then(({ data }) => setPaymentStatus(data as any[]));
    analyticsApi
      .getLatestTransactions()
      .then(({ data }) => setTransactions(data as any[]));
  }, []);

  useEffect(() => {
    analyticsApi
      .getDonationTrend(period)
      .then(({ data }) => setTrend(data as any[]));
  }, [period]);

  if (!summary)
    return <p className="text-sm text-text-secondary">Loading dashboard…</p>;

  const trendOption = {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: "category",
      data: trend.map((t) =>
        new Date(t.bucket).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
      ),
      axisLine: { lineStyle: { color: "#E3E5EA" } },
      axisLabel: { color: "#6B7178", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#F4F5F7" } },
      axisLabel: { color: "#6B7178", fontSize: 11 },
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `₹${(v / 100).toLocaleString("en-IN")}`,
    },
    series: [
      {
        data: trend.map((t) => t.total),
        type: "line",
        smooth: true,
        areaStyle: { color: "rgba(79, 70, 229, 0.08)" },
        lineStyle: { color: "#4F46E5", width: 2 },
        itemStyle: { color: "#4F46E5" },
        symbol: "circle",
        symbolSize: 6,
      },
    ],
  };

  const topCampaignsOption = {
    grid: { left: 100, right: 30, top: 10, bottom: 10 },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#F4F5F7" } },
      axisLabel: { color: "#6B7178", fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: topCampaigns.map((c) => c.title).reverse(),
      axisLine: { show: false },
      axisLabel: {
        color: "#171A21",
        fontSize: 11,
        width: 90,
        overflow: "truncate",
      },
    },
    tooltip: {
      valueFormatter: (v: number) => `₹${(v / 100).toLocaleString("en-IN")}`,
    },
    series: [
      {
        data: topCampaigns.map((c) => c.raisedAmount).reverse(),
        type: "bar",
        barWidth: 16,
        itemStyle: { color: "#4F46E5", borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  const categoryOption = {
    tooltip: {
      valueFormatter: (v: number) => `₹${(v / 100).toLocaleString("en-IN")}`,
    },
    legend: { bottom: 0, textStyle: { fontSize: 11, color: "#6B7178" } },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        data: categoryDist.map((c, i) => ({
          name: c.category,
          value: c.total,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        label: { show: false },
      },
    ],
  };

  const statusOption = {
    tooltip: {},
    legend: { bottom: 0, textStyle: { fontSize: 11, color: "#6B7178" } },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        data: paymentStatus.map((s, i) => ({
          name: s.status,
          value: s.count,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        label: { show: false },
      },
    ],
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Donations"
          value={summary.totalDonations}
          icon={IndianRupee}
          format="currency"
        />
        <StatCard
          label="Today"
          value={summary.todayDonations}
          icon={Calendar}
          format="currency"
        />
        <StatCard
          label="This Month"
          value={summary.monthlyDonations}
          icon={TrendingUp}
          format="currency"
        />
        <StatCard
          label="Total Campaigns"
          value={summary.totalCampaigns}
          icon={Layers}
        />
        <StatCard
          label="Running"
          value={summary.runningCampaigns}
          icon={PlayCircle}
        />
        <StatCard
          label="Completed"
          value={summary.completedCampaigns}
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Customers"
          value={summary.totalCustomers}
          icon={Users}
        />
        <StatCard
          label="Failed Payments"
          value={summary.failedPayments}
          icon={XCircle}
        />
        <StatCard
          label="Avg Donation"
          value={summary.averageDonation}
          icon={Gift}
          format="currency"
        />
        <StatCard
          label="Avg Tip"
          value={summary.averageTip}
          icon={Percent}
          format="currency"
        />
      </div>

      {/* Trend chart */}
      <ChartCard title="Donation trend">
        <div className="mb-3 flex gap-1">
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                period === p
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <ReactECharts option={trendOption} style={{ height: 280 }} />
      </ChartCard>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ChartCard title="Top campaigns">
            <ReactECharts option={topCampaignsOption} style={{ height: 240 }} />
          </ChartCard>
        </div>
        <ChartCard title="Category distribution">
          <ReactECharts option={categoryOption} style={{ height: 240 }} />
        </ChartCard>
        <ChartCard title="Payment status">
          <ReactECharts option={statusOption} style={{ height: 240 }} />
        </ChartCard>
      </div>

      {/* Latest transactions */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
        <p className="border-b border-border px-5 py-3 text-sm font-medium">
          Latest transactions
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-2.5 font-medium">Campaign</th>
              <th className="px-5 py-2.5 font-medium">Donor</th>
              <th className="px-5 py-2.5 font-medium">Amount</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border last:border-0 hover:bg-bg"
              >
                <td className="px-5 py-2.5">{t.campaign?.title}</td>
                <td className="px-5 py-2.5">
                  {t.isAnonymous ? "Anonymous" : t.customer?.name}
                </td>
                <td className="px-5 py-2.5 font-mono text-xs">
                  ₹{(t.amount / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-2.5">
                  <span
                    className={`font-mono text-[11px] font-medium ${
                      t.status === "PAID"
                        ? "text-emerald-600"
                        : t.status === "FAILED"
                          ? "text-red-600"
                          : "text-amber-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-2.5 font-mono text-xs text-text-secondary">
                  {new Date(t.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-text-secondary"
                >
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
