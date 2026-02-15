import type { LucideIcon } from 'lucide-react';

export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    path: string;
    icon: LucideIcon;
    component: React.ComponentType;
    validationProfileId?: string;
}

const registry: Record<string, ToolDefinition> = {};

export const registerTool = (tool: ToolDefinition) => {
    if (registry[tool.id]) {
        console.warn(`Tool with id ${tool.id} is already registered.`);
        return;
    }
    registry[tool.id] = tool;
};

export const getTools = () => Object.values(registry);

export const getTool = (id: string) => registry[id];
