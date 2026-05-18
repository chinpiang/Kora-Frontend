"use client";

/**
 * useTransaction — manages the full lifecycle of a Soroban transaction:
 * build → sign → submit → confirm, with toast notifications.
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/store";
import { useWallet } from "./useWallet";
import { submitAndConfirm } from "@/services/invoiceService";

export function useTransaction() {
  const { setTxState, resetTxState } = useUIStore();
  const { signTransaction } = useWallet();

  const execute = useCallback(
    async (
      buildFn: () => Promise<string>, // returns unsigned XDR
      options?: {
        onSuccess?: (hash: string) => void;
        successMessage?: string;
      }
    ): Promise<string | null> => {
      const toastId = toast.loading("Building transaction…");
      setTxState({ status: "building" });

      try {
        // 1. Build
        const unsignedXdr = await buildFn();

        // 2. Sign
        toast.loading("Waiting for wallet signature…", { id: toastId });
        setTxState({ status: "signing" });
        const signedXdr = await signTransaction(unsignedXdr);

        // 3. Submit + confirm
        toast.loading("Submitting to Stellar network…", { id: toastId });
        setTxState({ status: "submitting" });
        const hash = await submitAndConfirm(signedXdr);

        setTxState({ status: "success", hash });
        toast.success(options?.successMessage || "Transaction confirmed!", {
          id: toastId,
          description: `Hash: ${hash.slice(0, 16)}…`,
        });

        options?.onSuccess?.(hash);
        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setTxState({ status: "error", error: message });
        toast.error("Transaction failed", { id: toastId, description: message });
        return null;
      } finally {
        // Reset after 3s so UI can show success state briefly
        setTimeout(resetTxState, 3000);
      }
    },
    [signTransaction, setTxState, resetTxState]
  );

  return { execute };
}
