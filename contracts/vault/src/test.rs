#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};
use types::ClaimableBalance;

// ============================================================================
// Since the Vault contract uses inter-contract calls to the Governance contract
// in the distribute() function, we test the Vault independently for deposit,
// claim, and balance operations, and use the Governance contract for the
// full integration flow.
// ============================================================================

fn setup_vault(env: &Env) -> (Address, Address, VaultContractClient<'_>) {
    let contract_id = env.register(VaultContract, ());
    let client = VaultContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let governance = Address::generate(env);

    env.mock_all_auths();
    client.initialize(&admin, &governance);

    (admin, governance, client)
}

// ============================================================================
// Test 1: Initialization & Deposit
// ============================================================================

#[test]
fn test_initialize_and_deposit() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    // Deposit funds
    client.deposit(&parent, &10_000_i128);

    // Check balance
    let balance = client.get_balance(&parent);
    assert_eq!(balance.total_deposited, 10_000_i128);
    assert_eq!(balance.available, 10_000_i128);
    assert_eq!(balance.total_distributed, 0_i128);
}

#[test]
fn test_multiple_deposits() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    client.deposit(&parent, &5_000_i128);
    client.deposit(&parent, &3_000_i128);

    let balance = client.get_balance(&parent);
    assert_eq!(balance.total_deposited, 8_000_i128);
    assert_eq!(balance.available, 8_000_i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_double_initialize_fails() {
    let env = Env::default();
    let contract_id = env.register(VaultContract, ());
    let client = VaultContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let governance = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin, &governance);
    client.initialize(&admin, &governance); // Should fail
}

// ============================================================================
// Test 2: Claim Operations
// ============================================================================

#[test]
fn test_claim_with_balance() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    // Manually set a claimable balance for testing claim functionality
    // In production, this would be set by distribute()
    env.as_contract(&client.address, || {
        let claimable = ClaimableBalance {
            amount: 500_i128,
            last_claimed: 0,
        };
        env.storage()
            .persistent()
            .set(&DataKey::ClaimableBalance(child.clone()), &claimable);
    });

    // Claim
    let claimed = client.claim(&child);
    assert_eq!(claimed, 500_i128);

    // Verify balance is now zero
    let claimable = client.get_claimable(&child);
    assert_eq!(claimable.amount, 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn test_claim_with_no_balance() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let child = Address::generate(&env);
    env.mock_all_auths();

    // Trying to claim with no balance should fail
    client.claim(&child);
}

// ============================================================================
// Test 3: Emergency Withdrawal
// ============================================================================

#[test]
fn test_emergency_withdraw() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    // Deposit funds
    client.deposit(&parent, &10_000_i128);

    // Emergency withdraw
    let withdrawn = client.emergency_withdraw(&parent);
    assert_eq!(withdrawn, 10_000_i128);

    // Balance should be zero available
    let balance = client.get_balance(&parent);
    assert_eq!(balance.available, 0_i128);
    assert_eq!(balance.total_deposited, 10_000_i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_emergency_withdraw_no_funds() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    // Deposit and withdraw everything
    client.deposit(&parent, &1000_i128);
    client.emergency_withdraw(&parent);

    // Second withdrawal should fail
    client.emergency_withdraw(&parent);
}

// ============================================================================
// Test 4: Invalid Deposit
// ============================================================================

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_invalid_deposit_amount() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    // Zero deposit should fail
    client.deposit(&parent, &0_i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_negative_deposit_amount() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let parent = Address::generate(&env);
    env.mock_all_auths();

    // Negative deposit should fail
    client.deposit(&parent, &-100_i128);
}

// ============================================================================
// Test 5: Query Functions
// ============================================================================

#[test]
fn test_query_default_values() {
    let env = Env::default();
    let (_admin, _governance, client) = setup_vault(&env);

    let unknown = Address::generate(&env);

    // Default vault balance
    let balance = client.get_balance(&unknown);
    assert_eq!(balance.total_deposited, 0);
    assert_eq!(balance.total_distributed, 0);
    assert_eq!(balance.available, 0);

    // Default claimable balance
    let claimable = client.get_claimable(&unknown);
    assert_eq!(claimable.amount, 0);
    assert_eq!(claimable.last_claimed, 0);

    // Default last distribution
    let last_dist = client.get_last_distribution(&unknown, &Address::generate(&env));
    assert_eq!(last_dist, 0);

    // Default distribution count
    let count = client.get_distribution_count();
    assert_eq!(count, 0);
}
