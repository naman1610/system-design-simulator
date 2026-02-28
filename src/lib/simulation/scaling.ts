/**
 * Scaling Curves using Universal Scalability Law (USL)
 *
 * C(N) = N / (1 + α(N-1) + β·N·(N-1))
 * where:
 *   N = number of processing units (servers/replicas)
 *   α = contention parameter (serialization, locks)
 *   β = coherency parameter (crosstalk/coordination between nodes)
 */

import type { ScalingDataPoint, LatencyDataPoint } from "@/types/simulation";

export interface ScalingParams {
  alpha: number; // contention (0.01 - 0.3 typical)
  beta: number; // coherency (0.001 - 0.05 typical)
  baseCapacity: number; // single-node capacity (RPS)
  baseLatencyMs: number;
}

/**
 * USL throughput calculation
 */
export function uslThroughput(
  servers: number,
  params: ScalingParams
): number {
  const { alpha, beta, baseCapacity } = params;
  const n = servers;
  const scaleFactor = n / (1 + alpha * (n - 1) + beta * n * (n - 1));
  return baseCapacity * scaleFactor;
}

/**
 * Generate throughput scaling curve data for charting
 */
export function generateScalingCurve(
  params: ScalingParams,
  maxServers: number = 50
): ScalingDataPoint[] {
  const points: ScalingDataPoint[] = [];

  for (let n = 1; n <= maxServers; n++) {
    const throughput = uslThroughput(n, params);
    // Latency increases as we add coordination overhead
    const latency = params.baseLatencyMs * (1 + params.alpha * 0.1 * n + params.beta * 0.5 * n * n / maxServers);

    points.push({
      servers: n,
      throughput: Math.round(throughput),
      latency: Math.round(latency * 100) / 100,
    });
  }

  return points;
}

/**
 * Generate latency vs load curve data for charting
 */
export function generateLatencyVsLoad(
  maxRps: number,
  systemCapacity: number,
  baseLatencyMs: number,
  steps: number = 20
): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];

  for (let i = 1; i <= steps; i++) {
    const load = Math.round((maxRps * i) / steps);
    const utilization = load / systemCapacity;

    let avgLatency: number;
    let p99Latency: number;

    if (utilization >= 1) {
      avgLatency = 10000; // Saturated
      p99Latency = 30000;
    } else {
      // M/M/1 response time: T = 1/(μ-λ) scaled by base latency
      avgLatency = baseLatencyMs / (1 - Math.min(utilization, 0.99));
      // P99 approximation: ~3.5x average for log-normal distribution
      p99Latency = avgLatency * 3.5;
    }

    points.push({
      load,
      avgLatency: Math.round(avgLatency),
      p99Latency: Math.round(p99Latency),
    });
  }

  return points;
}

/**
 * Get default scaling parameters based on component type
 */
export function getScalingParamsForType(
  componentType: string
): ScalingParams {
  const defaults: Record<string, ScalingParams> = {
    microservice: { alpha: 0.05, beta: 0.005, baseCapacity: 5000, baseLatencyMs: 10 },
    database: { alpha: 0.15, beta: 0.02, baseCapacity: 2000, baseLatencyMs: 5 },
    cache: { alpha: 0.02, beta: 0.001, baseCapacity: 50000, baseLatencyMs: 1 },
    load_balancer: { alpha: 0.03, beta: 0.002, baseCapacity: 50000, baseLatencyMs: 1 },
    api_gateway: { alpha: 0.05, beta: 0.003, baseCapacity: 30000, baseLatencyMs: 3 },
    message_queue: { alpha: 0.08, beta: 0.01, baseCapacity: 20000, baseLatencyMs: 2 },
  };

  return defaults[componentType] ?? {
    alpha: 0.1,
    beta: 0.01,
    baseCapacity: 5000,
    baseLatencyMs: 10,
  };
}
