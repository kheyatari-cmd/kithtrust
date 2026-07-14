import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
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

describe("Dashboard Page", () => {
  it("renders the dashboard heading", async () => {
    const { default: DashboardPage } = await import("@/app/dashboard/page");

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders stat cards with labels", async () => {
    const { default: DashboardPage } = await import("@/app/dashboard/page");

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Vault Balance")).toBeInTheDocument();
    expect(screen.getByText("Total Distributed")).toBeInTheDocument();
    expect(screen.getByText("Active Children")).toBeInTheDocument();
    expect(screen.getByText("Next Distribution")).toBeInTheDocument();
  });

  it("renders family members list", async () => {
    const { default: DashboardPage } = await import("@/app/dashboard/page");

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Family Members")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("renders quick action buttons", async () => {
    const { default: DashboardPage } = await import("@/app/dashboard/page");

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Deposit to Vault")).toBeInTheDocument();
    expect(screen.getByText("Distribute Allowance")).toBeInTheDocument();
    expect(screen.getByText("Pause Distributions")).toBeInTheDocument();
  });
});
