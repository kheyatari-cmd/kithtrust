import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate a Stellar address for display: GABC...WXYZ */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Format stroops to XLM (1 XLM = 10,000,000 stroops) */
export function formatXLM(stroops: bigint | number | string): string {
  const value = Number(stroops) / 10_000_000;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

/** Format a contract balance (i128 represented as string/number) */
export function formatBalance(amount: number | string): string {
  const value = Number(amount);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Format a Unix timestamp to a human-readable date */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format relative time (e.g., "2 hours ago") */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(timestamp);
}

/** Get explorer link for a transaction or contract */
export function getExplorerLink(
  type: "tx" | "contract" | "account",
  id: string
): string {
  const base =
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    "https://stellar.expert/explorer/testnet";
  switch (type) {
    case "tx":
      return `${base}/tx/${id}`;
    case "contract":
      return `${base}/contract/${id}`;
    case "account":
      return `${base}/account/${id}`;
  }
}
