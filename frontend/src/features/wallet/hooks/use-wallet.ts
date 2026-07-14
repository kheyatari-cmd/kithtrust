"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletStore } from "../store";
import {
  connectFreighter,
  isFreighterAvailable,
} from "../services/wallet-service";
import { logger } from "@/lib/logger";

/**
 * Hook for wallet connection management.
 * Abstracts wallet interaction from component layer.
 */
export function useWallet() {
  const store = useWalletStore();
  const [freighterAvailable, setFreighterAvailable] = useState(false);

  useEffect(() => {
    isFreighterAvailable().then(setFreighterAvailable);
  }, []);

  const connect = useCallback(async () => {
    store.setConnecting(true);
    store.setError(null);

    try {
      const { address, network } = await connectFreighter();
      store.connect(address, "freighter");
      store.setNetwork(network);
      logger.info("Wallet connected successfully", { address });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to connect wallet";
      store.setError(message);
      logger.error("Wallet connection failed", { error: message });
    }
  }, [store]);

  const disconnect = useCallback(() => {
    store.disconnect();
    logger.info("Wallet disconnected");
  }, [store]);

  return {
    address: store.address,
    isConnected: store.isConnected,
    isConnecting: store.isConnecting,
    network: store.network,
    walletType: store.walletType,
    error: store.error,
    freighterAvailable,
    connect,
    disconnect,
  };
}
