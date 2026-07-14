import * as StellarSdk from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "./constants";

/** Get a configured Soroban RPC server instance */
export function getRpcServer(): StellarSdk.rpc.Server {
  return new StellarSdk.rpc.Server(STELLAR_CONFIG.rpcUrl, {
    allowHttp: STELLAR_CONFIG.rpcUrl.startsWith("http://"),
  });
}

/** Get the network passphrase */
export function getNetworkPassphrase(): string {
  return STELLAR_CONFIG.networkPassphrase;
}

/** Build and prepare a Soroban transaction */
export async function buildTransaction(
  sourcePublicKey: string,
  operations: StellarSdk.xdr.Operation[]
): Promise<StellarSdk.Transaction> {
  const server = getRpcServer();
  const account = await server.getAccount(sourcePublicKey);

  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  });

  operations.forEach((op) => builder.addOperation(op));

  const tx = builder.setTimeout(300).build();
  return tx;
}

/** Submit a signed transaction to the network */
export async function submitTransaction(
  signedTx: StellarSdk.Transaction
): Promise<StellarSdk.rpc.Api.GetTransactionResponse> {
  const server = getRpcServer();
  const result = await server.sendTransaction(signedTx);

  if (result.status === "PENDING") {
    // Poll for completion
    let response = await server.getTransaction(result.hash);
    while (response.status === "NOT_FOUND") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = await server.getTransaction(result.hash);
    }
    return response;
  }

  throw new Error(`Transaction submission failed: ${result.status}`);
}
