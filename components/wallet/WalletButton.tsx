"use client";

import { useState } from "react";
import { ChevronDown, Copy, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useUIStore } from "@/store";
import { shortenAddress, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const { isConnected, address, balance, disconnectWallet } = useWallet();
  const { setWalletModalOpen } = useUIStore();
  const [open, setOpen] = useState(false);

  if (!isConnected) {
    return (
      <Button onClick={() => setWalletModalOpen(true)} size="sm">
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2",
          "text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        )}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-xs">{shortenAddress(address!)}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
          {/* Balances */}
          {balance && (
            <div className="mb-3 space-y-1 rounded-lg bg-zinc-900 p-3">
              <p className="text-xs text-zinc-500">Balances</p>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">XLM</span>
                <span className="font-medium text-zinc-200">{parseFloat(balance.xlm).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">USDC</span>
                <span className="font-medium text-zinc-200">{parseFloat(balance.usdc).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => { navigator.clipboard.writeText(address!); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Copy className="h-3.5 w-3.5" /> Copy address
            </button>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View on Explorer
            </a>
            <button
              onClick={() => { disconnectWallet(); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
