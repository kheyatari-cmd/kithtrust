use soroban_sdk::contracttype;

/// Deposit record for a parent's vault
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultBalance {
    pub total_deposited: i128,
    pub total_distributed: i128,
    pub available: i128,
}

/// Claimable balance record for a child
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ClaimableBalance {
    pub amount: i128,
    pub last_claimed: u64,
}

/// Distribution record
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DistributionRecord {
    pub amount: i128,
    pub timestamp: u64,
}
