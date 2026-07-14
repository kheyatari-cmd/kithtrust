import { logger } from "@/lib/logger";

/**
 * Wallet service abstraction layer.
 * Handles connection to Stellar wallets (Freighter, etc.)
 * No blockchain logic in components — all wallet interaction goes through here.
 */

/** Check if Freighter wallet extension is available */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // @ts-expect-error - Freighter injects into window
  return !!window.freighterApi;
}

/** Connect to Freighter wallet */
export async function connectFreighter(): Promise<{
  address: string;
  network: string;
}> {
  if (typeof window === "undefined") {
    throw new Error("Cannot connect wallet on server side");
  }

  // @ts-expect-error - Freighter API
  const freighterApi = window.freighterApi;
  if (!freighterApi) {
    throw new Error(
      "Freighter wallet extension is not installed. Please install it from https://freighter.app"
    );
  }

  try {
    // Request access
    const accessObj = await freighterApi.requestAccess();
    if (accessObj.error) {
      throw new Error(accessObj.error);
    }

    // Get public key
    const addressObj = await freighterApi.getAddress();
    if (addressObj.error) {
      throw new Error(addressObj.error);
    }

    // Get network
    const networkObj = await freighterApi.getNetwork();

    logger.info("Wallet connected", {
      address: addressObj.address,
      network: networkObj.network || "testnet",
    });

    return {
      address: addressObj.address,
      network: networkObj.network || "testnet",
    };
  } catch (error) {
    logger.error("Failed to connect Freighter", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/** Sign a transaction with Freighter */
export async function signTransaction(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Cannot sign on server side");
  }

  // @ts-expect-error - Freighter API
  const freighterApi = window.freighterApi;
  if (!freighterApi) {
    throw new Error("Freighter wallet not available");
  }

  try {
    const result = await freighterApi.signTransaction(xdr, {
      networkPassphrase,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    logger.info("Transaction signed");
    return result.signedTxXdr;
  } catch (error) {
    logger.error("Failed to sign transaction", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/** Get the list of supported wallets */
export function getSupportedWallets() {
  return [
    {
      id: "freighter",
      name: "Freighter",
      icon: "🦊",
      description: "Stellar wallet browser extension",
      url: "https://freighter.app",
    },
  ];
}
