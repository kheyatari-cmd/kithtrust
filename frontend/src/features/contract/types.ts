/** Contract interaction types */

export interface AllowanceConfig {
  amount: number;
  interval: "Weekly" | "Biweekly" | "Monthly";
  startTime: number;
  isActive: boolean;
}

export interface VaultBalance {
  totalDeposited: number;
  totalDistributed: number;
  available: number;
}

export interface ClaimableBalance {
  amount: number;
  lastClaimed: number;
}

export interface AuthorizationResult {
  authorized: boolean;
  amount: number;
  intervalSeconds: number;
}

export interface ContractEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  txHash: string;
  contractId: string;
}
