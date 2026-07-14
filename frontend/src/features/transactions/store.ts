import { create } from "zustand";
import type { TransactionStatus } from "@/lib/constants";

export interface Transaction {
  id: string;
  hash: string | null;
  type: string;
  status: TransactionStatus;
  description: string;
  timestamp: number;
  error?: string;
  retryCount: number;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp" | "retryCount">) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  clearAll: () => void;
}

let txCounter = 0;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  addTransaction: (tx) => {
    const id = `tx_${Date.now()}_${++txCounter}`;
    const transaction: Transaction = {
      ...tx,
      id,
      timestamp: Math.floor(Date.now() / 1000),
      retryCount: 0,
    };
    set((state) => ({
      transactions: [transaction, ...state.transactions].slice(0, 100),
    }));
    return id;
  },

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),

  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    })),

  getTransaction: (id) => get().transactions.find((tx) => tx.id === id),

  clearAll: () => set({ transactions: [] }),
}));
