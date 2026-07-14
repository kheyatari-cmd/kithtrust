use soroban_sdk::{symbol_short, Address, Env, Symbol};

/// Emit event when the contract is initialized
pub fn emit_initialized(env: &Env, admin: &Address) {
    env.events()
        .publish((symbol_short!("init"),), admin.clone());
}

/// Emit event when a parent is added
pub fn emit_parent_added(env: &Env, admin: &Address, parent: &Address) {
    env.events().publish(
        (Symbol::new(env, "parent_added"),),
        (admin.clone(), parent.clone()),
    );
}

/// Emit event when a child is added to a family
pub fn emit_child_added(env: &Env, parent: &Address, child: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "child_added"),),
        (parent.clone(), child.clone(), amount),
    );
}

/// Emit event when a child is removed from a family
pub fn emit_child_removed(env: &Env, parent: &Address, child: &Address) {
    env.events().publish(
        (Symbol::new(env, "child_removed"),),
        (parent.clone(), child.clone()),
    );
}

/// Emit event when allowance configuration is updated
pub fn emit_allowance_updated(env: &Env, parent: &Address, child: &Address, amount: i128) {
    env.events().publish(
        (Symbol::new(env, "allow_upd"),),
        (parent.clone(), child.clone(), amount),
    );
}

/// Emit event when a family is paused/unpaused
pub fn emit_family_paused(env: &Env, parent: &Address, paused: bool) {
    env.events()
        .publish((Symbol::new(env, "fam_pause"),), (parent.clone(), paused));
}

/// Emit event when vault contract is linked
pub fn emit_vault_linked(env: &Env, vault: &Address) {
    env.events()
        .publish((Symbol::new(env, "vault_link"),), vault.clone());
}
