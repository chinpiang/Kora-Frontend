"use client";

/**
 * useWallet — wraps Stellar Wallets Kit with Zustand store.
 * Handles connect, disconnect, sign, and balance refresh.
 */
import { useCallback } from "react";
import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";
import { useWalletStore } from "@/store";
import { getAccountBalances } from "@/lib/stellar/client";
import type { WalletProvider } from "@/types";

// Singleton kit instance
let kit: StellarWalletsKit | null = null;

function getKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network:
        process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
          ? WalletNetwork.PUBLIC
          : WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
    });
  }
  return kit;
}

export function useWallet() {
  const { address, publicKey, isConnected, provider, balance, connect, disconnect, setBalance } =
    useWalletStore();

  const connectWallet = useCallback(
    async (walletId: string = FREIGHTER_ID) => {
      const walletKit = getKit();
      walletKit.setWallet(walletId);

      const { address: addr } = await walletKit.getAddress();

      // Fetch balances
      let bal = null;
      try {
        const raw = await getAccountBalances(addr);
        bal = {
          xlm: raw["XLM"] || "0",
          usdc: raw["USDC"] || "0",
          eurc: raw["EURC"] || "0",
        };
      } catch {
        // Account may not be funded yet on testnet
      }

      connect(walletId as WalletProvider, addr, addr);
      if (bal) setBalance(bal);
    },
    [connect, setBalance]
  );

  const disconnectWallet = useCallback(() => {
    kit = null;
    disconnect();
  }, [disconnect]);

  /**
   * Sign a transaction XDR with the connected wallet.
   * Returns the signed XDR string.
   */
  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!isConnected) throw new Error("Wallet not connected");
      const walletKit = getKit();
      const { signedTxXdr } = await walletKit.signTransaction(xdr, {
        address: address!,
        networkPassphrase:
          process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
          "Test SDF Network ; September 2015",
      });
      return signedTxXdr;
    },
    [isConnected, address]
  );

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const raw = await getAccountBalances(address);
      setBalance({
        xlm: raw["XLM"] || "0",
        usdc: raw["USDC"] || "0",
        eurc: raw["EURC"] || "0",
      });
    } catch {
      // silently fail
    }
  }, [address, setBalance]);

  return {
    address,
    publicKey,
    isConnected,
    provider,
    balance,
    connectWallet,
    disconnectWallet,
    signTransaction,
    refreshBalance,
  };
}
