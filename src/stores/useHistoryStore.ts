import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DesignNode, DesignEdge, TrafficEstimation } from "@/types/design";

export interface SavedDesign {
  id: string;
  name: string;
  prompt: string;
  nodes: DesignNode[];
  edges: DesignEdge[];
  trafficEstimation: TrafficEstimation | null;
  explanation: string;
  createdAt: number;
  updatedAt: number;
}

interface HistoryStore {
  designs: SavedDesign[];
  save: (design: Omit<SavedDesign, "id" | "createdAt" | "updatedAt">) => string;
  update: (id: string, design: Partial<SavedDesign>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      designs: [],

      save: (design) => {
        const id = `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const now = Date.now();
        const saved: SavedDesign = {
          ...design,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set({ designs: [saved, ...get().designs].slice(0, 50) }); // Keep max 50
        return id;
      },

      update: (id, partial) => {
        set({
          designs: get().designs.map((d) =>
            d.id === id ? { ...d, ...partial, updatedAt: Date.now() } : d
          ),
        });
      },

      remove: (id) => {
        set({ designs: get().designs.filter((d) => d.id !== id) });
      },

      clear: () => set({ designs: [] }),
    }),
    {
      name: "sds-history",
      version: 1,
    }
  )
);
