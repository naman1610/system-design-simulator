"use client";

import type { NodeTypes } from "@xyflow/react";
import { BaseNode } from "./BaseNode";

// All component types use the same BaseNode renderer,
// which adapts its icon, color, and styling based on the node.data.type field.
// This is registered per component type so React Flow dispatches correctly.
export const nodeTypes: NodeTypes = {
  client: BaseNode,
  cdn: BaseNode,
  load_balancer: BaseNode,
  api_gateway: BaseNode,
  microservice: BaseNode,
  database: BaseNode,
  cache: BaseNode,
  message_queue: BaseNode,
  storage: BaseNode,
  search_engine: BaseNode,
  notification_service: BaseNode,
};
