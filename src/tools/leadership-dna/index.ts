import type { ToolDefinition } from '../../registry/ToolRegistry';
import { LeadershipDnaTool } from './LeadershipDnaTool';
import { Users } from 'lucide-react';

export const leadershipDnaDefinition: ToolDefinition = {
    id: 'leadership-dna',
    name: 'Leadership DNA',
    description: 'Gap analysis for leadership competencies',
    path: '/tools/leadership-dna',
    icon: Users,
    component: LeadershipDnaTool,
    validationProfileId: 'leadership_radar_v1'
};
