import type { Node, Edge, Viewport } from "@xyflow/react";
import type { SystemComponentData } from "./components";

export type DesignNode = Node<SystemComponentData>;

export interface DesignEdgeData {
  protocol?: "http" | "grpc" | "websocket" | "tcp" | "async";
  label?: string;
  bandwidthMbps?: number;
  encrypted?: boolean;
  [key: string]: unknown;
}

export type DesignEdge = Edge<DesignEdgeData>;

export interface TrafficEstimation {
  dailyActiveUsers: number;
  peakRps: number;
  avgRequestSizeKb: number;
  readWriteRatio: number;
  storageGrowthGbPerMonth: number;
}

export interface SimulationConfig {
  durationSeconds: number;
  trafficPattern: "constant" | "spike" | "gradual_ramp" | "diurnal";
  spikeMultiplier?: number;
  usersPerSecond: number;
}

export interface DesignState {
  id: string;
  name: string;
  prompt: string;
  nodes: DesignNode[];
  edges: DesignEdge[];
  trafficEstimation: TrafficEstimation | null;
  simulationConfig: SimulationConfig;
  viewport: Viewport;
  explanation: string;
}
