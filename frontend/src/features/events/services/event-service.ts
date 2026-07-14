import { getRpcServer } from "@/lib/stellar";
import { STELLAR_CONFIG, EVENT_LABELS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { ContractEvent } from "@/features/contract/types";

/**
 * Event streaming service.
 * Polls Soroban RPC for contract events and transforms them
 * into a frontend-consumable format.
 */

/** Fetch recent events from both contracts */
export async function fetchContractEvents(
  startLedger?: number
): Promise<ContractEvent[]> {
  const server = getRpcServer();
  const events: ContractEvent[] = [];

  const contractIds = [
    STELLAR_CONFIG.governanceContractId,
    STELLAR_CONFIG.vaultContractId,
  ].filter(Boolean);

  if (contractIds.length === 0) {
    // Return mock events for demo when contracts aren't deployed
    return getMockEvents();
  }

  try {
    let resolvedStartLedger = startLedger;
    if (!resolvedStartLedger) {
      try {
        const latestLedgerResp = await server.getLatestLedger();
        // Look back up to 10000 ledgers (around 13 hours) to find recent events
        resolvedStartLedger = Math.max(1, latestLedgerResp.sequence - 10000);
      } catch (ledgerErr) {
        logger.warn("Failed to fetch latest ledger sequence for event query, falling back to sequence 1", {
          error: ledgerErr instanceof Error ? ledgerErr.message : String(ledgerErr),
        });
        resolvedStartLedger = 1;
      }
    }

    for (const contractId of contractIds) {
      const response = await server.getEvents({
        startLedger: resolvedStartLedger,
        filters: [
          {
            type: "contract",
            contractIds: [contractId],
          },
        ],
        limit: 50,
      });

      if (response.events) {
        for (const event of response.events) {
          events.push({
            id: event.id,
            type: event.topic?.[0]?.toString() || "unknown",
            timestamp: Math.floor(Date.now() / 1000),
            data: { value: event.value },
            txHash: event.inSuccessfulContractCall ? event.id : "",
            contractId,
          });
        }
      }
    }

    logger.debug("Fetched contract events", { count: events.length });
  } catch (error) {
    logger.warn("Failed to fetch contract events from Soroban RPC, falling back to mock data", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return events.length > 0 ? events : getMockEvents();
}

/** Generate mock events for demo/development */
function getMockEvents(): ContractEvent[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      id: "evt_001",
      type: "deposited",
      timestamp: now - 300,
      data: { parent: "GABCD...WXYZ", amount: 5000 },
      txHash: "abc123...def456",
      contractId: "VAULT_CONTRACT",
    },
    {
      id: "evt_002",
      type: "distributed",
      timestamp: now - 600,
      data: { parent: "GABCD...WXYZ", child: "GEFGH...STUV", amount: 500 },
      txHash: "ghi789...jkl012",
      contractId: "VAULT_CONTRACT",
    },
    {
      id: "evt_003",
      type: "child_added",
      timestamp: now - 1200,
      data: { parent: "GABCD...WXYZ", child: "GEFGH...STUV", amount: 500 },
      txHash: "mno345...pqr678",
      contractId: "GOVERNANCE_CONTRACT",
    },
    {
      id: "evt_004",
      type: "claimed",
      timestamp: now - 1800,
      data: { child: "GEFGH...STUV", amount: 500 },
      txHash: "stu901...vwx234",
      contractId: "VAULT_CONTRACT",
    },
    {
      id: "evt_005",
      type: "parent_added",
      timestamp: now - 3600,
      data: { admin: "GADMIN...ADDR", parent: "GABCD...WXYZ" },
      txHash: "yza567...bcd890",
      contractId: "GOVERNANCE_CONTRACT",
    },
    {
      id: "evt_006",
      type: "allow_upd",
      timestamp: now - 7200,
      data: { parent: "GABCD...WXYZ", child: "GEFGH...STUV", amount: 750 },
      txHash: "efg123...hij456",
      contractId: "GOVERNANCE_CONTRACT",
    },
  ];
}

/** Get human-readable label for an event type */
export function getEventLabel(type: string): string {
  return EVENT_LABELS[type] || type;
}

/** Get the icon/color for an event type */
export function getEventStyle(type: string): {
  icon: string;
  colorClass: string;
} {
  switch (type) {
    case "deposited":
      return { icon: "💰", colorClass: "text-success" };
    case "distributed":
      return { icon: "📤", colorClass: "text-info" };
    case "claimed":
      return { icon: "✅", colorClass: "text-success" };
    case "child_added":
      return { icon: "👶", colorClass: "text-info" };
    case "child_removed":
      return { icon: "❌", colorClass: "text-warning" };
    case "parent_added":
      return { icon: "👨‍👩‍👧", colorClass: "text-info" };
    case "allow_upd":
      return { icon: "⚙️", colorClass: "text-warning" };
    case "fam_pause":
      return { icon: "⏸️", colorClass: "text-warning" };
    case "emergency":
      return { icon: "🚨", colorClass: "text-warning" };
    default:
      return { icon: "📋", colorClass: "text-inactive" };
  }
}
