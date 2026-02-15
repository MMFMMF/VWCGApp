
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { AdvisorTool } from './AdvisorTool';
import { ClipboardCheck } from 'lucide-react';

export const advisorDefinition: ToolDefinition = {
    id: 'advisor-readiness',
    name: 'Advisor Readiness',
    description: 'Comprehensive diagnostic for scaling readiness (Appendix J).',
    icon: ClipboardCheck,
    component: AdvisorTool,
    validationProfileId: 'advisor_readiness_v1',
    path: '/tools/advisor-readiness'
};
