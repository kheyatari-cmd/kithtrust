import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
