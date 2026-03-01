import { toPng } from "html-to-image";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { getReactFlowInstance } from "@/lib/reactflow-instance";

const IMAGE_PADDING = 50;
const MIN_IMAGE_WIDTH = 1024;
const MIN_IMAGE_HEIGHT = 768;

function nodeFilter(node: HTMLElement): boolean {
  const classList = node.classList;
  if (!classList) return true;
  if (
    classList.contains("react-flow__minimap") ||
    classList.contains("react-flow__controls") ||
    classList.contains("react-flow__panel")
  )
    return false;
  return true;
}

/**
 * Export the full React Flow diagram (all nodes) to a PNG image.
 * Uses getNodesBounds + getViewportForBounds to capture the entire graph,
 * not just the visible viewport.
 */
export async function exportToPng(
  _element: HTMLElement,
  filename: string = "system-design"
): Promise<void> {
  const instance = getReactFlowInstance();
  const viewportEl = document.querySelector(
    ".react-flow__viewport"
  ) as HTMLElement | null;

  if (!instance || !viewportEl) {
    // Fallback: capture the visible viewport only
    const el = document.querySelector(".react-flow") as HTMLElement | null;
    if (!el) return;
    const dataUrl = await toPng(el, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      filter: nodeFilter,
    });
    downloadDataUrl(dataUrl, filename);
    return;
  }

  const nodes = instance.getNodes();
  if (nodes.length === 0) return;

  const bounds = getNodesBounds(nodes);
  const imageWidth = Math.max(bounds.width + IMAGE_PADDING * 2, MIN_IMAGE_WIDTH);
  const imageHeight = Math.max(bounds.height + IMAGE_PADDING * 2, MIN_IMAGE_HEIGHT);

  const viewport = getViewportForBounds(
    bounds,
    imageWidth,
    imageHeight,
    0.5,
    2,
    IMAGE_PADDING / Math.max(bounds.width, bounds.height)
  );

  const dataUrl = await toPng(viewportEl, {
    backgroundColor: "#ffffff",
    width: imageWidth,
    height: imageHeight,
    pixelRatio: 2,
    style: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
    filter: nodeFilter,
  });

  downloadDataUrl(dataUrl, filename);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
