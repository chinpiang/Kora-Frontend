"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, GlassCard } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useInvoice } from "@/hooks/useInvoices";
import { useWallet } from "@/hooks/useWallet";
import { useTransaction } from "@/hooks/useTransaction";
import { useUIStore } from "@/store";
import { prepareFundInvoice } from "@/services/invoiceService";
import {
  formatCurrency,
  formatApr,
  formatDate,
  formatRelativeDate,
  daysUntil,
  RISK_TIER_COLORS,
  STATUS_COLORS,
  cn,
} from "@/lib/utils";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id);
  const { isConnected, address } = useWallet();
  const { setWalletModalOpen } = useUIStore();
  const { execute } = useTransaction();
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (!invoice) return notFound();

  const { metadata, terms, funding: fundingState, riskTier, status } = invoice;
  const days = daysUntil(terms.repaymentDate);
  const canFund = status === "listed" || status === "partially_funded";
  const amountNum = parseFloat(amount) || 0;
  const expectedReturn = amountNum * (1 + terms.discountRate);

  const handleFund = async () => {
    if (!isConnected) { setWalletModalOpen(true); return; }
    if (!amountNum || amountNum < terms.minInvestment) return;

    setFunding(true);
    await execute(
      () => prepareFundInvoice(invoice.tokenId, amountNum, address!),
      { successMessage: "Invoice funded successfully!" }
    );
    setFunding(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left: Invoice Details ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">{metadata.invoiceNumber}</p>
                    <h1 className="mt-1 text-xl font-bold text-zinc-100">{metadata.debtorName}</h1>
                    <p className="mt-0.5 text-sm text-zinc-500">{metadata.issuerName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("rounded-md border px-2.5 py-1 text-sm font-semibold", RISK_TIER_COLORS[riskTier])}>
                      {riskTier}
                    </span>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs capitalize", STATUS_COLORS[status])}>
                      {status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Building2 className="h-4 w-4 text-zinc-600" />
                    <span>{metadata.debtorAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="h-4 w-4 text-zinc-600" />
                    <span>{metadata.jurisdiction} · {metadata.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-4 w-4 text-zinc-600" />
                    <span>Issued {formatDate(metadata.issueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-4 w-4 text-zinc-600" />
                    <span>Due {formatDate(metadata.dueDate)}</span>
                  </div>
                </div>
                {metadata.description && (
                  <p className="mt-4 text-sm text-zinc-500">{metadata.description}</p>
                )}
                {metadata.documentUrl && (
                  <a
                    href={metadata.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-kora-400 hover:text-kora-300"
                  >
                    <FileText className="h-4 w-4" /> View Invoice Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Financing terms */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Financing Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Invoice Amount", value: formatCurrency(metadata.amount, metadata.currency, true) },
                    { label: "Financing Amount", value: formatCurrency(terms.financingAmount, metadata.currency, true) },
                    { label: "Discount Rate", value: `${(terms.discountRate * 100).toFixed(1)}%` },
                    { label: "APR", value: formatApr(terms.apr), highlight: true },
                    { label: "Tenor", value: `${terms.tenor} days` },
                    { label: "Repayment Date", value: formatDate(terms.repaymentDate) },
                    { label: "Min Investment", value: formatCurrency(terms.minInvestment, metadata.currency, true) },
                    { label: "Max Investment", value: formatCurrency(terms.maxInvestment, metadata.currency, true) },
                    { label: "Days Remaining", value: days > 0 ? `${days} days` : "Overdue" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="rounded-lg bg-zinc-800/50 p-3">
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className={cn("mt-1 text-sm font-semibold", highlight ? "text-kora-400" : "text-zinc-200")}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Funding progress */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-500" /> Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">
                    {formatCurrency(fundingState.totalRaised, metadata.currency, true)} raised
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {Math.round(fundingState.fundingProgress * 100)}% of{" "}
                    {formatCurrency(terms.financingAmount, metadata.currency, true)}
                  </span>
                </div>
                <Progress value={fundingState.fundingProgress * 100} className="h-3" />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-zinc-500">Investors</p>
                    <p className="mt-0.5 text-lg font-semibold text-zinc-200">{fundingState.investorCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Remaining</p>
                    <p className="mt-0.5 text-lg font-semibold text-zinc-200">
                      {formatCurrency(fundingState.remainingCapacity, metadata.currency, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Closes</p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-400">
                      {formatRelativeDate(terms.repaymentDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right: Fund Panel ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-kora-400" />
                <h2 className="font-semibold text-zinc-100">Fund This Invoice</h2>
              </div>

              <div className="mb-4 rounded-lg bg-kora-500/5 border border-kora-500/10 p-3">
                <p className="text-xs text-zinc-500">Expected APR</p>
                <p className="text-2xl font-bold text-kora-400">{formatApr(terms.apr)}</p>
              </div>

              <Input
                label="Investment Amount (USDC)"
                type="number"
                placeholder={`Min ${terms.minInvestment}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                hint={`Min: $${terms.minInvestment.toLocaleString()} · Max: $${terms.maxInvestment.toLocaleString()}`}
                disabled={!canFund}
              />

              {amountNum > 0 && (
                <div className="mt-3 rounded-lg bg-zinc-800/50 p-3 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>You invest</span>
                    <span>{formatCurrency(amountNum, "USDC")}</span>
                  </div>
                  <div className="mt-1 flex justify-between font-medium text-zinc-200">
                    <span>You receive</span>
                    <span>{formatCurrency(expectedReturn, "USDC")}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-kora-400">
                    <span>Yield</span>
                    <span>+{formatCurrency(expectedReturn - amountNum, "USDC")}</span>
                  </div>
                </div>
              )}

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handleFund}
                loading={funding}
                disabled={!canFund || (isConnected && (!amountNum || amountNum < terms.minInvestment))}
              >
                {!isConnected ? "Connect Wallet to Fund" : !canFund ? "Fully Funded" : "Fund Invoice"}
              </Button>

              {canFund && (
                <p className="mt-3 text-center text-xs text-zinc-600">
                  Funds held in Soroban escrow until repayment
                </p>
              )}
            </GlassCard>
          </motion.div>

          {/* Risk info */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-zinc-500" />
                <p className="text-sm font-medium text-zinc-300">Risk Assessment</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Risk Tier</span>
                  <span className={cn("font-semibold", RISK_TIER_COLORS[riskTier].split(" ")[0])}>
                    {riskTier}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Risk Score</span>
                  <span className="text-zinc-300">{invoice.riskScore}/100</span>
                </div>
                <Progress value={invoice.riskScore} className="h-1.5" />
              </div>
            </Card>
          </motion.div>

          {/* On-chain info */}
          {invoice.txHash && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-4">
                <p className="mb-2 text-xs text-zinc-500">On-Chain</p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${invoice.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-kora-400 hover:text-kora-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  View mint transaction
                </a>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
