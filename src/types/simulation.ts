export interface SimulationResult {
  avgLatencyMs: number;
  p99LatencyMs: number;
  throughputRps: number;
  dbQps: number;
  cacheQps: number;
  bottleneck: string;
  estimatedMonthlyCost: number;
  saturationPoint: number;
  nodeMetrics: Record<string, NodeSimMetrics>;
  scalingData: ScalingDataPoint[];
  latencyDistribution: LatencyDataPoint[];
}

export interface NodeSimMetrics {
  utilization: number;
  currentRps: number;
  currentLatency: number;
  queueLength: number;
  status: "healthy" | "warning" | "bottleneck" | "overloaded";
}

export interface ScalingDataPoint {
  servers: number;
  throughput: number;
  latency: number;
}

export interface LatencyDataPoint {
  load: number;
  avgLatency: number;
  p99Latency: number;
}
