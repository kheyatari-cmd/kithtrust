"use client";

import { useActivityFeed } from "@/features/events/hooks/use-event-stream";
import {
  getEventLabel,
  getEventStyle,
} from "@/features/events/services/event-service";
import { formatRelativeTime } from "@/lib/utils";
import { RefreshCw, Filter, ExternalLink } from "lucide-react";
import { useState } from "react";

const filterOptions = [
  { value: "all", label: "All Events" },
  { value: "deposited", label: "Deposits" },
  { value: "distributed", label: "Distributions" },
  { value: "claimed", label: "Claims" },
  { value: "child_added", label: "Members" },
  { value: "allow_upd", label: "Config Changes" },
];

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const filters =
    activeFilter === "all" ? undefined : { types: [activeFilter] };
  const { events, isLoading, isRefetching, refetch } =
    useActivityFeed(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Activity Feed</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time contract events from your family treasury
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live — refreshes every 10s
          </div>
          <button
            onClick={() => refetch()}
            className="glass-button text-xs px-3 py-1.5"
            disabled={isRefetching}
            id="activity-refresh-btn"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeFilter === option.value
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/[0.02] text-zinc-500 border border-glass-border hover:border-glass-border-hover hover:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-4 animate-shimmer h-20" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Filter className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">
              No events found for the selected filter
            </p>
          </div>
        ) : (
          events.map((event, index) => {
            const style = getEventStyle(event.type);
            return (
              <div
                key={event.id}
                className="glass-card p-4 flex items-center gap-4 group hover:scale-[1.005] transition-transform duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Event icon */}
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                  {style.icon}
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${style.colorClass}`}>
                      {getEventLabel(event.type)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 truncate">
                    {Object.entries(event.data)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </div>
                </div>

                {/* Timestamp & tx link */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-zinc-500">
                    {formatRelativeTime(event.timestamp)}
                  </div>
                  {event.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-info/60 hover:text-info mt-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View tx
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
