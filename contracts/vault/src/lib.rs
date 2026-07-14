#![no_std]

mod errors;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod test;

use errors::VaultError;
use storage::{DataKey, INSTANCE_TTL, INSTANCE_TTL_BUMP, PERSISTENT_TTL, PERSISTENT_TTL_BUMP};
use types::{ClaimableBalance, VaultBalance};

use soroban_sdk::{
    contract, contractimpl, contracttype, vec, Address, BytesN, Env, IntoVal, Symbol,
};

/// AuthorizationResult type — mirrors the Governance contract's return type
/// for the is_distribution_authorized cross-contract call.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuthorizationResult {
    pub authorized: bool,
    pub amount: i128,
    pub interval_seconds: u64,
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    // ========================================================================
    // Initialization
    // ========================================================================

    /// Initialize the vault contract with admin and governance contract address.
    pub fn initialize(
        env: Env,
        admin: Address,
        governance_contract: Address,
    ) -> Result<(), VaultError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(VaultError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage()
            .instance()
            .set(&DataKey::GovernanceContract, &governance_contract);
        env.storage()
            .instance()
            .set(&DataKey::DistributionCount, &0_u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL, INSTANCE_TTL_BUMP);

        Ok(())
    }

    // ========================================================================
    // Deposits
    // ========================================================================

    /// Deposit funds into the family vault. Parent only.
    /// Tracks balances in contract storage.
    pub fn deposit(env: Env, parent: Address, amount: i128) -> Result<(), VaultError> {
        Self::require_initialized(&env)?;
        parent.require_auth();

        if amount <= 0 {
            return Err(VaultError::InvalidDepositAmount);
        }

        let mut balance: VaultBalance = env
            .storage()
            .persistent()
            .get(&DataKey::VaultBalance(parent.clone()))
            .unwrap_or(VaultBalance {
                total_deposited: 0,
                total_distributed: 0,
                available: 0,
            });

        balance.total_deposited = balance
            .total_deposited
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;
        balance.available = balance
            .available
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(parent.clone()), &balance);
        env.storage().persistent().extend_ttl(
            &DataKey::VaultBalance(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        events::emit_deposited(&env, &parent, amount);
        Ok(())
    }

    // ========================================================================
    // Distribution (Inter-Contract Communication)
    // ========================================================================

    /// Distribute allowance from parent vault to child.
    /// Makes a cross-contract call to the Governance contract to verify authorization.
    pub fn distribute(env: Env, parent: Address, child: Address) -> Result<i128, VaultError> {
        Self::require_initialized(&env)?;
        parent.require_auth();

        // Get governance contract address
        let governance_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::GovernanceContract)
            .ok_or(VaultError::NotInitialized)?;

        // ====================================================================
        // INTER-CONTRACT CALL: Query Governance for distribution authorization
        // Uses env.invoke_contract() for runtime cross-contract invocation
        // ====================================================================
        let auth_result: AuthorizationResult = env.invoke_contract(
            &governance_addr,
            &Symbol::new(&env, "is_distribution_authorized"),
            vec![
                &env,
                parent.clone().into_val(&env),
                child.clone().into_val(&env),
            ],
        );

        if !auth_result.authorized {
            return Err(VaultError::DistributionDenied);
        }

        let distribution_amount = auth_result.amount;
        let interval_seconds = auth_result.interval_seconds;

        // Check if enough time has passed since last distribution
        let now = env.ledger().timestamp();
        let last_dist: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::LastDistribution(parent.clone(), child.clone()))
            .unwrap_or(0);

        if last_dist > 0 && now < last_dist + interval_seconds {
            return Err(VaultError::DistributionNotDue);
        }

        // Check vault balance
        let mut vault_balance: VaultBalance = env
            .storage()
            .persistent()
            .get(&DataKey::VaultBalance(parent.clone()))
            .ok_or(VaultError::NoDeposits)?;

        if vault_balance.available < distribution_amount {
            return Err(VaultError::InsufficientBalance);
        }

        // Deduct from vault
        vault_balance.available -= distribution_amount;
        vault_balance.total_distributed += distribution_amount;
        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(parent.clone()), &vault_balance);
        env.storage().persistent().extend_ttl(
            &DataKey::VaultBalance(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Add to child's claimable balance
        let mut claimable: ClaimableBalance = env
            .storage()
            .persistent()
            .get(&DataKey::ClaimableBalance(child.clone()))
            .unwrap_or(ClaimableBalance {
                amount: 0,
                last_claimed: 0,
            });
        claimable.amount += distribution_amount;
        env.storage()
            .persistent()
            .set(&DataKey::ClaimableBalance(child.clone()), &claimable);
        env.storage().persistent().extend_ttl(
            &DataKey::ClaimableBalance(child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Update last distribution time
        env.storage().persistent().set(
            &DataKey::LastDistribution(parent.clone(), child.clone()),
            &now,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::LastDistribution(parent.clone(), child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Increment distribution count
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::DistributionCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::DistributionCount, &(count + 1));

        events::emit_distributed(&env, &parent, &child, distribution_amount);
        Ok(distribution_amount)
    }

    // ========================================================================
    // Claims
    // ========================================================================

    /// Claim available balance. Child only.
    pub fn claim(env: Env, child: Address) -> Result<i128, VaultError> {
        Self::require_initialized(&env)?;
        child.require_auth();

        let mut claimable: ClaimableBalance = env
            .storage()
            .persistent()
            .get(&DataKey::ClaimableBalance(child.clone()))
            .ok_or(VaultError::NothingToClaim)?;

        if claimable.amount <= 0 {
            return Err(VaultError::NothingToClaim);
        }

        let claim_amount = claimable.amount;
        claimable.amount = 0;
        claimable.last_claimed = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::ClaimableBalance(child.clone()), &claimable);
        env.storage().persistent().extend_ttl(
            &DataKey::ClaimableBalance(child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        events::emit_claimed(&env, &child, claim_amount);
        Ok(claim_amount)
    }

    // ========================================================================
    // Emergency Withdrawal
    // ========================================================================

    /// Emergency withdraw all available funds from vault. Parent only.
    pub fn emergency_withdraw(env: Env, parent: Address) -> Result<i128, VaultError> {
        Self::require_initialized(&env)?;
        parent.require_auth();

        let mut vault_balance: VaultBalance = env
            .storage()
            .persistent()
            .get(&DataKey::VaultBalance(parent.clone()))
            .ok_or(VaultError::NoDeposits)?;

        if vault_balance.available <= 0 {
            return Err(VaultError::InsufficientBalance);
        }

        let withdraw_amount = vault_balance.available;
        vault_balance.available = 0;

        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(parent.clone()), &vault_balance);

        events::emit_emergency_withdrawal(&env, &parent, withdraw_amount);
        Ok(withdraw_amount)
    }

    // ========================================================================
    // Query Functions
    // ========================================================================

    /// Get the vault balance for a parent
    pub fn get_balance(env: Env, parent: Address) -> VaultBalance {
        env.storage()
            .persistent()
            .get(&DataKey::VaultBalance(parent))
            .unwrap_or(VaultBalance {
                total_deposited: 0,
                total_distributed: 0,
                available: 0,
            })
    }

    /// Get the claimable balance for a child
    pub fn get_claimable(env: Env, child: Address) -> ClaimableBalance {
        env.storage()
            .persistent()
            .get(&DataKey::ClaimableBalance(child))
            .unwrap_or(ClaimableBalance {
                amount: 0,
                last_claimed: 0,
            })
    }

    /// Get the last distribution timestamp for a parent-child pair
    pub fn get_last_distribution(env: Env, parent: Address, child: Address) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::LastDistribution(parent, child))
            .unwrap_or(0)
    }

    /// Get the total distribution count
    pub fn get_distribution_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::DistributionCount)
            .unwrap_or(0)
    }

    // ========================================================================
    // Upgrade
    // ========================================================================

    /// Upgrade the contract. Admin only.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), VaultError> {
        let admin = Self::require_admin(&env)?;
        admin.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    // ========================================================================
    // Internal Helpers
    // ========================================================================

    fn require_initialized(env: &Env) -> Result<(), VaultError> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(VaultError::NotInitialized);
        }
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL, INSTANCE_TTL_BUMP);
        Ok(())
    }

    fn require_admin(env: &Env) -> Result<Address, VaultError> {
        Self::require_initialized(env)?;
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(VaultError::NotInitialized)
    }
}
