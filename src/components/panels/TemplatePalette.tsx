"use client";

import React from "react";
import { getAllTemplates } from "@/lib/templates/registry";
import type { ComponentType } from "@/types/components";
import { ScrollArea } from "@/components/ui/scroll-area";

const templates = getAllTemplates();

interface TemplatePaletteProps {
  className?: string;
}

export function TemplatePalette({ className }: TemplatePaletteProps) {
  const onDragStart = (
    event: React.DragEvent,
    componentType: ComponentType
  ) => {
    event.dataTransfer.setData("application/reactflow", componentType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className={className}>
      <div className="p-3 border-b">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Components
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Drag onto canvas
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.type}
                draggable
                onDragStart={(e) => onDragStart(e, template.type)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md border cursor-grab active:cursor-grabbing transition-colors hover:bg-accent/50 ${template.borderColor} ${template.bgColor}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${template.color}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
                    {template.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {template.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
