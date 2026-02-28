"use client";

import React, { useState } from "react";
import { Download, Image, FileCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDesignStore } from "@/stores/useDesignStore";
import { exportToPng } from "@/lib/export/png";
import { copyMermaidToClipboard } from "@/lib/export/mermaid";

export function ExportMenu() {
  const nodes = useDesignStore((s) => s.nodes);
  const edges = useDesignStore((s) => s.edges);
  const designName = useDesignStore((s) => s.designName);
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  if (nodes.length === 0) return null;

  const handleExportPng = async () => {
    const el = document.querySelector(".react-flow") as HTMLElement | null;
    if (!el) return;
    const filename = designName
      ? designName.toLowerCase().replace(/\s+/g, "-")
      : "system-design";
    await exportToPng(el, filename);
  };

  const handleCopyMermaid = async () => {
    await copyMermaidToClipboard(nodes, edges);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPng} className="gap-2">
          <Image className="w-4 h-4" />
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyMermaid} className="gap-2">
          {copiedMermaid ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <FileCode className="w-4 h-4" />
              Copy Mermaid
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
