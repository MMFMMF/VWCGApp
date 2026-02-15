
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { AuthorityTool } from './AuthorityTool';
import { Shield } from 'lucide-react';

export const authorityDefinition: ToolDefinition = {
    id: 'authority-tracker',
    name: 'Authority Tracker',
    description: 'Track competitors, moats, and niche vocabulary.',
    icon: Shield,
    component: AuthorityTool,
    path: '/tools/authority'
};
