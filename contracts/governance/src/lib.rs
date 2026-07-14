#![no_std]

mod errors;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod test;

use errors::GovernanceError;
use storage::{
    DataKey, INSTANCE_TTL, INSTANCE_TTL_BUMP, MAX_CHILDREN_DEFAULT, PERSISTENT_TTL,
    PERSISTENT_TTL_BUMP,
};
use types::{AllowanceConfig, AllowanceInterval, AuthorizationResult, Role};

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String, Vec};

#[contract]
pub struct GovernanceContract;

#[contractimpl]
impl GovernanceContract {
    // ========================================================================
    // Initialization
    // ========================================================================

    /// Initialize the governance contract with an admin address.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), GovernanceError> {
        // Ensure not already initialized
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(GovernanceError::AlreadyInitialized);
        }

        admin.require_auth();

        // Store admin and initialization flag
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage().instance().set(&DataKey::GlobalPaused, &false);
        env.storage()
            .instance()
            .set(&DataKey::MaxChildren, &MAX_CHILDREN_DEFAULT);

        // Set admin role
        env.storage()
            .persistent()
            .set(&DataKey::Role(admin.clone()), &Role::Admin);

        // Extend TTLs
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL, INSTANCE_TTL_BUMP);

        events::emit_initialized(&env, &admin);
        Ok(())
    }

    /// Set the vault contract address. Admin only.
    pub fn set_vault(env: Env, vault_contract: Address) -> Result<(), GovernanceError> {
        let admin = Self::require_admin(&env)?;
        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::VaultContract, &vault_contract);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL, INSTANCE_TTL_BUMP);

        events::emit_vault_linked(&env, &vault_contract);
        Ok(())
    }

    // ========================================================================
    // Parent Management
    // ========================================================================

    /// Register a new parent. Admin only.
    pub fn add_parent(env: Env, parent: Address, name: String) -> Result<(), GovernanceError> {
        let admin = Self::require_admin(&env)?;
        admin.require_auth();

        // Check if parent already exists
        if env
            .storage()
            .persistent()
            .has(&DataKey::Role(parent.clone()))
        {
            return Err(GovernanceError::ParentAlreadyExists);
        }

        // Set parent role
        env.storage()
            .persistent()
            .set(&DataKey::Role(parent.clone()), &Role::Parent);
        env.storage().persistent().extend_ttl(
            &DataKey::Role(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Initialize empty children list
        let children: Vec<Address> = Vec::new(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Children(parent.clone()), &children);
        env.storage().persistent().extend_ttl(
            &DataKey::Children(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Initialize family pause to false
        env.storage()
            .persistent()
            .set(&DataKey::FamilyPaused(parent.clone()), &false);

        // Store name (we use the name parameter for event data, the role assignment is what matters)
        let _ = name;

        events::emit_parent_added(&env, &admin, &parent);
        Ok(())
    }

    // ========================================================================
    // Child Management
    // ========================================================================

    /// Add a child to a parent's family with allowance configuration.
    pub fn add_child(
        env: Env,
        parent: Address,
        child: Address,
        child_name: String,
        amount: i128,
        interval: AllowanceInterval,
    ) -> Result<(), GovernanceError> {
        Self::require_initialized(&env)?;
        parent.require_auth();
        Self::require_role(&env, &parent, &Role::Parent)?;

        // Validate allowance amount
        if amount <= 0 {
            return Err(GovernanceError::InvalidAllowanceAmount);
        }

        // Check if child already exists
        if env
            .storage()
            .persistent()
            .has(&DataKey::Role(child.clone()))
        {
            return Err(GovernanceError::ChildAlreadyExists);
        }

        // Check max children limit
        let mut children: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Children(parent.clone()))
            .unwrap_or(Vec::new(&env));

        let max_children: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MaxChildren)
            .unwrap_or(MAX_CHILDREN_DEFAULT);

        if children.len() >= max_children {
            return Err(GovernanceError::MaxChildrenExceeded);
        }

        // Set child role
        env.storage()
            .persistent()
            .set(&DataKey::Role(child.clone()), &Role::Child);
        env.storage().persistent().extend_ttl(
            &DataKey::Role(child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Map child to parent
        env.storage()
            .persistent()
            .set(&DataKey::ParentOf(child.clone()), &parent);
        env.storage().persistent().extend_ttl(
            &DataKey::ParentOf(child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Store allowance config
        let config = AllowanceConfig {
            amount,
            interval,
            start_time: env.ledger().timestamp(),
            is_active: true,
        };
        env.storage().persistent().set(
            &DataKey::AllowanceConfig(parent.clone(), child.clone()),
            &config,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::AllowanceConfig(parent.clone(), child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Add child to parent's children list
        children.push_back(child.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Children(parent.clone()), &children);
        env.storage().persistent().extend_ttl(
            &DataKey::Children(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        // Use child_name for event (stored implicitly via the event)
        let _ = child_name;

        events::emit_child_added(&env, &parent, &child, amount);
        Ok(())
    }

    /// Remove a child from a parent's family. Parent only.
    pub fn remove_child(env: Env, parent: Address, child: Address) -> Result<(), GovernanceError> {
        Self::require_initialized(&env)?;
        parent.require_auth();
        Self::require_role(&env, &parent, &Role::Parent)?;

        // Verify child belongs to parent
        let parent_of: Address = env
            .storage()
            .persistent()
            .get(&DataKey::ParentOf(child.clone()))
            .ok_or(GovernanceError::ChildNotFound)?;

        if parent_of != parent {
            return Err(GovernanceError::Unauthorized);
        }

        // Remove child from children list
        let children: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Children(parent.clone()))
            .unwrap_or(Vec::new(&env));

        let mut new_children: Vec<Address> = Vec::new(&env);
        for c in children.iter() {
            if c != child {
                new_children.push_back(c);
            }
        }
        env.storage()
            .persistent()
            .set(&DataKey::Children(parent.clone()), &new_children);

        // Remove child role and mappings
        env.storage()
            .persistent()
            .remove(&DataKey::Role(child.clone()));
        env.storage()
            .persistent()
            .remove(&DataKey::ParentOf(child.clone()));
        env.storage()
            .persistent()
            .remove(&DataKey::AllowanceConfig(parent.clone(), child.clone()));

        events::emit_child_removed(&env, &parent, &child);
        Ok(())
    }

    // ========================================================================
    // Allowance Configuration
    // ========================================================================

    /// Update a child's allowance configuration. Parent only.
    pub fn set_allowance(
        env: Env,
        parent: Address,
        child: Address,
        amount: i128,
        interval: AllowanceInterval,
    ) -> Result<(), GovernanceError> {
        Self::require_initialized(&env)?;
        parent.require_auth();
        Self::require_role(&env, &parent, &Role::Parent)?;

        if amount <= 0 {
            return Err(GovernanceError::InvalidAllowanceAmount);
        }

        // Verify child belongs to parent
        let parent_of: Address = env
            .storage()
            .persistent()
            .get(&DataKey::ParentOf(child.clone()))
            .ok_or(GovernanceError::ChildNotFound)?;

        if parent_of != parent {
            return Err(GovernanceError::Unauthorized);
        }

        // Update config, preserving start_time
        let existing: AllowanceConfig = env
            .storage()
            .persistent()
            .get(&DataKey::AllowanceConfig(parent.clone(), child.clone()))
            .ok_or(GovernanceError::ChildNotFound)?;

        let config = AllowanceConfig {
            amount,
            interval,
            start_time: existing.start_time,
            is_active: existing.is_active,
        };

        env.storage().persistent().set(
            &DataKey::AllowanceConfig(parent.clone(), child.clone()),
            &config,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::AllowanceConfig(parent.clone(), child.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        events::emit_allowance_updated(&env, &parent, &child, amount);
        Ok(())
    }

    // ========================================================================
    // Family Controls
    // ========================================================================

    /// Pause or unpause a family's allowance distributions. Parent or Admin only.
    pub fn pause_family(
        env: Env,
        caller: Address,
        parent: Address,
        paused: bool,
    ) -> Result<(), GovernanceError> {
        Self::require_initialized(&env)?;
        caller.require_auth();

        // Allow admin or the parent themselves
        let role: Role = env
            .storage()
            .persistent()
            .get(&DataKey::Role(caller.clone()))
            .ok_or(GovernanceError::Unauthorized)?;

        match role {
            Role::Admin => {}
            Role::Parent => {
                if caller != parent {
                    return Err(GovernanceError::Unauthorized);
                }
            }
            Role::Child => return Err(GovernanceError::Unauthorized),
        }

        env.storage()
            .persistent()
            .set(&DataKey::FamilyPaused(parent.clone()), &paused);
        env.storage().persistent().extend_ttl(
            &DataKey::FamilyPaused(parent.clone()),
            PERSISTENT_TTL,
            PERSISTENT_TTL_BUMP,
        );

        events::emit_family_paused(&env, &parent, paused);
        Ok(())
    }

    // ========================================================================
    // Inter-Contract Communication — Called by Vault
    // ========================================================================

    /// Check if a distribution is authorized for a parent-child pair.
    /// Called by the Vault contract during distribution.
    /// Returns authorization result with amount and interval.
    pub fn is_distribution_authorized(
        env: Env,
        parent: Address,
        child: Address,
    ) -> Result<AuthorizationResult, GovernanceError> {
        Self::require_initialized(&env)?;

        // Check global pause
        let global_paused: bool = env
            .storage()
            .instance()
            .get(&DataKey::GlobalPaused)
            .unwrap_or(false);
        if global_paused {
            return Ok(AuthorizationResult {
                authorized: false,
                amount: 0,
                interval_seconds: 0,
            });
        }

        // Check family pause
        let family_paused: bool = env
            .storage()
            .persistent()
            .get(&DataKey::FamilyPaused(parent.clone()))
            .unwrap_or(false);
        if family_paused {
            return Ok(AuthorizationResult {
                authorized: false,
                amount: 0,
                interval_seconds: 0,
            });
        }

        // Verify parent role
        let parent_role: Role = env
            .storage()
            .persistent()
            .get(&DataKey::Role(parent.clone()))
            .ok_or(GovernanceError::ParentNotFound)?;
        if parent_role != Role::Parent {
            return Err(GovernanceError::ParentNotFound);
        }

        // Verify child belongs to parent
        let parent_of: Address = env
            .storage()
            .persistent()
            .get(&DataKey::ParentOf(child.clone()))
            .ok_or(GovernanceError::ChildNotFound)?;
        if parent_of != parent {
            return Err(GovernanceError::ChildNotFound);
        }

        // Get allowance config
        let config: AllowanceConfig = env
            .storage()
            .persistent()
            .get(&DataKey::AllowanceConfig(parent.clone(), child.clone()))
            .ok_or(GovernanceError::ChildNotFound)?;

        if !config.is_active {
            return Ok(AuthorizationResult {
                authorized: false,
                amount: 0,
                interval_seconds: 0,
            });
        }

        Ok(AuthorizationResult {
            authorized: true,
            amount: config.amount,
            interval_seconds: config.interval.to_seconds(),
        })
    }

    // ========================================================================
    // Query Functions
    // ========================================================================

    /// Get the role of an address
    pub fn get_role(env: Env, addr: Address) -> Option<Role> {
        env.storage().persistent().get(&DataKey::Role(addr))
    }

    /// Get the list of children for a parent
    pub fn get_children(env: Env, parent: Address) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Children(parent))
            .unwrap_or(Vec::new(&env))
    }

    /// Get allowance configuration for a parent-child pair
    pub fn get_allowance_config(
        env: Env,
        parent: Address,
        child: Address,
    ) -> Option<AllowanceConfig> {
        env.storage()
            .persistent()
            .get(&DataKey::AllowanceConfig(parent, child))
    }

    /// Check if a family is paused
    pub fn is_family_paused(env: Env, parent: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::FamilyPaused(parent))
            .unwrap_or(false)
    }

    /// Get the admin address
    pub fn get_admin(env: Env) -> Result<Address, GovernanceError> {
        Self::require_admin(&env)
    }

    /// Get the parent of a child
    pub fn get_parent_of(env: Env, child: Address) -> Option<Address> {
        env.storage().persistent().get(&DataKey::ParentOf(child))
    }

    // ========================================================================
    // Upgrade
    // ========================================================================

    /// Upgrade the contract. Admin only.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), GovernanceError> {
        let admin = Self::require_admin(&env)?;
        admin.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    // ========================================================================
    // Internal Helpers
    // ========================================================================

    fn require_initialized(env: &Env) -> Result<(), GovernanceError> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(GovernanceError::NotInitialized);
        }
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL, INSTANCE_TTL_BUMP);
        Ok(())
    }

    fn require_admin(env: &Env) -> Result<Address, GovernanceError> {
        Self::require_initialized(env)?;
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(GovernanceError::NotInitialized)
    }

    fn require_role(env: &Env, addr: &Address, expected: &Role) -> Result<(), GovernanceError> {
        let role: Role = env
            .storage()
            .persistent()
            .get(&DataKey::Role(addr.clone()))
            .ok_or(GovernanceError::Unauthorized)?;
        if &role != expected {
            return Err(GovernanceError::Unauthorized);
        }
        Ok(())
    }
}
