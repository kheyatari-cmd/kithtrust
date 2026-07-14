#!/bin/bash
# ============================================================================
# KithTrust — Deploy Contracts to Stellar Testnet
# ============================================================================
# Prerequisites:
#   1. Install Rust: https://rustup.rs/
#   2. Add WASM target: rustup target add wasm32-unknown-unknown
#   3. Install Stellar CLI: cargo install --locked stellar-cli --features opt
#   4. Generate & fund account: stellar keys generate --fund deployer
#
# Usage: ./scripts/deploy.sh
# ============================================================================

set -euo pipefail

echo "╔══════════════════════════════════════════════════════╗"
echo "║        KithTrust — Testnet Deployment Script        ║"
echo "╚══════════════════════════════════════════════════════╝"

# Configuration
NETWORK="testnet"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
RPC_URL="https://soroban-testnet.stellar.org"
SOURCE_ACCOUNT="${STELLAR_ACCOUNT:-deployer}"

echo ""
echo "📋 Configuration:"
echo "   Network:    $NETWORK"
echo "   RPC URL:    $RPC_URL"
echo "   Account:    $SOURCE_ACCOUNT"
echo ""

# Step 1: Generate account if needed
echo "🔑 Step 1: Ensuring deployer account exists..."
stellar keys generate --fund "$SOURCE_ACCOUNT" 2>/dev/null || echo "   Account already exists"
PUBLIC_KEY=$(stellar keys public-key "$SOURCE_ACCOUNT")
echo "   Public Key: $PUBLIC_KEY"
echo ""

# Step 2: Build contracts
echo "🔨 Step 2: Building contracts..."
cd contracts
cargo build --release --target wasm32-unknown-unknown
echo "   ✅ Build complete"
echo ""

GOVERNANCE_WASM="target/wasm32-unknown-unknown/release/kithtrust_governance.wasm"
VAULT_WASM="target/wasm32-unknown-unknown/release/kithtrust_vault.wasm"

# Step 3: Deploy Governance Contract
echo "🚀 Step 3: Deploying Governance Contract..."
GOVERNANCE_ID=$(stellar contract deploy \
  --wasm "$GOVERNANCE_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  --alias governance \
  --ignore-checks 2>&1 | tail -1)

echo "   ✅ Governance Contract ID: $GOVERNANCE_ID"
echo ""

# Step 4: Deploy Vault Contract
echo "🚀 Step 4: Deploying Vault Contract..."
VAULT_ID=$(stellar contract deploy \
  --wasm "$VAULT_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  --alias vault \
  --ignore-checks 2>&1 | tail -1)

echo "   ✅ Vault Contract ID: $VAULT_ID"
echo ""

# Step 5: Initialize Governance Contract
echo "⚙️  Step 5: Initializing Governance Contract..."
stellar contract invoke \
  --id "$GOVERNANCE_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize --admin "$PUBLIC_KEY"
echo "   ✅ Governance initialized"
echo ""

# Step 6: Initialize Vault Contract
echo "⚙️  Step 6: Initializing Vault Contract..."
stellar contract invoke \
  --id "$VAULT_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize --admin "$PUBLIC_KEY" --governance_contract "$GOVERNANCE_ID"
echo "   ✅ Vault initialized"
echo ""

# Step 7: Link Vault to Governance
echo "🔗 Step 7: Linking Vault to Governance Contract..."
stellar contract invoke \
  --id "$GOVERNANCE_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- set_vault --vault_contract "$VAULT_ID"
echo "   ✅ Vault linked"
echo ""

cd ..

# Summary
echo "╔══════════════════════════════════════════════════════╗"
echo "║              🎉 DEPLOYMENT COMPLETE! 🎉             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📝 Contract Addresses:"
echo "   Governance: $GOVERNANCE_ID"
echo "   Vault:      $VAULT_ID"
echo ""
echo "🔗 Explorer Links:"
echo "   Governance: https://stellar.expert/explorer/testnet/contract/$GOVERNANCE_ID"
echo "   Vault:      https://stellar.expert/explorer/testnet/contract/$VAULT_ID"
echo ""
echo "📋 Next Steps:"
echo "   1. Copy the contract IDs above"
echo "   2. Update frontend/.env with:"
echo "      NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID=$GOVERNANCE_ID"
echo "      NEXT_PUBLIC_VAULT_CONTRACT_ID=$VAULT_ID"
echo "   3. Update README.md contract addresses section"
echo ""
echo "   Test with:"
echo "   stellar contract invoke --id $GOVERNANCE_ID --source $SOURCE_ACCOUNT --network testnet -- get_admin"
echo ""
