"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, TrendingUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatApr,
  formatDate,
  daysUntil,
  RISK_TIER_COLORS,
  STATUS_COLORS,
  cn,
} from "@/lib/utils";
import type { Invoice } from "@/types";

interface InvoiceCardProps {
  invoice: Invoice;
  index?: number;
}

export function InvoiceCard({ invoice, index = 0 }: InvoiceCardProps) {
  const { metadata, terms, funding, riskTier, status } = invoice;
  const days = daysUntil(terms.repaymentDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/marketplace/${invoice.id}`} className="block group">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/20">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
                {metadata.debtorName}
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {metadata.invoiceNumber}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                  RISK_TIER_COLORS[riskTier]
                )}
              >
                {riskTier}
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs capitalize",
                  STATUS_COLORS[status]
                )}
              >
                {status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-4">
            <p className="text-2xl font-semibold tracking-tight text-zinc-100">
              {formatCurrency(metadata.amount, metadata.currency, true)}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Financing {formatCurrency(terms.financingAmount, metadata.currency, true)}
            </p>
          </div>

          {/* Funding progress */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {formatCurrency(funding.totalRaised, metadata.currency, true)} raised
              </span>
              <span className="font-medium text-zinc-300">
                {Math.round(funding.fundingProgress * 100)}%
              </span>
            </div>
            <Progress value={funding.fundingProgress * 100} />
          </div>

          {/* Meta row */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-800 pt-4">
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-500">
                <TrendingUp className="h-3 w-3" /> APR
              </p>
              <p className="mt-0.5 text-sm font-semibold text-kora-400">
                {formatApr(terms.apr)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="h-3 w-3" /> Tenor
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-300">
                {terms.tenor}d
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-500">
                <Users className="h-3 w-3" /> Investors
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-300">
                {funding.investorCount}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3" />
              {metadata.jurisdiction} · {metadata.category}
            </span>
            <span className="text-xs text-zinc-600">
              {days > 0 ? `${days}d left` : "Due"}
            </span>
          </div>

          {/* CTA */}
          {status === "listed" || status === "partially_funded" ? (
            <Button size="sm" className="mt-4 w-full" onClick={(e) => e.preventDefault()}>
              Fund Invoice
            </Button>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
