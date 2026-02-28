import { create } from "zustand";
import type { SimulationConfig } from "@/types/design";
import type { SimulationResult } from "@/types/simulation";

interface SimulationStore {
  // State
  config: SimulationConfig;
  result: SimulationResult | null;
  isSimulating: boolean;
  autoSimulate: boolean;

  // Actions
  setConfig: (config: Partial<SimulationConfig>) => void;
  setResult: (result: SimulationResult | null) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  setAutoSimulate: (auto: boolean) => void;
  reset: () => void;
}

const defaultConfig: SimulationConfig = {
  durationSeconds: 60,
  trafficPattern: "constant",
  spikeMultiplier: 3,
  usersPerSecond: 1000,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  config: defaultConfig,
  result: null,
  isSimulating: false,
  autoSimulate: true,

  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  setResult: (result) => set({ result }),
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  setAutoSimulate: (auto) => set({ autoSimulate: auto }),
  reset: () => set({ config: defaultConfig, result: null, isSimulating: false }),
}));
