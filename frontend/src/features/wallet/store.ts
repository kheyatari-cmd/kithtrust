import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WalletState {
  /** Connected wallet address */
  address: string | null;
  /** Whether wallet is currently connected */
  isConnected: boolean;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** Current network */
  network: string;
  /** Wallet type (e.g., "freighter") */
  walletType: string | null;
  /** Connection error message */
  error: string | null;

  /** Actions */
  connect: (address: string, walletType: string) => void;
  disconnect: () => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  setNetwork: (network: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      network: "testnet",
      walletType: null,
      error: null,

      connect: (address, walletType) =>
        set({
          address,
          isConnected: true,
          isConnecting: false,
          walletType,
          error: null,
        }),

      disconnect: () =>
        set({
          address: null,
          isConnected: false,
          isConnecting: false,
          walletType: null,
          error: null,
        }),

      setConnecting: (connecting) => set({ isConnecting: connecting }),
      setError: (error) => set({ error, isConnecting: false }),
      setNetwork: (network) => set({ network }),
    }),
    {
      name: "kithtrust-wallet",
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        walletType: state.walletType,
        network: state.network,
      }),
    }
  )
);
