use soroban_sdk::{contracttype, Address};

/// Storage keys for the Governance contract.
/// Uses Soroban's three storage tiers:
/// - Instance: Contract-wide config (survives upgrades)
/// - Persistent: Long-lived data (family mappings, roles)
/// - Temporary: Short-lived data (rate limits)
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Instance storage: Admin address
    Admin,
    /// Instance storage: Whether the contract is initialized
    Initialized,
    /// Instance storage: Vault contract address
    VaultContract,
    /// Instance storage: Global pause flag
    GlobalPaused,
    /// Instance storage: Max children per parent
    MaxChildren,
    /// Persistent storage: Role for an address
    Role(Address),
    /// Persistent storage: List of children for a parent
    Children(Address),
    /// Persistent storage: Allowance config for a parent-child pair
    AllowanceConfig(Address, Address),
    /// Persistent storage: Family pause status per parent
    FamilyPaused(Address),
    /// Persistent storage: Parent address for a child
    ParentOf(Address),
}

/// Default TTL for persistent storage (about 1 year in ledgers)
pub const PERSISTENT_TTL: u32 = 6_312_000;
/// Default TTL bump amount
pub const PERSISTENT_TTL_BUMP: u32 = 6_312_000;
/// Instance TTL
pub const INSTANCE_TTL: u32 = 6_312_000;
/// Instance TTL bump
pub const INSTANCE_TTL_BUMP: u32 = 6_312_000;
/// Maximum children per parent
pub const MAX_CHILDREN_DEFAULT: u32 = 10;
