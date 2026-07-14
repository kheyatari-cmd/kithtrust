"use client";

import {
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from "lucide-react";

// Mock analytics data
const monthlyData = [
  { month: "Jan", deposits: 5000, distributions: 3200, claims: 3000 },
  { month: "Feb", deposits: 4200, distributions: 3500, claims: 3200 },
  { month: "Mar", deposits: 6000, distributions: 4100, claims: 3800 },
  { month: "Apr", deposits: 3800, distributions: 3000, claims: 2900 },
  { month: "May", deposits: 7500, distributions: 5200, claims: 4800 },
  { month: "Jun", deposits: 8000, distributions: 5800, claims: 5500 },
];

const childStats = [
  { name: "Alice", totalReceived: 12500, totalClaimed: 11800, savings: 700, streak: 12 },
  { name: "Bob", totalReceived: 8200, totalClaimed: 8200, savings: 0, streak: 8 },
  { name: "Charlie", totalReceived: 15000, totalClaimed: 13500, savings: 1500, streak: 15 },
];

const summaryCards = [
  {
    label: "Total Deposits (All Time)",
    value: "34,500 XLM",
    change: "+12.5%",
    positive: true,
    icon: Coins,
  },
  {
    label: "Total Distributions",
    value: "24,800 XLM",
    change: "+8.3%",
    positive: true,
    icon: ArrowUpRight,
  },
  {
    label: "Avg. Distribution",
    value: "620 XLM",
    change: "-2.1%",
    positive: false,
    icon: TrendingUp,
  },
  {
    label: "Distribution Rate",
    value: "96.8%",
    change: "+1.2%",
    positive: true,
    icon: PieChart,
  },
];

export default function AnalyticsPage() {
  const maxDeposit = Math.max(...monthlyData.map((d) => d.deposits));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Distribution history, savings progress, and family financial insights
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="glass-card p-5 group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                <card.icon className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${
                card.positive ? "text-success" : "text-red-400"
              }`}
            >
              {card.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {card.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Monthly Overview</h2>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-info" /> Deposits
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success" /> Distributions
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-warning" /> Claims
              </div>
            </div>
          </div>

          {/* CSS bar chart */}
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: "180px" }}>
                  <div
                    className="flex-1 bg-info/30 rounded-t border border-info/20 transition-all duration-500 hover:bg-info/50"
                    style={{ height: `${(data.deposits / maxDeposit) * 100}%` }}
                    title={`Deposits: ${data.deposits} XLM`}
                  />
                  <div
                    className="flex-1 bg-success/30 rounded-t border border-success/20 transition-all duration-500 hover:bg-success/50"
                    style={{ height: `${(data.distributions / maxDeposit) * 100}%` }}
                    title={`Distributions: ${data.distributions} XLM`}
                  />
                  <div
                    className="flex-1 bg-warning/30 rounded-t border border-warning/20 transition-all duration-500 hover:bg-warning/50"
                    style={{ height: `${(data.claims / maxDeposit) * 100}%` }}
                    title={`Claims: ${data.claims} XLM`}
                  />
                </div>
                <span className="text-xs text-zinc-500">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Per-Child Breakdown</h2>
          <div className="space-y-4">
            {childStats.map((child) => {
              const percentage = Math.round(
                (child.totalClaimed / child.totalReceived) * 100
              );
              return (
                <div key={child.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center border border-info/10">
                        <span className="text-xs font-bold text-info">
                          {child.name[0]}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{child.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-info to-success transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-1.5 text-xs text-zinc-500">
                    <span>{child.totalClaimed.toLocaleString()} claimed</span>
                    <span className="text-success">
                      {child.savings > 0
                        ? `${child.savings.toLocaleString()} saved`
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Streaks & achievements */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Claim Streaks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {childStats.map((child) => (
            <div
              key={child.name}
              className="p-4 rounded-lg bg-white/[0.02] border border-glass-border text-center"
            >
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold">{child.streak}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {child.name}&apos;s weekly streak
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
