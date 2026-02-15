import type { ToolDefinition } from '../../registry/ToolRegistry';
import { AiReadinessTool } from './AiReadinessTool';
import { BrainCircuit } from 'lucide-react';

export const aiReadinessDefinition: ToolDefinition = {
    id: 'ai-readiness',
    name: 'AI Readiness',
    description: 'Assess AI maturity across 6 dimensions',
    path: '/tools/ai-readiness',
    icon: BrainCircuit,
    component: AiReadinessTool,
    validationProfileId: 'aireadiness_v1'
};
