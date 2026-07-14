import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// We test the Transaction Center page's status rendering
// by importing the page and verifying its structure

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/transactions",
  useRouter: () => ({ push: vi.fn() }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("Transaction Center", () => {
  it("renders transaction status summary cards", async () => {
    // Dynamically import to avoid SSR issues
    const { default: TransactionsPage } = await import(
      "@/app/transactions/page"
    );

    render(<TransactionsPage />, { wrapper: createWrapper() });

    // Check page title
    expect(screen.getByText("Transaction Center")).toBeInTheDocument();

    // Check status labels are present
    expect(screen.getAllByText("Pending")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Processing")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Confirmed")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Failed")[0]).toBeInTheDocument();
  });

  it("displays demo transactions with correct statuses", async () => {
    const { default: TransactionsPage } = await import(
      "@/app/transactions/page"
    );

    render(<TransactionsPage />, { wrapper: createWrapper() });

    // Check demo transaction descriptions
    expect(
      screen.getByText("Deposited 5,000 XLM to family vault")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Distributed 500 XLM allowance to Alice")
    ).toBeInTheDocument();
  });

  it("shows explorer links for confirmed transactions", async () => {
    const { default: TransactionsPage } = await import(
      "@/app/transactions/page"
    );

    render(<TransactionsPage />, { wrapper: createWrapper() });

    // Explorer links should be present for transactions with hashes
    const explorerLinks = screen.getAllByText("Explorer");
    expect(explorerLinks.length).toBeGreaterThan(0);
  });
});
