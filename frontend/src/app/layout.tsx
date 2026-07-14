import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "KithTrust — Family Allowance Manager",
  description:
    "A decentralized, programmable family allowance manager built on the Stellar network. Automate kids' allowances, chores, and savings goals using smart contracts.",
  keywords: [
    "stellar",
    "soroban",
    "allowance",
    "family",
    "blockchain",
    "web3",
    "defi",
  ],
  openGraph: {
    title: "KithTrust — Family Allowance Manager",
    description:
      "Decentralized family treasury on Stellar. Smart allowances, transparent finances.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
