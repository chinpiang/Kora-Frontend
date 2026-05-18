"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Store, PlusCircle, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/investor", label: "Invest", icon: BarChart3 },
  { href: "/dashboard/sme", label: "My Invoices", icon: LayoutDashboard },
  { href: "/invoice/create", label: "Create Invoice", icon: PlusCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kora-500 text-white font-bold text-sm">
            K
          </div>
          <span className="text-base font-semibold text-zinc-100">Kora</span>
          <span className="hidden rounded bg-kora-500/10 px-1.5 py-0.5 text-[10px] font-medium text-kora-400 sm:block">
            TESTNET
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-zinc-800"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <WalletButton />
          <button
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 md:hidden"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
                pathname.startsWith(href)
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
