import { create } from "zustand";
import type { Invoice, MarketplaceFilters, MarketplaceSort } from "@/types";

interface InvoiceStore {
  // Marketplace state
  invoices: Invoice[];
  filters: MarketplaceFilters;
  sort: MarketplaceSort;
  searchQuery: string;

  // Selected invoice
  selectedInvoice: Invoice | null;

  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: MarketplaceSort) => void;
  setSearchQuery: (q: string) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
}

const DEFAULT_SORT: MarketplaceSort = { key: "apr", direction: "desc" };

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  filters: {},
  sort: DEFAULT_SORT,
  searchQuery: "",
  selectedInvoice: null,

  setInvoices: (invoices) => set({ invoices }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: {}, searchQuery: "" }),
  setSort: (sort) => set({ sort }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedInvoice: (selectedInvoice) => set({ selectedInvoice }),
}));
