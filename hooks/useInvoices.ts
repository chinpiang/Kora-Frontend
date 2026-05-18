"use client";

import { useQuery } from "@tanstack/react-query";
import { useInvoiceStore } from "@/store";
import { fetchInvoices, fetchInvoiceById } from "@/services/invoiceService";

export function useInvoices() {
  const { filters, sort } = useInvoiceStore();

  return useQuery({
    queryKey: ["invoices", filters, sort],
    queryFn: () => fetchInvoices(filters, sort),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoiceById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
