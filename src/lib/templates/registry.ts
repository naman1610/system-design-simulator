import type { ComponentType, ComponentParams } from "@/types/components";
import {
  Globe,
  Shield,
  Server,
  Database,
  HardDrive,
  MemoryStick,
  Radio,
  Search,
  Bell,
  Monitor,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface ComponentTemplate {
  type: ComponentType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  bgColor: string;
  defaultParams: ComponentParams;
}

export const COMPONENT_REGISTRY: Record<ComponentType, ComponentTemplate> = {
  client: {
    type: "client",
    label: "Client",
    description: "End-user client (web browser, mobile app)",
    icon: Monitor,
    color: "text-blue-600",
    borderColor: "border-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    defaultParams: {
      throughputRps: 10000,
      latencyMs: 0,
      replicas: 1,
    },
  },
  cdn: {
    type: "cdn",
    label: "CDN",
    description: "Content Delivery Network for static assets",
    icon: Globe,
    color: "text-green-600",
    borderColor: "border-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    defaultParams: {
      throughputRps: 100000,
      latencyMs: 5,
      cacheHitRate: 0.92,
      replicas: 1,
      costPerHourUsd: 0.085,
    },
  },
  load_balancer: {
    type: "load_balancer",
    label: "Load Balancer",
    description: "Distributes traffic across server instances",
    icon: Layers,
    color: "text-purple-600",
    borderColor: "border-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    defaultParams: {
      throughputRps: 50000,
      latencyMs: 1,
      replicas: 2,
      costPerHourUsd: 0.025,
    },
  },
  api_gateway: {
    type: "api_gateway",
    label: "API Gateway",
    description: "API routing, auth, rate limiting",
    icon: Shield,
    color: "text-indigo-600",
    borderColor: "border-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    defaultParams: {
      throughputRps: 30000,
      latencyMs: 3,
      replicas: 2,
      costPerHourUsd: 0.035,
    },
  },
  microservice: {
    type: "microservice",
    label: "Microservice",
    description: "Application service (business logic)",
    icon: Server,
    color: "text-sky-600",
    borderColor: "border-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950",
    defaultParams: {
      throughputRps: 5000,
      latencyMs: 10,
      replicas: 3,
      costPerHourUsd: 0.12,
    },
  },
  database: {
    type: "database",
    label: "Database",
    description: "Persistent data storage (SQL/NoSQL)",
    icon: Database,
    color: "text-orange-600",
    borderColor: "border-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    defaultParams: {
      throughputRps: 2000,
      latencyMs: 5,
      replicas: 2,
      connectionsMax: 200,
      storageGb: 500,
      costPerHourUsd: 0.35,
    },
  },
  cache: {
    type: "cache",
    label: "Cache",
    description: "In-memory cache (Redis, Memcached)",
    icon: MemoryStick,
    color: "text-red-600",
    borderColor: "border-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    defaultParams: {
      throughputRps: 50000,
      latencyMs: 1,
      cacheHitRate: 0.85,
      replicas: 2,
      costPerHourUsd: 0.08,
    },
  },
  message_queue: {
    type: "message_queue",
    label: "Message Queue",
    description: "Async message broker (Kafka, RabbitMQ, SQS)",
    icon: Radio,
    color: "text-yellow-600",
    borderColor: "border-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    defaultParams: {
      throughputRps: 20000,
      latencyMs: 2,
      queueDepth: 10000,
      replicas: 3,
      costPerHourUsd: 0.1,
    },
  },
  storage: {
    type: "storage",
    label: "Object Storage",
    description: "Blob/object storage (S3, GCS)",
    icon: HardDrive,
    color: "text-teal-600",
    borderColor: "border-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950",
    defaultParams: {
      throughputRps: 5000,
      latencyMs: 20,
      storageGb: 1000,
      replicas: 1,
      costPerHourUsd: 0.023,
    },
  },
  search_engine: {
    type: "search_engine",
    label: "Search Engine",
    description: "Full-text search (Elasticsearch, Solr)",
    icon: Search,
    color: "text-cyan-600",
    borderColor: "border-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    defaultParams: {
      throughputRps: 3000,
      latencyMs: 15,
      replicas: 3,
      storageGb: 200,
      costPerHourUsd: 0.25,
    },
  },
  notification_service: {
    type: "notification_service",
    label: "Notification Service",
    description: "Push notifications, email, SMS",
    icon: Bell,
    color: "text-pink-600",
    borderColor: "border-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    defaultParams: {
      throughputRps: 10000,
      latencyMs: 50,
      replicas: 2,
      costPerHourUsd: 0.05,
    },
  },
};

export function getTemplate(type: ComponentType): ComponentTemplate {
  return COMPONENT_REGISTRY[type];
}

export function getAllTemplates(): ComponentTemplate[] {
  return Object.values(COMPONENT_REGISTRY);
}
