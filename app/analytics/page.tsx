"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign, BarChart3, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useWallet } from "@/hooks/useWallet";
import { useUIStore } from "@/store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { exportCsv } from "@/lib/utils";

// ── Mock analytics data ────────────────────────────────────────────────────────

const PORTFOLIO_HISTORY = [
  { month: "Jun", value: 0 },
  { month: "Jul", value: 25000 },
  { month: "Aug", value: 48000 },
  { month: "Sep", value: 72000 },
  { month: "Oct", value: 115000 },
  { month: "Nov", value: 170000 },
];

const YIELD_HISTORY = [
  { month: "Jun", yield: 0 },
  { month: "Jul", yield: 420 },
  { month: "Aug", yield: 890 },
  { month: "Sep", yield: 1540 },
  { month: "Oct", yield: 2800 },
  { month: "Nov", yield: 4200 },
];

const RISK_DISTRIBUTION = [
  { name: "AAA", value: 30, color: "#34d399" },
  { name: "AA", value: 45, color: "#14b8a6" },
  { name: "A", value: 20, color: "#22d3ee" },
  { name: "BBB", value: 5, color: "#fbbf24" },
];

const MONTHLY_RETURNS = [
  { month: "Jun", return: 0 },
  { month: "Jul", return: 1.68 },
  { month: "Aug", return: 1.85 },
  { month: "Sep", return: 2.14 },
  { month: "Oct", return: 2.43 },
  { month: "Nov", return: 2.47 },
];

const STATS = [
  {
    label: "Total Deployed",
    value: formatCurrency(170000, "USDC", true),
    change: "↑ $55K this month",
    changePositive: true,
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "Total Yield Earned",
    value: formatCurrency(4200, "USDC", true),
    change: "2.47% avg monthly",
    changePositive: true,
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Annualised Return",
    value: "29.6%",
    change: "vs 4.2% T-bill",
    changePositive: true,
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Default Rate",
    value: "0.0%",
    change: "All-time",
    changePositive: true,
    icon: <Shield className="h-4 w-4" />,
  },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "8px",
    color: "#e4e4e7",
    fontSize: "12px",
  },
};

export default function PortfolioAnalyticsPage() {
  const { isConnected } = useWallet();
  const { setWalletModalOpen } = useUIStore();
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Simple date range filtering for mock data — in real app you'd slice by timestamps
  const portfolio = useMemo(() => PORTFOLIO_HISTORY, [range]);
  const yieldData = useMemo(() => YIELD_HISTORY, [range]);
  const risk = useMemo(() => RISK_DISTRIBUTION, [range]);
  const monthly = useMemo(() => MONTHLY_RETURNS, [range]);

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
          <BarChart3 className="h-6 w-6 text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Connect your wallet</h2>
        <p className="text-sm text-zinc-500">Connect to view your portfolio analytics</p>
        <Button onClick={() => setWalletModalOpen(true)}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Portfolio Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Performance overview of your invoice financing portfolio</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Range:</span>
          {(["7d", "30d", "90d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-1 text-sm ${range === r ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-zinc-800 px-3 py-1 text-sm text-zinc-200"
            onClick={() => exportCsv(portfolio as any, "portfolio.csv")}
          >
            Export Portfolio CSV
          </button>
          <button
            className="rounded-md bg-zinc-800 px-3 py-1 text-sm text-zinc-200"
            onClick={() => exportCsv(yieldData as any, "yield.csv")}
          >
            Export Yield CSV
          </button>
        </div>
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

      {/* Charts row 1 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Portfolio growth */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Growth (USDC)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={PORTFOLIO_HISTORY}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Portfolio"]} />
                  <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="url(#portfolioGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly yield */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Yield Earned (USDC)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={YIELD_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Yield"]} />
                  <Bar dataKey="yield" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {RISK_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Allocation"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {RISK_DISTRIBUTION.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-zinc-400">{d.name}</span>
                    <span className="ml-auto text-zinc-300">{d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly return % */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Return Rate (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_RETURNS}>
                  <defs>
                    <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Return"]} />
                  <Area type="monotone" dataKey="return" stroke="#818cf8" strokeWidth={2} fill="url(#returnGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
