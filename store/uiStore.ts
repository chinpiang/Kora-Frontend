import { create } from "zustand";
import type { TxState } from "@/types";

interface UIStore {
  // Modals
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;

  // Transaction state
  txState: TxState;
  setTxState: (state: Partial<TxState>) => void;
  resetTxState: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  walletModalOpen: false,
  setWalletModalOpen: (walletModalOpen) => set({ walletModalOpen }),

  txState: { status: "idle" },
  setTxState: (state) =>
    set((s) => ({ txState: { ...s.txState, ...state } })),
  resetTxState: () => set({ txState: { status: "idle" } }),

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
