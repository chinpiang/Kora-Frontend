"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Store, TrendingUp, DollarSign, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/useWallet";
import { useUIStore } from "@/store";
import { MOCK_INVOICES } from "@/services/mockData";
import {
  formatCurrency,
  formatDate,
  formatApr,
  RISK_TIER_COLORS,
  STATUS_COLORS,
  cn,
} from "@/lib/utils";

// Mock investor positions derived from mock invoices
const POSITIONS = MOCK_INVOICES.slice(0, 4).map((inv, i) => ({
  invoice: inv,
  investedAmount: [15000, 50000, 5000, 100000][i],
  expectedReturn: [15000 * (1 + inv.terms.discountRate), 50000 * (1 + inv.terms.discountRate), 5000 * (1 + inv.terms.discountRate), 100000 * (1 + inv.terms.discountRate)][i],
  yieldEarned: [0, 0, 0, 0][i],
  status: (["active", "active", "active", "active"] as const)[i],
}));

const totalInvested = POSITIONS.reduce((s, p) => s + p.investedAmount, 0);
const totalExpected = POSITIONS.reduce((s, p) => s + p.expectedReturn, 0);
const totalYield = totalExpected - totalInvested;

const STATS = [
  {
    label: "Portfolio Value",
    value: formatCurrency(totalInvested, "USDC", true),
    change: "4 active positions",
    changePositive: true,
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "Expected Yield",
    value: formatCurrency(totalYield, "USDC", true),
    change: `${((totalYield / totalInvested) * 100).toFixed(1)}% return`,
    changePositive: true,
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Active Positions",
    value: POSITIONS.length.toString(),
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Avg. APR",
    value: `${(POSITIONS.reduce((s, p) => s + p.invoice.terms.apr, 0) / POSITIONS.length).toFixed(1)}%`,
    change: "Across all positions",
    changePositive: true,
    icon: <Clock className="h-4 w-4" />,
  },
];

export default function InvestorDashboardPage() {
  const { isConnected } = useWallet();
  const { setWalletModalOpen } = useUIStore();

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
          <BarChart3 className="h-6 w-6 text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Connect your wallet</h2>
        <p className="text-sm text-zinc-500">Connect to view your investment portfolio</p>
        <Button onClick={() => setWalletModalOpen(true)}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Investor Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Track your invoice financing portfolio</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">
            <Store className="h-4 w-4" /> Browse Marketplace
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Positions table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  {["Invoice", "Debtor", "Invested", "Expected Return", "Yield", "APR", "Risk", "Due Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map((pos, i) => {
                  const { invoice } = pos;
                  const yieldAmt = pos.expectedReturn - pos.investedAmount;
                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-200">{invoice.metadata.invoiceNumber}</p>
                        <p className="text-xs text-zinc-600">{invoice.metadata.category}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{invoice.metadata.debtorName}</td>
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        {formatCurrency(pos.investedAmount, "USDC", true)}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">
                        {formatCurrency(pos.expectedReturn, "USDC", true)}
                      </td>
                      <td className="px-4 py-3 text-kora-400">
                        +{formatCurrency(yieldAmt, "USDC", true)}
                      </td>
                      <td className="px-4 py-3 text-kora-400 font-medium">
                        {formatApr(invoice.terms.apr)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold", RISK_TIER_COLORS[invoice.riskTier])}>
                          {invoice.riskTier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {formatDate(invoice.terms.repaymentDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/marketplace/${invoice.id}`} className="text-xs text-kora-400 hover:text-kora-300">
                          View →
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio breakdown */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allocation by Risk Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(
              POSITIONS.reduce<Record<string, number>>((acc, p) => {
                acc[p.invoice.riskTier] = (acc[p.invoice.riskTier] || 0) + p.investedAmount;
                return acc;
              }, {})
            ).map(([tier, amount]) => (
              <div key={tier} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={cn("font-medium", RISK_TIER_COLORS[tier].split(" ")[0])}>{tier}</span>
                  <span className="text-zinc-400">{formatCurrency(amount, "USDC", true)}</span>
                </div>
                <Progress value={(amount / totalInvested) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation by Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(
              POSITIONS.reduce<Record<string, number>>((acc, p) => {
                const j = p.invoice.metadata.jurisdiction;
                acc[j] = (acc[j] || 0) + p.investedAmount;
                return acc;
              }, {})
            ).map(([jurisdiction, amount]) => (
              <div key={jurisdiction} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{jurisdiction}</span>
                  <span className="text-zinc-400">{formatCurrency(amount, "USDC", true)}</span>
                </div>
                <Progress value={(amount / totalInvested) * 100} className="h-1.5" indicatorClassName="bg-blue-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
