"use client";

import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { truncateAddress } from "@/lib/utils";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected, isConnecting, error, connect, disconnect } =
    useWallet();
  const [showMenu, setShowMenu] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="glass-button w-full justify-between text-xs"
          id="wallet-connected-btn"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success glow-dot" />
            <span className="font-mono">{truncateAddress(address)}</span>
          </div>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute bottom-full left-0 right-0 mb-2 glass-card p-2 z-20 animate-slide-down">
              <div className="px-3 py-2 text-xs text-zinc-500 border-b border-glass-border mb-1">
                Connected via Freighter
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-md transition-colors"
                id="wallet-disconnect-btn"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="glass-button-primary w-full text-sm"
      id="wallet-connect-btn"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
      {error && (
        <span className="text-xs text-red-400 block mt-1">{error}</span>
      )}
    </button>
  );
}
