import { toPng } from "html-to-image";

/**
 * Export the React Flow canvas to a PNG image and trigger download.
 * Pass the wrapper element that contains the ReactFlow component.
 */
export async function exportToPng(
  element: HTMLElement,
  filename: string = "system-design"
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    filter: (node) => {
      // Exclude minimap and controls from export
      const classList = node.classList;
      if (!classList) return true;
      if (
        classList.contains("react-flow__minimap") ||
        classList.contains("react-flow__controls") ||
        classList.contains("react-flow__panel")
      )
        return false;
      return true;
    },
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
