"use client";

import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { truncateAddress } from "@/lib/utils";
import { STELLAR_CONFIG, ALLOWANCE_INTERVALS } from "@/lib/constants";
import {
  User,
  Shield,
  Wallet,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { address, isConnected, network, walletType, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your wallet, family configuration, and preferences
        </p>
      </div>

      {/* Wallet Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-info" />
          </div>
          <h2 className="text-lg font-semibold">Wallet</h2>
        </div>

        {isConnected && address ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-glass-border">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Connected Address</div>
                <div className="font-mono text-sm">{truncateAddress(address, 8)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="glass-button p-2"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <a
                  href={`${STELLAR_CONFIG.explorerUrl}/account/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button p-2"
                  title="View on explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-glass-border">
                <div className="text-xs text-zinc-500 mb-1">Network</div>
                <div className="text-sm font-medium capitalize">{network}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-glass-border">
                <div className="text-xs text-zinc-500 mb-1">Wallet Type</div>
                <div className="text-sm font-medium capitalize">
                  {walletType || "N/A"}
                </div>
              </div>
            </div>

            <button
              onClick={disconnect}
              className="glass-button text-red-400 hover:text-red-300 text-sm w-full"
              id="settings-disconnect-btn"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            No wallet connected. Connect your wallet from the sidebar to manage
            settings.
          </p>
        )}
      </div>

      {/* Contract Addresses */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-success" />
          </div>
          <h2 className="text-lg font-semibold">Smart Contracts</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-white/[0.02] border border-glass-border">
            <div className="text-xs text-zinc-500 mb-1">Governance Contract</div>
            <div className="font-mono text-xs text-zinc-400 break-all">
              {STELLAR_CONFIG.governanceContractId || "Not deployed yet"}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-glass-border">
            <div className="text-xs text-zinc-500 mb-1">Vault Contract</div>
            <div className="font-mono text-xs text-zinc-400 break-all">
              {STELLAR_CONFIG.vaultContractId || "Not deployed yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Family Configuration */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <User className="h-4 w-4 text-warning" />
          </div>
          <h2 className="text-lg font-semibold">Family Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-2">
              Default Allowance Interval
            </label>
            <select className="glass-input" id="settings-interval-select">
              {ALLOWANCE_INTERVALS.map((interval) => (
                <option
                  key={interval.value}
                  value={interval.value}
                  className="bg-zinc-900"
                >
                  {interval.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-2">
              Maximum Children Per Family
            </label>
            <input
              type="number"
              defaultValue={10}
              className="glass-input"
              min={1}
              max={20}
              id="settings-max-children-input"
            />
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Globe className="h-4 w-4 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold">Network</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span className="text-zinc-500">Network</span>
            <span className="capitalize">{STELLAR_CONFIG.network}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span className="text-zinc-500">RPC URL</span>
            <span className="font-mono text-xs text-zinc-400 truncate max-w-[250px]">
              {STELLAR_CONFIG.rpcUrl}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">Explorer</span>
            <a
              href={STELLAR_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-info/80 hover:text-info transition-colors inline-flex items-center gap-1"
            >
              Stellar Expert
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
