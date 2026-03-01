import type { ReactFlowInstance } from "@xyflow/react";

let _instance: ReactFlowInstance | null = null;

export function setReactFlowInstance(rf: ReactFlowInstance | null) {
  _instance = rf;
}

export function getReactFlowInstance(): ReactFlowInstance | null {
  return _instance;
}
