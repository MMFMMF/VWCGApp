
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { RoadmapTool } from './RoadmapTool';
import { Map } from 'lucide-react';

export const roadmapDefinition: ToolDefinition = {
    id: 'roadmap',
    name: '90-Day Roadmap',
    description: 'Execution timeline for 30-60-90 day scaling plans.',
    icon: Map,
    component: RoadmapTool,
    validationProfileId: 'roadmap_90_v1',
    path: '/tools/roadmap'
};
