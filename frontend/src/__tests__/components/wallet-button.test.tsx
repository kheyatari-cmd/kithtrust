import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalletButton } from "@/components/wallet/wallet-button";
import { useWalletStore } from "@/features/wallet/store";

// Mock the wallet hooks
vi.mock("@/features/wallet/hooks/use-wallet", () => ({
  useWallet: () => {
    const store = useWalletStore.getState();
    return {
      address: store.address,
      isConnected: store.isConnected,
      isConnecting: store.isConnecting,
      network: store.network,
      walletType: store.walletType,
      error: store.error,
      freighterAvailable: true,
      connect: vi.fn(() => {
        useWalletStore.getState().connect("GABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZ56", "freighter");
      }),
      disconnect: vi.fn(() => {
        useWalletStore.getState().disconnect();
      }),
    };
  },
}));

describe("WalletButton", () => {
  beforeEach(() => {
    useWalletStore.getState().disconnect();
  });

  it("renders connect button when not connected", () => {
    render(<WalletButton />);
    const button = screen.getByText("Connect Wallet");
    expect(button).toBeInTheDocument();
  });

  it("shows truncated address when connected", () => {
    // Pre-set connected state
    useWalletStore.getState().connect(
      "GABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZ56",
      "freighter"
    );

    render(<WalletButton />);
    expect(screen.getByText("GABC...YZ56")).toBeInTheDocument();
  });

  it("shows disconnect option when wallet menu is opened", async () => {
    useWalletStore.getState().connect(
      "GABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZ56",
      "freighter"
    );

    render(<WalletButton />);

    // Click on the connected wallet button to open menu
    const walletBtn = screen.getByText("GABC...YZ56");
    fireEvent.click(walletBtn);

    await waitFor(() => {
      expect(screen.getByText("Disconnect")).toBeInTheDocument();
    });
  });
});
