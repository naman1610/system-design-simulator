import dagre from "@dagrejs/dagre";
import type { DesignNode, DesignEdge } from "@/types/design";

interface LayoutOptions {
  direction?: "TB" | "LR";
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

export function applyAutoLayout(
  nodes: DesignNode[],
  edges: DesignEdge[],
  options: LayoutOptions = {}
): DesignNode[] {
  const {
    direction = "TB",
    nodeWidth = 220,
    nodeHeight = 100,
    rankSep = 80,
    nodeSep = 50,
  } = options;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes
  for (const node of nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }

  // Add edges
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  // Apply computed positions
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
}
