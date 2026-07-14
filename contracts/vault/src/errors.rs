use soroban_sdk::contracterror;

/// Custom error codes for the Vault contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VaultError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
    /// Caller does not have the required permission
    Unauthorized = 3,
    /// Deposit amount must be positive
    InvalidDepositAmount = 4,
    /// Insufficient balance in the vault for distribution
    InsufficientBalance = 5,
    /// Distribution not yet due (interval hasn't elapsed)
    DistributionNotDue = 6,
    /// No claimable balance for the child
    NothingToClaim = 7,
    /// The governance contract denied the distribution
    DistributionDenied = 8,
    /// The parent vault has no deposits
    NoDeposits = 9,
    /// Overflow in balance calculation
    Overflow = 10,
}
