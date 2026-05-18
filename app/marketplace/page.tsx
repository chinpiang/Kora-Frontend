"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SkeletonCard } from "@/components/ui/skeleton";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceStore } from "@/store";
import type { MarketplaceSortKey } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "technology", label: "Technology" },
  { value: "agriculture", label: "Agriculture" },
  { value: "healthcare", label: "Healthcare" },
  { value: "construction", label: "Construction" },
  { value: "energy", label: "Energy" },
  { value: "logistics", label: "Logistics" },
];

const JURISDICTION_OPTIONS = [
  { value: "", label: "All Jurisdictions" },
  { value: "KE", label: "Kenya" },
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "ZA", label: "South Africa" },
  { value: "US", label: "United States" },
  { value: "EU", label: "European Union" },
];

const RISK_OPTIONS = [
  { value: "", label: "All Risk Tiers" },
  { value: "AAA", label: "AAA" },
  { value: "AA", label: "AA" },
  { value: "A", label: "A" },
  { value: "BBB", label: "BBB" },
  { value: "BB", label: "BB" },
];

const SORT_OPTIONS: { value: MarketplaceSortKey; label: string }[] = [
  { value: "apr", label: "Highest APR" },
  { value: "amount", label: "Largest Amount" },
  { value: "duration", label: "Shortest Tenor" },
  { value: "riskScore", label: "Best Risk Score" },
  { value: "createdAt", label: "Newest First" },
];

export default function MarketplacePage() {
  const { filters, sort, searchQuery, setFilters, setSort, setSearchQuery } = useInvoiceStore();
  const { data, isLoading } = useInvoices();
  const [showFilters, setShowFilters] = useState(false);

  const invoices = data?.data ?? [];

  // Client-side search filter
  const filtered = searchQuery
    ? invoices.filter(
        (inv) =>
          inv.metadata.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.metadata.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.metadata.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Invoice Marketplace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {data?.total ?? 0} financing opportunities available
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by debtor, invoice number, or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <Select
            options={SORT_OPTIONS}
            value={sort.key}
            onChange={(e) =>
              setSort({ key: e.target.value as MarketplaceSortKey, direction: "desc" })
            }
            className="w-44"
          />
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mb-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-3">
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={filters.category ?? ""}
            onChange={(e) => setFilters({ category: e.target.value || undefined })}
          />
          <Select
            label="Jurisdiction"
            options={JURISDICTION_OPTIONS}
            value={filters.jurisdiction ?? ""}
            onChange={(e) => setFilters({ jurisdiction: e.target.value || undefined })}
          />
          <Select
            label="Risk Tier"
            options={RISK_OPTIONS}
            value={filters.riskTier ?? ""}
            onChange={(e) => setFilters({ riskTier: e.target.value || undefined })}
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-500">No invoices match your filters.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => { setFilters({}); setSearchQuery(""); }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((invoice, i) => (
            <InvoiceCard key={invoice.id} invoice={invoice} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
