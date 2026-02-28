import { z } from "zod/v4";
import { COMPONENT_TYPES } from "@/types/components";

const componentTypeEnum = z.enum(COMPONENT_TYPES as unknown as [string, ...string[]]);

const NodeSchema = z.object({
  id: z.string(),
  type: componentTypeEnum,
  label: z.string(),
  description: z.string().optional(),
  params: z
    .object({
      throughputRps: z.number().optional(),
      latencyMs: z.number().optional(),
      replicas: z.number().int().min(1).optional(),
      cacheHitRate: z.number().min(0).max(1).optional(),
      failureRate: z.number().min(0).max(1).optional(),
      costPerHourUsd: z.number().optional(),
      queueDepth: z.number().optional(),
      storageGb: z.number().optional(),
      connectionsMax: z.number().optional(),
    })
    .optional(),
});

const EdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  protocol: z
    .enum(["http", "grpc", "websocket", "tcp", "async"])
    .optional(),
});

const TrafficEstimationSchema = z.object({
  dailyActiveUsers: z.number(),
  peakRps: z.number(),
  avgRequestSizeKb: z.number(),
  readWriteRatio: z.number(),
  storageGrowthGbPerMonth: z.number(),
});

export const GenerationResponseSchema = z.object({
  nodes: z.array(NodeSchema).min(2).max(30),
  edges: z.array(EdgeSchema).min(1),
  trafficEstimation: TrafficEstimationSchema,
  explanation: z.string(),
});

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;
export type GeneratedNode = z.infer<typeof NodeSchema>;
export type GeneratedEdge = z.infer<typeof EdgeSchema>;
