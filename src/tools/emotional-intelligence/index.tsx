import type { ToolDefinition } from '../../registry/ToolRegistry';
import { BeiComponent } from './BeiComponent';
import { HeartHandshake } from 'lucide-react';

export const beiDefinition: ToolDefinition = {
    id: 'bei',
    name: 'Business Emotional Intelligence',
    description: 'Track and visualize emotional intelligence metrics over time.',
    icon: HeartHandshake,
    component: BeiComponent,
    validationProfileId: 'bei_v1',
    path: '/tools/emotional-intelligence'
};
