import { create } from "zustand";
import type {
  DesignNode,
  DesignEdge,
  TrafficEstimation,
} from "@/types/design";
import type { ComponentType } from "@/types/components";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type {
  OnNodesChange,
  OnEdgesChange,
} from "@xyflow/react";
import {
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

interface DesignStore {
  // State
  nodes: DesignNode[];
  edges: DesignEdge[];
  designName: string;
  prompt: string;
  trafficEstimation: TrafficEstimation | null;
  explanation: string;
  isGenerating: boolean;
  generationError: string | null;
  selectedNodeId: string | null;

  // Actions
  setDesign: (data: {
    nodes: DesignNode[];
    edges: DesignEdge[];
    trafficEstimation: TrafficEstimation | null;
    explanation: string;
    prompt: string;
    name: string;
  }) => void;
  setNodes: (nodes: DesignNode[]) => void;
  setEdges: (edges: DesignEdge[]) => void;
  onNodesChange: OnNodesChange<DesignNode>;
  onEdgesChange: OnEdgesChange<DesignEdge>;
  updateNodeParams: (nodeId: string, params: Partial<DesignNode["data"]["params"]>) => void;
  addNode: (type: ComponentType, position: { x: number; y: number }) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  reset: () => void;
}

const initialState = {
  nodes: [] as DesignNode[],
  edges: [] as DesignEdge[],
  designName: "",
  prompt: "",
  trafficEstimation: null as TrafficEstimation | null,
  explanation: "",
  isGenerating: false,
  generationError: null as string | null,
  selectedNodeId: null as string | null,
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  ...initialState,

  setDesign: (data) =>
    set({
      nodes: data.nodes,
      edges: data.edges,
      trafficEstimation: data.trafficEstimation,
      explanation: data.explanation,
      prompt: data.prompt,
      designName: data.name,
      generationError: null,
    }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  updateNodeParams: (nodeId, params) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                params: { ...node.data.params, ...params },
              },
            }
          : node
      ),
    });
  },

  addNode: (type, position) => {
    const template = COMPONENT_REGISTRY[type];
    const id = `${type}-${Date.now()}`;
    const newNode: DesignNode = {
      id,
      type,
      position,
      data: {
        type,
        label: template.label,
        description: template.description,
        params: { ...template.defaultParams },
        status: "healthy",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationError: (error) => set({ generationError: error }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  reset: () => set(initialState),
}));
