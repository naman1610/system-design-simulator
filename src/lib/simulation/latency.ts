/**
 * Network and End-to-End Latency Models
 */

export interface LatencyComponents {
  processingMs: number;
  networkMs: number;
  queueWaitMs: number;
  totalMs: number;
}

/**
 * Calculate processing latency for a component
 */
export function calculateProcessingLatency(
  baseLatencyMs: number,
  utilization: number
): number {
  if (utilization >= 1) return Infinity;

  // As utilization increases, latency increases non-linearly
  // Based on M/M/1 response time formula: T = 1/(μ - λ) = (1/μ) / (1 - ρ)
  return baseLatencyMs / (1 - Math.min(utilization, 0.99));
}

/**
 * Network hop latency between components
 */
export function networkHopLatency(
  protocol: string = "http"
): number {
  const latencyMap: Record<string, number> = {
    http: 1.0,
    grpc: 0.5,
    websocket: 0.3,
    tcp: 0.5,
    async: 2.0, // Includes queue overhead
  };
  return latencyMap[protocol] || 1.0;
}

/**
 * P99 latency estimation from average latency
 * Models latency as log-normal distribution
 */
export function estimateP99(avgLatencyMs: number, sigma: number = 0.7): number {
  // P99 ≈ median × e^(2.326 × σ)
  // For log-normal: median ≈ avg × e^(-σ²/2)
  const median = avgLatencyMs * Math.exp(-(sigma * sigma) / 2);
  return median * Math.exp(2.326 * sigma);
}

/**
 * Tail latency amplification for fan-out requests
 * If a request fans out to N services in parallel:
 * P99_total ≈ 1 - (1 - p99_single)^N mapped to latency
 */
export function tailLatencyAmplification(
  singleP99Ms: number,
  fanOutDegree: number
): number {
  if (fanOutDegree <= 1) return singleP99Ms;
  // Approximate: P99 increases roughly logarithmically with fan-out
  return singleP99Ms * (1 + 0.3 * Math.log(fanOutDegree));
}
