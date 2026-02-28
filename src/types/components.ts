export const COMPONENT_TYPES = [
  "client",
  "cdn",
  "load_balancer",
  "api_gateway",
  "microservice",
  "database",
  "cache",
  "message_queue",
  "storage",
  "search_engine",
  "notification_service",
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export interface ComponentParams {
  throughputRps?: number;
  latencyMs?: number;
  replicas?: number;
  cacheHitRate?: number;
  failureRate?: number;
  costPerHourUsd?: number;
  queueDepth?: number;
  storageGb?: number;
  connectionsMax?: number;
}

export interface ComponentMetrics {
  currentRps?: number;
  currentLatency?: number;
  utilization?: number;
  queueLength?: number;
}

export type ComponentStatus = "healthy" | "warning" | "bottleneck" | "overloaded";

export interface SystemComponentData {
  type: ComponentType;
  label: string;
  description?: string;
  params: ComponentParams;
  status?: ComponentStatus;
  metrics?: ComponentMetrics;
  [key: string]: unknown;
}
