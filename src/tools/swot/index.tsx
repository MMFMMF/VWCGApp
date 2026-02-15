
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { SwotTool } from './SwotTool';
import { Shield } from 'lucide-react';

export const swotDefinition: ToolDefinition = {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Strategic planning tool (Strengths, Weaknesses, Opportunities, Threats).',
    icon: Shield,
    component: SwotTool,
    validationProfileId: 'swot_v1',
    path: '/tools/swot'
};
