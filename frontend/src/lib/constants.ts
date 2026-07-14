/** Stellar network constants */
export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
    "https://soroban-testnet.stellar.org",
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  governanceContractId:
    process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID || "",
  vaultContractId:
    process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || "",
  explorerUrl:
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    "https://stellar.expert/explorer/testnet",
} as const;

/** Allowance interval options */
export const ALLOWANCE_INTERVALS = [
  { value: "Weekly", label: "Weekly", seconds: 604800 },
  { value: "Biweekly", label: "Bi-weekly", seconds: 1209600 },
  { value: "Monthly", label: "Monthly", seconds: 2592000 },
] as const;

/** Transaction status */
export type TransactionStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed";

/** Event types emitted by contracts */
export const EVENT_TYPES = {
  INITIALIZED: "init",
  PARENT_ADDED: "parent_added",
  CHILD_ADDED: "child_added",
  CHILD_REMOVED: "child_removed",
  ALLOWANCE_UPDATED: "allow_upd",
  FAMILY_PAUSED: "fam_pause",
  VAULT_LINKED: "vault_link",
  DEPOSITED: "deposited",
  DISTRIBUTED: "distributed",
  CLAIMED: "claimed",
  EMERGENCY: "emergency",
} as const;

/** Event type to human-readable label mapping */
export const EVENT_LABELS: Record<string, string> = {
  [EVENT_TYPES.INITIALIZED]: "Contract Initialized",
  [EVENT_TYPES.PARENT_ADDED]: "Parent Added",
  [EVENT_TYPES.CHILD_ADDED]: "Child Added",
  [EVENT_TYPES.CHILD_REMOVED]: "Child Removed",
  [EVENT_TYPES.ALLOWANCE_UPDATED]: "Allowance Updated",
  [EVENT_TYPES.FAMILY_PAUSED]: "Family Status Changed",
  [EVENT_TYPES.VAULT_LINKED]: "Vault Linked",
  [EVENT_TYPES.DEPOSITED]: "Funds Deposited",
  [EVENT_TYPES.DISTRIBUTED]: "Allowance Distributed",
  [EVENT_TYPES.CLAIMED]: "Funds Claimed",
  [EVENT_TYPES.EMERGENCY]: "Emergency Withdrawal",
};
