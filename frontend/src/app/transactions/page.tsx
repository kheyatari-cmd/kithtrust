"use client";

import { useTransactionStore, type Transaction } from "@/features/transactions/store";
import { getExplorerLink, formatRelativeTime } from "@/lib/utils";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";
import type { TransactionStatus } from "@/lib/constants";

// Demo transactions for display
const demoTransactions: Transaction[] = [
  {
    id: "tx_1",
    hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    type: "deposit",
    status: "confirmed",
    description: "Deposited 5,000 XLM to family vault",
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    retryCount: 0,
  },
  {
    id: "tx_2",
    hash: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567",
    type: "distribute",
    status: "confirmed",
    description: "Distributed 500 XLM allowance to Alice",
    timestamp: Math.floor(Date.now() / 1000) - 7200,
    retryCount: 0,
  },
  {
    id: "tx_3",
    hash: null,
    type: "distribute",
    status: "pending",
    description: "Distributing 300 XLM allowance to Bob",
    timestamp: Math.floor(Date.now() / 1000) - 60,
    retryCount: 0,
  },
  {
    id: "tx_4",
    hash: "c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
    type: "claim",
    status: "failed",
    description: "Claim 250 XLM — Insufficient claimable balance",
    timestamp: Math.floor(Date.now() / 1000) - 14400,
    error: "Error(Contract, #7): NothingToClaim",
    retryCount: 1,
  },
  {
    id: "tx_5",
    hash: null,
    type: "deposit",
    status: "processing",
    description: "Depositing 2,000 XLM to family vault",
    timestamp: Math.floor(Date.now() / 1000) - 30,
    retryCount: 0,
  },
];

function getStatusConfig(status: TransactionStatus) {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        label: "Pending",
        colorClass: "text-warning",
        bgClass: "bg-warning/10 border-warning/20",
        dotClass: "bg-warning",
      };
    case "processing":
      return {
        icon: Loader2,
        label: "Processing",
        colorClass: "text-info",
        bgClass: "bg-info/10 border-info/20",
        dotClass: "bg-info",
        spinning: true,
      };
    case "confirmed":
      return {
        icon: CheckCircle2,
        label: "Confirmed",
        colorClass: "text-success",
        bgClass: "bg-success/10 border-success/20",
        dotClass: "bg-success",
      };
    case "failed":
      return {
        icon: XCircle,
        label: "Failed",
        colorClass: "text-red-400",
        bgClass: "bg-red-400/10 border-red-400/20",
        dotClass: "bg-red-400",
      };
  }
}

function TransactionCard({ tx }: { tx: Transaction }) {
  const config = getStatusConfig(tx.status);
  const StatusIcon = config.icon;

  return (
    <div className="glass-card p-5 group">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Status + description */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${config.bgClass}`}
          >
            <StatusIcon
              className={`h-5 w-5 ${config.colorClass} ${
                (config as Record<string, unknown>).spinning ? "animate-spin" : ""
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`status-badge ${config.bgClass} ${config.colorClass} border`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${config.dotClass} ${
                    tx.status === "processing" ? "animate-pulse" : ""
                  }`}
                />
                {config.label}
              </span>
              <span className="text-xs text-zinc-600 uppercase tracking-wider">
                {tx.type}
              </span>
            </div>

            <p className="text-sm text-zinc-300 truncate">{tx.description}</p>

            {tx.error && (
              <p className="text-xs text-red-400/80 mt-1 font-mono">
                {tx.error}
              </p>
            )}

            {tx.hash && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-zinc-600 font-mono truncate max-w-[200px]">
                  {tx.hash}
                </span>
                <a
                  href={getExplorerLink("tx", tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-info/60 hover:text-info transition-colors flex-shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                  Explorer
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Time + actions */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-zinc-500">
            {formatRelativeTime(tx.timestamp)}
          </div>

          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {tx.status === "failed" && (
              <button
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                title="Retry transaction"
              >
                <RotateCcw className="h-3.5 w-3.5 text-warning" />
              </button>
            )}
            {(tx.status === "confirmed" || tx.status === "failed") && (
              <button
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5 text-zinc-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions } = useTransactionStore();
  const allTx =
    transactions.length > 0 ? transactions : demoTransactions;

  const statusCounts = {
    all: allTx.length,
    pending: allTx.filter((t) => t.status === "pending").length,
    processing: allTx.filter((t) => t.status === "processing").length,
    confirmed: allTx.filter((t) => t.status === "confirmed").length,
    failed: allTx.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Transaction Center</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Full transaction lifecycle with status tracking and explorer links
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            { key: "all", label: "All", color: "text-zinc-300" },
            { key: "pending", label: "Pending", color: "text-warning" },
            { key: "processing", label: "Processing", color: "text-info" },
            { key: "confirmed", label: "Confirmed", color: "text-success" },
            { key: "failed", label: "Failed", color: "text-red-400" },
          ] as const
        ).map((item) => (
          <div key={item.key} className="glass-card p-3 text-center">
            <div className={`text-xl font-bold ${item.color}`}>
              {statusCounts[item.key]}
            </div>
            <div className="text-xs text-zinc-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {allTx.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ArrowLeftRight className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No transactions yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Transactions will appear here when you interact with the contracts
            </p>
          </div>
        ) : (
          allTx.map((tx) => <TransactionCard key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
