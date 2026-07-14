"use client";

import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Zap,
  Lock,
  Clock,
  Users,
  BarChart3,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Smart Contract Security",
    description:
      "Funds managed by auditable Soroban smart contracts on Stellar. No intermediaries, full transparency.",
  },
  {
    icon: Clock,
    title: "Automated Allowances",
    description:
      "Set up weekly, bi-weekly, or monthly allowance streams. Distributions happen on schedule, trustlessly.",
  },
  {
    icon: Users,
    title: "Family RBAC",
    description:
      "Role-based access control. Parents manage, children claim. Clear permissions, no confusion.",
  },
  {
    icon: Zap,
    title: "Instant Claims",
    description:
      "Children claim available allowances instantly. Sub-second finality on the Stellar network.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track deposits, distributions, and savings goals with live dashboards and activity feeds.",
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Support",
    description:
      "Connect with Freighter and other Stellar wallets. Seamless Web3 experience for the whole family.",
  },
];

const stats = [
  { value: "< 1s", label: "Transaction Finality" },
  { value: "$0.001", label: "Average Fee" },
  { value: "100%", label: "Transparent" },
  { value: "24/7", label: "Always Available" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-info" />
          <span className="text-xl font-bold tracking-tight">KithTrust</span>
        </div>
        <Link
          href="/dashboard"
          className="glass-button-primary text-sm px-6"
          id="landing-launch-btn"
        >
          Launch App
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="status-info mb-6 animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-info glow-dot" />
          Built on Stellar &middot; Powered by Soroban
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl animate-slide-up">
          The Family Treasury,{" "}
          <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Decentralized
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Automate your children&apos;s allowances with programmable smart
          contracts. Transparent, trustless, and built for modern families.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/dashboard"
            className="glass-button-primary text-base px-8 py-3"
            id="hero-get-started-btn"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="https://github.com/kheyatari-cmd/kithtrust"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button text-base px-8 py-3"
            id="hero-github-btn"
          >
            View on GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-3xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="glow-line max-w-4xl mx-auto" />

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything Your Family Needs
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            A complete decentralized finance toolkit designed for families, not
            traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:scale-[1.02] transition-transform duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                <feature.icon className="h-5 w-5 text-info" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20">
        <div className="glass-card max-w-4xl mx-auto p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-info font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect & Configure</h3>
              <p className="text-sm text-zinc-400">
                Connect your Stellar wallet, add family members, and set
                allowance rules.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-success font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Fund & Automate</h3>
              <p className="text-sm text-zinc-400">
                Deposit XLM into your family vault. Smart contracts handle
                distributions automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-warning font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track & Learn</h3>
              <p className="text-sm text-zinc-400">
                Children claim allowances and track savings. Real-time activity
                feed keeps everyone informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Modernize Family Finance?
        </h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          Join the future of programmable allowances. No banks, no paperwork,
          just smart contracts.
        </p>
        <Link
          href="/dashboard"
          className="glass-button-primary text-lg px-10 py-4"
          id="cta-launch-btn"
        >
          Launch KithTrust
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border px-6 py-8 text-center text-sm text-zinc-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-info" />
          <span>KithTrust</span>
        </div>
        <p>
          Built on{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Stellar
          </a>{" "}
          &middot; Powered by Soroban Smart Contracts
        </p>
      </footer>
    </div>
  );
}
