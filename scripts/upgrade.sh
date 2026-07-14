#!/bin/bash
# ============================================================================
# KithTrust — Contract Upgrade Script
# ============================================================================
# Upgrades a deployed contract to a new WASM version.
#
# Usage: ./scripts/upgrade.sh <governance|vault> <contract_id>
# ============================================================================

set -euo pipefail

CONTRACT_TYPE="${1:-}"
CONTRACT_ID="${2:-}"

if [ -z "$CONTRACT_TYPE" ] || [ -z "$CONTRACT_ID" ]; then
  echo "Usage: ./scripts/upgrade.sh <governance|vault> <contract_id>"
  echo "Example: ./scripts/upgrade.sh governance CABC...XYZ"
  exit 1
fi

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
SOURCE_ACCOUNT="${STELLAR_ACCOUNT:-deployer}"

echo "🔄 KithTrust — Contract Upgrade"
echo "   Contract:  $CONTRACT_TYPE"
echo "   ID:        $CONTRACT_ID"
echo ""

# Build
echo "🔨 Building contracts..."
cd contracts
cargo build --release --target wasm32-unknown-unknown

if [ "$CONTRACT_TYPE" = "governance" ]; then
  WASM="target/wasm32-unknown-unknown/release/kithtrust_governance.wasm"
elif [ "$CONTRACT_TYPE" = "vault" ]; then
  WASM="target/wasm32-unknown-unknown/release/kithtrust_vault.wasm"
else
  echo "❌ Unknown contract type: $CONTRACT_TYPE (use 'governance' or 'vault')"
  exit 1
fi

# Install new WASM and get hash
echo "📦 Installing new WASM..."
WASM_HASH=$(stellar contract install \
  --wasm "$WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" 2>&1 | tail -1)
echo "   WASM Hash: $WASM_HASH"

# Upgrade contract
echo "🚀 Upgrading contract..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- upgrade --new_wasm_hash "$WASM_HASH"

cd ..

echo ""
echo "✅ Contract upgraded successfully!"
echo "   New WASM Hash: $WASM_HASH"
