use soroban_sdk::{contracttype, Address};

/// Role-based access control roles
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Role {
    Admin,
    Parent,
    Child,
}

/// Allowance distribution interval
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AllowanceInterval {
    Weekly,
    Biweekly,
    Monthly,
}

impl AllowanceInterval {
    /// Returns the interval duration in seconds
    pub fn to_seconds(&self) -> u64 {
        match self {
            AllowanceInterval::Weekly => 7 * 24 * 60 * 60,       // 604800
            AllowanceInterval::Biweekly => 14 * 24 * 60 * 60,    // 1209600
            AllowanceInterval::Monthly => 30 * 24 * 60 * 60,     // 2592000
        }
    }
}

/// Configuration for a child's allowance
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AllowanceConfig {
    pub amount: i128,
    pub interval: AllowanceInterval,
    pub start_time: u64,
    pub is_active: bool,
}

/// Family member record stored in contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FamilyMember {
    pub address: Address,
    pub name: soroban_sdk::String,
    pub role: Role,
    pub created_at: u64,
}

/// Authorization result returned to the Vault contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuthorizationResult {
    pub authorized: bool,
    pub amount: i128,
    pub interval_seconds: u64,
}
