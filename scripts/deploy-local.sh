#!/bin/bash
# ============================================================================
# KithTrust — Local Deployment (Standalone Network)
# ============================================================================
# Prerequisites:
#   1. Docker running
#   2. Stellar Quickstart: docker run --rm -it -p 8000:8000 stellar/quickstart:latest --standalone
#
# Usage: ./scripts/deploy-local.sh
# ============================================================================

set -euo pipefail

echo "🏠 KithTrust — Local Deployment"
echo ""

NETWORK="standalone"
RPC_URL="http://localhost:8000/soroban/rpc"
NETWORK_PASSPHRASE="Standalone Network ; February 2017"

# Build
echo "🔨 Building contracts..."
cd contracts
cargo build --release --target wasm32-unknown-unknown
echo "   ✅ Build complete"

GOVERNANCE_WASM="target/wasm32-unknown-unknown/release/kithtrust_governance.wasm"
VAULT_WASM="target/wasm32-unknown-unknown/release/kithtrust_vault.wasm"

# Create local account
echo "🔑 Creating local account..."
stellar keys generate --fund deployer --network standalone --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" 2>/dev/null || true
PUBLIC_KEY=$(stellar keys public-key deployer)

# Deploy
echo "🚀 Deploying Governance..."
GOV_ID=$(stellar contract deploy --wasm "$GOVERNANCE_WASM" --source deployer --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" --ignore-checks 2>&1 | tail -1)
echo "   Governance: $GOV_ID"

echo "🚀 Deploying Vault..."
VAULT_ID=$(stellar contract deploy --wasm "$VAULT_WASM" --source deployer --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" --ignore-checks 2>&1 | tail -1)
echo "   Vault: $VAULT_ID"

# Initialize
echo "⚙️  Initializing..."
stellar contract invoke --id "$GOV_ID" --source deployer --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" -- initialize --admin "$PUBLIC_KEY"
stellar contract invoke --id "$VAULT_ID" --source deployer --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" -- initialize --admin "$PUBLIC_KEY" --governance_contract "$GOV_ID"
stellar contract invoke --id "$GOV_ID" --source deployer --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" -- set_vault --vault_contract "$VAULT_ID"

cd ..

echo ""
echo "✅ Local deployment complete!"
echo "   Governance: $GOV_ID"
echo "   Vault: $VAULT_ID"
