"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, TrendingUp, FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
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

// In production, filter by wallet address
const MY_INVOICES = MOCK_INVOICES.slice(0, 3);

const STATS = [
  {
    label: "Total Financed",
    value: formatCurrency(
      MY_INVOICES.reduce((s, i) => s + i.funding.totalRaised, 0),
      "USDC",
      true
    ),
    change: "12.4% this month",
    changePositive: true,
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Active Invoices",
    value: MY_INVOICES.filter((i) => ["listed", "partially_funded", "fully_funded"].includes(i.status)).length.toString(),
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Pending Repayment",
    value: formatCurrency(
      MY_INVOICES.filter((i) => i.status === "fully_funded").reduce((s, i) => s + i.metadata.amount, 0),
      "USDC",
      true
    ),
    icon: <Clock className="h-4 w-4" />,
  },
  {
    label: "Repayment Rate",
    value: "100%",
    change: "All-time",
    changePositive: true,
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

export default function SMEDashboardPage() {
  const { isConnected } = useWallet();
  const { setWalletModalOpen } = useUIStore();

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
          <FileText className="h-6 w-6 text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Connect your wallet</h2>
        <p className="text-sm text-zinc-500">Connect to view and manage your invoices</p>
        <Button onClick={() => setWalletModalOpen(true)}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">SME Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your invoice financing</p>
        </div>
        <Button asChild>
          <Link href="/invoice/create">
            <PlusCircle className="h-4 w-4" /> New Invoice
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

      {/* Invoice table */}
      <Card>
        <CardHeader>
          <CardTitle>My Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  {["Invoice", "Debtor", "Amount", "APR", "Progress", "Status", "Due Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MY_INVOICES.map((invoice, i) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-zinc-200">{invoice.metadata.invoiceNumber}</p>
                        <p className="text-xs text-zinc-600">{invoice.metadata.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{invoice.metadata.debtorName}</td>
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {formatCurrency(invoice.metadata.amount, invoice.metadata.currency, true)}
                    </td>
                    <td className="px-4 py-3 text-kora-400 font-medium">
                      {formatApr(invoice.terms.apr)}
                    </td>
                    <td className="px-4 py-3 w-32">
                      <div className="space-y-1">
                        <Progress value={invoice.funding.fundingProgress * 100} className="h-1.5" />
                        <p className="text-xs text-zinc-600">
                          {Math.round(invoice.funding.fundingProgress * 100)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs capitalize", STATUS_COLORS[invoice.status])}>
                        {invoice.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {formatDate(invoice.terms.repaymentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/marketplace/${invoice.id}`}
                        className="text-xs text-kora-400 hover:text-kora-300"
                      >
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Repayment reminder */}
      {MY_INVOICES.some((i) => i.status === "fully_funded") && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">Repayment Due Soon</p>
            <p className="mt-0.5 text-xs text-amber-400/70">
              You have invoices approaching their repayment date. Ensure sufficient USDC balance.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
