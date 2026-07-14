"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet/wallet-button";
import {
  LayoutDashboard,
  Activity,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass-card rounded-none border-x-0 border-t-0 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-info" />
          <span className="font-bold text-lg">KithTrust</span>
        </Link>
        <div className="flex items-center gap-3">
          <WalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="glass-button p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <div
        className={cn(
          "fixed top-14 left-0 bottom-0 z-40 w-64 glass-card rounded-none border-l-0 border-t-0 border-b-0 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-1 p-4 pt-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen glass-card rounded-none border-t-0 border-b-0 border-l-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-glass-border">
          <Shield className="h-7 w-7 text-info" />
          <span className="font-bold text-xl tracking-tight">KithTrust</span>
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-white/5"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-info glow-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <WalletButton />
        </div>
      </aside>
    </>
  );
}
