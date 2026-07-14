#!/bin/bash
# ============================================================================
# KithTrust — Post-Deployment Initialization
# ============================================================================
# Run after deploy.sh to set up initial family data for testing.
#
# Usage: ./scripts/initialize.sh <governance_id> <vault_id>
# ============================================================================

set -euo pipefail

GOV_ID="${1:-}"
VAULT_ID="${2:-}"

if [ -z "$GOV_ID" ] || [ -z "$VAULT_ID" ]; then
  echo "Usage: ./scripts/initialize.sh <governance_contract_id> <vault_contract_id>"
  exit 1
fi

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
SOURCE="${STELLAR_ACCOUNT:-deployer}"

echo "📦 KithTrust — Post-Deployment Initialization"
echo ""

PUBLIC_KEY=$(stellar keys public-key "$SOURCE")

# Add deployer as parent
echo "👨 Adding deployer as parent..."
stellar contract invoke \
  --id "$GOV_ID" --source "$SOURCE" --network "$NETWORK" \
  --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" \
  -- add_parent --parent "$PUBLIC_KEY" --name "Parent"
echo "   ✅ Parent added"

# Create a test child account
echo "👶 Creating test child account..."
stellar keys generate --fund testchild 2>/dev/null || true
CHILD_KEY=$(stellar keys public-key testchild)

# Add child
echo "👶 Adding child to family..."
stellar contract invoke \
  --id "$GOV_ID" --source "$SOURCE" --network "$NETWORK" \
  --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" \
  -- add_child \
  --parent "$PUBLIC_KEY" \
  --child "$CHILD_KEY" \
  --child_name "TestChild" \
  --amount 1000 \
  --interval "Weekly"
echo "   ✅ Child added: $CHILD_KEY"

# Deposit to vault
echo "💰 Depositing to vault..."
stellar contract invoke \
  --id "$VAULT_ID" --source "$SOURCE" --network "$NETWORK" \
  --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" \
  -- deposit --parent "$PUBLIC_KEY" --amount 10000
echo "   ✅ Deposited 10,000 units"

echo ""
echo "✅ Initialization complete!"
echo "   Parent: $PUBLIC_KEY"
echo "   Child:  $CHILD_KEY"
