/**
 * M/M/c Queuing Theory Model
 *
 * Models a system with Poisson arrivals (rate λ), exponential service times
 * (rate μ per server), and c parallel servers.
 */

export interface QueueMetrics {
  utilization: number;
  avgWaitTimeMs: number;
  avgQueueLength: number;
  probabilityOfQueuing: number;
  isStable: boolean;
}

/**
 * Calculate Erlang C formula (probability of queuing in M/M/c)
 */
function erlangC(
  arrivalRate: number,
  serviceRate: number,
  servers: number
): number {
  const rho = arrivalRate / (servers * serviceRate);
  if (rho >= 1) return 1;

  const a = arrivalRate / serviceRate; // offered load

  // Calculate (a^c / c!) * (1 / (1 - rho))
  let numerator = 1;
  for (let i = 0; i < servers; i++) {
    numerator *= a / (i + 1);
  }
  numerator /= 1 - rho;

  // Calculate sum of (a^k / k!) for k = 0 to c-1
  let sum = 0;
  let term = 1;
  for (let k = 0; k < servers; k++) {
    sum += term;
    term *= a / (k + 1);
  }

  return numerator / (sum + numerator);
}

export function calculateQueueMetrics(
  arrivalRate: number,
  serviceRate: number,
  servers: number
): QueueMetrics {
  if (arrivalRate <= 0 || serviceRate <= 0 || servers <= 0) {
    return {
      utilization: 0,
      avgWaitTimeMs: 0,
      avgQueueLength: 0,
      probabilityOfQueuing: 0,
      isStable: true,
    };
  }

  const rho = arrivalRate / (servers * serviceRate);
  const isStable = rho < 1;

  if (!isStable) {
    return {
      utilization: 1,
      avgWaitTimeMs: Infinity,
      avgQueueLength: Infinity,
      probabilityOfQueuing: 1,
      isStable: false,
    };
  }

  const pC = erlangC(arrivalRate, serviceRate, servers);

  // Average wait time in queue: Ec / (c * μ - λ) * 1000 (convert to ms)
  const avgWaitTimeMs = (pC / (servers * serviceRate - arrivalRate)) * 1000;

  // Average number in queue: λ * Wq
  const avgQueueLength = arrivalRate * (avgWaitTimeMs / 1000);

  return {
    utilization: rho,
    avgWaitTimeMs: Math.max(0, avgWaitTimeMs),
    avgQueueLength: Math.max(0, avgQueueLength),
    probabilityOfQueuing: pC,
    isStable,
  };
}
