use soroban_sdk::{Address, Env, Symbol};

/// Emit event when funds are deposited into the vault
pub fn emit_deposited(env: &Env, parent: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "deposited"),),
        (parent.clone(), amount),
    );
}

/// Emit event when allowance is distributed to a child
pub fn emit_distributed(env: &Env, parent: &Address, child: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "distributed"),),
        (parent.clone(), child.clone(), amount),
    );
}

/// Emit event when a child claims their balance
pub fn emit_claimed(env: &Env, child: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "claimed"),),
        (child.clone(), amount),
    );
}

/// Emit event for emergency withdrawal
pub fn emit_emergency_withdrawal(env: &Env, parent: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "emergency"),),
        (parent.clone(), amount),
    );
}
