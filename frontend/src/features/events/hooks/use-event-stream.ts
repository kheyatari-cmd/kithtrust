"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchContractEvents } from "../services/event-service";

/**
 * Hook for real-time event streaming via polling.
 * Uses React Query with a 10-second refetch interval.
 */
export function useEventStream() {
  return useQuery({
    queryKey: ["contract-events"],
    queryFn: () => fetchContractEvents(),
    refetchInterval: 10_000, // 10 seconds
    staleTime: 5_000,
  });
}

/**
 * Hook for the activity feed with filtering support.
 */
export function useActivityFeed(filters?: { types?: string[] }) {
  const { data: events, ...rest } = useEventStream();

  const filteredEvents = events?.filter((event) => {
    if (filters?.types && filters.types.length > 0) {
      return filters.types.includes(event.type);
    }
    return true;
  });

  return {
    events: filteredEvents || [],
    ...rest,
  };
}
