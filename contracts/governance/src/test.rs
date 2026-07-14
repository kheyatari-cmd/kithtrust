#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};
use types::{AllowanceInterval, Role};

fn setup_contract(env: &Env) -> (Address, GovernanceContractClient) {
    let contract_id = env.register(GovernanceContract, ());
    let client = GovernanceContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    (admin, client)
}

fn initialize_contract(env: &Env) -> (Address, Address, GovernanceContractClient) {
    let (admin, client) = setup_contract(env);

    env.mock_all_auths();
    client.initialize(&admin);

    let parent = Address::generate(env);
    client.add_parent(&parent, &String::from_str(env, "Alice"));

    (admin, parent, client)
}

// ============================================================================
// Test 1: Initialization & RBAC
// ============================================================================

#[test]
fn test_initialize_and_roles() {
    let env = Env::default();
    let (admin, client) = setup_contract(&env);

    env.mock_all_auths();

    // Initialize should succeed
    client.initialize(&admin);

    // Admin role should be set
    let role = client.get_role(&admin);
    assert_eq!(role, Some(Role::Admin));

    // Unknown address should have no role
    let unknown = Address::generate(&env);
    let role = client.get_role(&unknown);
    assert_eq!(role, None);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_double_initialize_fails() {
    let env = Env::default();
    let (admin, client) = setup_contract(&env);

    env.mock_all_auths();

    client.initialize(&admin);
    client.initialize(&admin); // Should panic with AlreadyInitialized
}

// ============================================================================
// Test 2: Parent & Child Management
// ============================================================================

#[test]
fn test_add_parent_and_child() {
    let env = Env::default();
    let (admin, parent, client) = initialize_contract(&env);

    // Parent role should be set
    let role = client.get_role(&parent);
    assert_eq!(role, Some(Role::Parent));

    // Add a child
    let child = Address::generate(&env);
    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Bob"),
        &1000_i128,
        &AllowanceInterval::Weekly,
    );

    // Child role should be set
    let role = client.get_role(&child);
    assert_eq!(role, Some(Role::Child));

    // Children list should contain the child
    let children = client.get_children(&parent);
    assert_eq!(children.len(), 1);
    assert_eq!(children.get(0).unwrap(), child);

    // Parent-of mapping should be set
    let parent_of = client.get_parent_of(&child);
    assert_eq!(parent_of, Some(parent.clone()));

    // Allowance config should be set
    let config = client.get_allowance_config(&parent, &child);
    assert!(config.is_some());
    let config = config.unwrap();
    assert_eq!(config.amount, 1000_i128);
    assert_eq!(config.interval, AllowanceInterval::Weekly);
    assert!(config.is_active);
}

#[test]
fn test_remove_child() {
    let env = Env::default();
    let (_admin, parent, client) = initialize_contract(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Bob"),
        &500_i128,
        &AllowanceInterval::Monthly,
    );

    // Remove child
    client.remove_child(&parent, &child);

    // Child should no longer have a role
    let role = client.get_role(&child);
    assert_eq!(role, None);

    // Children list should be empty
    let children = client.get_children(&parent);
    assert_eq!(children.len(), 0);
}

// ============================================================================
// Test 3: Allowance Configuration & Authorization
// ============================================================================

#[test]
fn test_set_allowance_and_authorization() {
    let env = Env::default();
    let (_admin, parent, client) = initialize_contract(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Charlie"),
        &200_i128,
        &AllowanceInterval::Weekly,
    );

    // Update allowance
    client.set_allowance(&parent, &child, &500_i128, &AllowanceInterval::Biweekly);

    // Verify updated config
    let config = client.get_allowance_config(&parent, &child).unwrap();
    assert_eq!(config.amount, 500_i128);
    assert_eq!(config.interval, AllowanceInterval::Biweekly);

    // Test authorization check (used by Vault contract)
    let auth_result = client.is_distribution_authorized(&parent, &child);
    assert!(auth_result.authorized);
    assert_eq!(auth_result.amount, 500_i128);
    assert_eq!(auth_result.interval_seconds, 14 * 24 * 60 * 60);
}

#[test]
fn test_pause_blocks_authorization() {
    let env = Env::default();
    let (_admin, parent, client) = initialize_contract(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Diana"),
        &300_i128,
        &AllowanceInterval::Weekly,
    );

    // Pause family
    client.pause_family(&parent, &parent, &true);
    assert!(client.is_family_paused(&parent));

    // Authorization should fail when paused
    let auth_result = client.is_distribution_authorized(&parent, &child);
    assert!(!auth_result.authorized);
    assert_eq!(auth_result.amount, 0);

    // Unpause and verify authorization works again
    client.pause_family(&parent, &parent, &false);
    let auth_result = client.is_distribution_authorized(&parent, &child);
    assert!(auth_result.authorized);
    assert_eq!(auth_result.amount, 300_i128);
}

// ============================================================================
// Test 4: Error cases
// ============================================================================

#[test]
#[should_panic(expected = "Error(Contract, #9)")]
fn test_invalid_allowance_amount() {
    let env = Env::default();
    let (_admin, parent, client) = initialize_contract(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    // Zero amount should fail
    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Eve"),
        &0_i128,
        &AllowanceInterval::Weekly,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_duplicate_child_fails() {
    let env = Env::default();
    let (_admin, parent, client) = initialize_contract(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Frank"),
        &100_i128,
        &AllowanceInterval::Weekly,
    );

    // Adding same child again should fail
    client.add_child(
        &parent,
        &child,
        &String::from_str(&env, "Frank"),
        &200_i128,
        &AllowanceInterval::Monthly,
    );
}
