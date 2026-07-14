import { create } from "zustand";

export interface Child {
  address: string;
  name: string;
  allowanceAmount: number;
  interval: string;
  isActive: boolean;
  claimableBalance: number;
  lastDistribution: number;
}

export interface FamilyState {
  /** Current role of the connected wallet */
  role: "admin" | "parent" | "child" | null;
  /** Children managed by the connected parent */
  children: Child[];
  /** Vault balance for the connected parent */
  vaultBalance: {
    totalDeposited: number;
    totalDistributed: number;
    available: number;
  };
  /** Whether family operations are paused */
  isPaused: boolean;
  /** Loading state */
  isLoading: boolean;

  /** Actions */
  setRole: (role: FamilyState["role"]) => void;
  setChildren: (children: Child[]) => void;
  setVaultBalance: (balance: FamilyState["vaultBalance"]) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  addChild: (child: Child) => void;
  removeChild: (address: string) => void;
  updateChild: (address: string, updates: Partial<Child>) => void;
  reset: () => void;
}

const initialState = {
  role: null as FamilyState["role"],
  children: [] as Child[],
  vaultBalance: { totalDeposited: 0, totalDistributed: 0, available: 0 },
  isPaused: false,
  isLoading: false,
};

export const useFamilyStore = create<FamilyState>((set) => ({
  ...initialState,

  setRole: (role) => set({ role }),
  setChildren: (children) => set({ children }),
  setVaultBalance: (vaultBalance) => set({ vaultBalance }),
  setPaused: (isPaused) => set({ isPaused }),
  setLoading: (isLoading) => set({ isLoading }),

  addChild: (child) =>
    set((state) => ({ children: [...state.children, child] })),

  removeChild: (address) =>
    set((state) => ({
      children: state.children.filter((c) => c.address !== address),
    })),

  updateChild: (address, updates) =>
    set((state) => ({
      children: state.children.map((c) =>
        c.address === address ? { ...c, ...updates } : c
      ),
    })),

  reset: () => set(initialState),
}));
