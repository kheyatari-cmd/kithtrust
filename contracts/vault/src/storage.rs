use soroban_sdk::{contracttype, Address};

/// Storage keys for the Vault contract.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Instance: Admin address
    Admin,
    /// Instance: Whether initialized
    Initialized,
    /// Instance: Governance contract address
    GovernanceContract,
    /// Persistent: Parent vault balance
    VaultBalance(Address),
    /// Persistent: Child claimable balance
    ClaimableBalance(Address),
    /// Persistent: Last distribution timestamp for a parent-child pair
    LastDistribution(Address, Address),
    /// Persistent: Total distribution count
    DistributionCount,
}

/// TTL constants
pub const PERSISTENT_TTL: u32 = 6_312_000;
pub const PERSISTENT_TTL_BUMP: u32 = 6_312_000;
pub const INSTANCE_TTL: u32 = 6_312_000;
pub const INSTANCE_TTL_BUMP: u32 = 6_312_000;
