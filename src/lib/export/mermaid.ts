import type { DesignNode, DesignEdge } from "@/types/design";
import type { ComponentType } from "@/types/components";

const MERMAID_SHAPES: Record<ComponentType, { open: string; close: string }> = {
  client: { open: "([", close: "])" },
  cdn: { open: "{{", close: "}}" },
  load_balancer: { open: "{", close: "}" },
  api_gateway: { open: "[/", close: "/]" },
  microservice: { open: "[", close: "]" },
  database: { open: "[(", close: ")]" },
  cache: { open: ">", close: "]" },
  message_queue: { open: "[[", close: "]]" },
  storage: { open: "[(", close: ")]" },
  search_engine: { open: "[", close: "]" },
  notification_service: { open: "((", close: "))" },
};

function sanitizeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/[[\]{}()|>]/g, " ").trim();
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Convert design nodes and edges to Mermaid flowchart syntax
 */
export function toMermaid(nodes: DesignNode[], edges: DesignEdge[]): string {
  const lines: string[] = ["flowchart TD"];

  // Node definitions
  for (const node of nodes) {
    const type = node.data.type as ComponentType;
    const shape = MERMAID_SHAPES[type] ?? { open: "[", close: "]" };
    const label = sanitizeLabel(node.data.label);
    const id = sanitizeId(node.id);
    const replicas = node.data.params.replicas ?? 1;
    const displayLabel =
      replicas > 1 ? `${label} x${replicas}` : label;
    lines.push(`    ${id}${shape.open}"${displayLabel}"${shape.close}`);
  }

  lines.push("");

  // Edge definitions
  for (const edge of edges) {
    const src = sanitizeId(edge.source);
    const tgt = sanitizeId(edge.target);
    const label = edge.data?.label || edge.label;
    const protocol = edge.data?.protocol;
    const isAsync = protocol === "async";

    let edgeStr: string;
    if (label) {
      edgeStr = isAsync
        ? `${src} -.->|"${sanitizeLabel(String(label))}"| ${tgt}`
        : `${src} -->|"${sanitizeLabel(String(label))}"| ${tgt}`;
    } else {
      edgeStr = isAsync ? `${src} -.-> ${tgt}` : `${src} --> ${tgt}`;
    }
    lines.push(`    ${edgeStr}`);
  }

  // Style classes
  lines.push("");
  lines.push("    %% Component type styles");

  const typeGroups = new Map<ComponentType, string[]>();
  for (const node of nodes) {
    const type = node.data.type as ComponentType;
    if (!typeGroups.has(type)) typeGroups.set(type, []);
    typeGroups.get(type)!.push(sanitizeId(node.id));
  }

  const MERMAID_COLORS: Record<string, string> = {
    client: "#dbeafe",
    cdn: "#dcfce7",
    load_balancer: "#f3e8ff",
    api_gateway: "#e0e7ff",
    microservice: "#e0f2fe",
    database: "#ffedd5",
    cache: "#fee2e2",
    message_queue: "#fef9c3",
    storage: "#ccfbf1",
    search_engine: "#cffafe",
    notification_service: "#fce7f3",
  };

  for (const [type, ids] of typeGroups.entries()) {
    const color = MERMAID_COLORS[type] ?? "#f1f5f9";
    lines.push(`    style ${ids.join(",")} fill:${color},stroke:#64748b`);
  }

  return lines.join("\n");
}

/**
 * Copy Mermaid text to clipboard
 */
export async function copyMermaidToClipboard(
  nodes: DesignNode[],
  edges: DesignEdge[]
): Promise<void> {
  const mermaid = toMermaid(nodes, edges);
  await navigator.clipboard.writeText(mermaid);
}
