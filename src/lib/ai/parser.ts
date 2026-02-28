import { GenerationResponseSchema, type GenerationResponse } from "./schema";
import { callGemini } from "./gemini";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type { DesignNode, DesignEdge, TrafficEstimation } from "@/types/design";
import type { SystemComponentData, ComponentType } from "@/types/components";

const MAX_RETRIES = 2;

export interface ParsedDesign {
  nodes: DesignNode[];
  edges: DesignEdge[];
  trafficEstimation: TrafficEstimation;
  explanation: string;
}

function transformToReactFlow(data: GenerationResponse): ParsedDesign {
  const nodes: DesignNode[] = data.nodes.map((node, index) => {
    const nodeType = node.type as ComponentType;
    const template = COMPONENT_REGISTRY[nodeType];
    const mergedParams = {
      ...template.defaultParams,
      ...(node.params || {}),
    };

    const componentData: SystemComponentData = {
      type: nodeType,
      label: node.label,
      description: node.description,
      params: mergedParams,
      status: "healthy",
    };

    return {
      id: node.id,
      type: node.type,
      position: { x: 0, y: index * 150 }, // Placeholder — auto-layout will fix this
      data: componentData,
    };
  });

  const edges: DesignEdge[] = data.edges.map((edge, index) => ({
    id: `e-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: edge.protocol === "async",
    label: edge.label,
    data: {
      protocol: edge.protocol,
      label: edge.label,
    },
  }));

  return {
    nodes,
    edges,
    trafficEstimation: data.trafficEstimation,
    explanation: data.explanation,
  };
}

export async function generateDesign(prompt: string): Promise<ParsedDesign> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const userPrompt =
        attempt === 0
          ? buildUserPrompt(prompt)
          : `${buildUserPrompt(prompt)}\n\nPREVIOUS ATTEMPT FAILED VALIDATION: ${lastError?.message}\nPlease fix the issues and return valid JSON.`;

      const rawJson = await callGemini(SYSTEM_PROMPT, userPrompt);

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        throw new Error(`Invalid JSON response: ${rawJson.substring(0, 200)}`);
      }

      // Validate with Zod
      const result = GenerationResponseSchema.safeParse(parsed);
      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        throw new Error(`Schema validation failed: ${errorMessages}`);
      }

      // Transform to React Flow format
      return transformToReactFlow(result.data);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to generate design after ${MAX_RETRIES + 1} attempts: ${lastError.message}`
        );
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unexpected generation failure");
}
