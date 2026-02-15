
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { VisionCanvasTool } from './VisionCanvasTool';
import { Target } from 'lucide-react';

export const visionCanvasDefinition: ToolDefinition = {
    id: 'vision-canvas',
    name: 'Vision Canvas',
    description: 'Strategic alignment tool for Goals, Pillars, and Values.',
    icon: Target,
    component: VisionCanvasTool,
    validationProfileId: 'vision_canvas_v1',
    path: '/tools/vision-canvas'
};
