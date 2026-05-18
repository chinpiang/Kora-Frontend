"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

const WALLETS = [
  {
    id: "freighter",
    name: "Freighter",
    description: "Browser extension by Stellar Development Foundation",
    icon: "🔑",
    popular: true,
  },
  {
    id: "xbull",
    name: "xBull Wallet",
    description: "Feature-rich Stellar wallet",
    icon: "🐂",
    popular: false,
  },
  {
    id: "lobstr",
    name: "LOBSTR",
    description: "Simple and secure Stellar wallet",
    icon: "🦞",
    popular: false,
  },
  {
    id: "albedo",
    name: "Albedo",
    description: "Web-based Stellar signer",
    icon: "✨",
    popular: false,
  },
];

export function WalletConnectModal() {
  const { walletModalOpen, setWalletModalOpen } = useUIStore();
  const { connectWallet, isConnected } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    try {
      await connectWallet(walletId);
      setWalletModalOpen(false);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(null);
    }
  };

  if (isConnected) return null;

  return (
    <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-kora-500/10 text-kora-400">
            <Wallet className="h-5 w-5" />
          </div>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your Stellar wallet to access Kora Protocol.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {WALLETS.map((wallet, i) => (
            <motion.button
              key={wallet.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleConnect(wallet.id)}
              disabled={!!connecting}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3.5",
                "text-left transition-all hover:border-zinc-700 hover:bg-zinc-800",
                "disabled:cursor-not-allowed disabled:opacity-50",
                connecting === wallet.id && "border-kora-500/30 bg-kora-500/5"
              )}
            >
              <span className="text-2xl">{wallet.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">{wallet.name}</span>
                  {wallet.popular && (
                    <span className="rounded bg-kora-500/10 px-1.5 py-0.5 text-[10px] font-medium text-kora-400">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{wallet.description}</p>
              </div>
              {connecting === wallet.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-kora-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              )}
            </motion.button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          By connecting, you agree to our{" "}
          <a href="/terms" className="text-zinc-500 hover:text-zinc-300">
            Terms of Service
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
