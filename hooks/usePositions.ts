"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPositions } from "@/services/invoiceService";

export function usePositions(investorAddress?: string, opts?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["positions", investorAddress],
    queryFn: () => fetchPositions(investorAddress || ""),
    enabled: !!investorAddress,
    staleTime: 30_000,
    refetchInterval: opts?.refetchInterval,
  });
}

export default usePositions;
