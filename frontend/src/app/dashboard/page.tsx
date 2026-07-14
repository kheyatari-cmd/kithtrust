"use client";

import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { useFamilyStore } from "@/features/family/store";
import {
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  TrendingUp,
  Clock,
  Shield,
  Plus,
} from "lucide-react";
import { formatBalance } from "@/lib/utils";
import Link from "next/link";

// Mock data for demo
const mockChildren = [
  {
    name: "Alice",
    address: "GALICE...WXYZ",
    allowance: 500,
    interval: "Weekly",
    claimable: 250,
    lastDist: "2 days ago",
  },
  {
    name: "Bob",
    address: "GBOBXX...ABCD",
    allowance: 300,
    interval: "Weekly",
    claimable: 0,
    lastDist: "5 days ago",
  },
  {
    name: "Charlie",
    address: "GCHARL...EFGH",
    allowance: 1000,
    interval: "Monthly",
    claimable: 1000,
    lastDist: "30 days ago",
  },
];

const statCards = [
  {
    label: "Vault Balance",
    value: "12,500",
    unit: "XLM",
    change: "+2,500",
    positive: true,
    icon: Coins,
  },
  {
    label: "Total Distributed",
    value: "8,200",
    unit: "XLM",
    change: "+1,800",
    positive: true,
    icon: ArrowUpRight,
  },
  {
    label: "Active Children",
    value: "3",
    unit: "",
    change: "",
    positive: true,
    icon: Users,
  },
  {
    label: "Next Distribution",
    value: "2d 14h",
    unit: "",
    change: "Weekly",
    positive: true,
    icon: Clock,
  },
];

export default function DashboardPage() {
  const { isConnected, address } = useWallet();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isConnected
              ? "Manage your family treasury and allowances"
              : "Connect your wallet to get started"}
          </p>
        </div>
        {isConnected && (
          <button className="glass-button-primary text-sm px-5 py-2.5" id="add-child-btn">
            <Plus className="h-4 w-4" />
            Add Child
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-5 group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <stat.icon className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.unit && (
                <span className="text-sm text-zinc-500">{stat.unit}</span>
              )}
            </div>
            {stat.change && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs ${
                  stat.positive ? "text-success" : "text-red-400"
                }`}
              >
                {stat.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children list */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Family Members</h2>
            <span className="text-xs text-zinc-500">
              {mockChildren.length} children
            </span>
          </div>

          <div className="space-y-3">
            {mockChildren.map((child) => (
              <div
                key={child.address}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-glass-border hover:border-glass-border-hover transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center border border-info/10">
                    <span className="text-sm font-bold text-info">
                      {child.name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{child.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {child.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">
                      {formatBalance(child.allowance)} XLM
                    </div>
                    <div className="text-xs text-zinc-500">
                      {child.interval}
                    </div>
                  </div>

                  <div className="text-right">
                    {child.claimable > 0 ? (
                      <div className="status-success text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        {formatBalance(child.claimable)} claimable
                      </div>
                    ) : (
                      <div className="status-inactive text-xs">
                        Up to date
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="glass-button w-full justify-start text-sm" id="quick-deposit-btn">
                <Coins className="h-4 w-4 text-success" />
                Deposit to Vault
              </button>
              <button className="glass-button w-full justify-start text-sm" id="quick-distribute-btn">
                <ArrowUpRight className="h-4 w-4 text-info" />
                Distribute Allowance
              </button>
              <button className="glass-button w-full justify-start text-sm" id="quick-pause-btn">
                <Shield className="h-4 w-4 text-warning" />
                Pause Distributions
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { event: "Deposited 2,500 XLM", time: "2h ago", type: "deposit" },
                { event: "Distributed to Alice", time: "2d ago", type: "dist" },
                { event: "Bob claimed 300 XLM", time: "5d ago", type: "claim" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-300">{item.event}</span>
                  <span className="text-xs text-zinc-500">{item.time}</span>
                </div>
              ))}
            </div>
            <Link
              href="/activity"
              className="block text-center text-xs text-info mt-4 hover:text-info/80 transition-colors"
            >
              View All Activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
