use soroban_sdk::contracterror;

/// Custom error codes for the Governance contract.
/// Each variant maps to a unique u32 error code for on-chain error reporting.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum GovernanceError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
    /// Caller does not have the required role/permission
    Unauthorized = 3,
    /// The specified parent address is not registered
    ParentNotFound = 4,
    /// The specified child address is not registered under this parent
    ChildNotFound = 5,
    /// The child address is already registered
    ChildAlreadyExists = 6,
    /// The parent address is already registered
    ParentAlreadyExists = 7,
    /// The family operations are currently paused
    FamilyPaused = 8,
    /// The allowance amount is invalid (zero or negative)
    InvalidAllowanceAmount = 9,
    /// The allowance interval is invalid
    InvalidInterval = 10,
    /// Maximum number of children per parent exceeded
    MaxChildrenExceeded = 11,
    /// The vault contract address has not been set
    VaultNotSet = 12,
}
