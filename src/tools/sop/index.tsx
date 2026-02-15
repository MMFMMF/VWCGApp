
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { SopTaxonomyTool } from './SopTaxonomyTool';
import { SopCreationTool } from './SopCreationTool';
import { SopManagementTool } from './SopManagementTool';
import { Network, PenTool, BookOpen } from 'lucide-react';

export const sopTaxonomyDefinition: ToolDefinition = {
    id: 'sop-taxonomy',
    name: 'SOP Taxonomy',
    description: 'Design process hierarchy.',
    icon: Network,
    component: SopTaxonomyTool,
    validationProfileId: 'sop_taxonomy_v1',
    path: '/tools/sop-taxonomy'
};

export const sopCreationDefinition: ToolDefinition = {
    id: 'sop-creation',
    name: 'SOP Creation',
    description: 'Build new SOPs.',
    icon: PenTool,
    component: SopCreationTool,
    validationProfileId: 'sop_create_v1',
    path: '/tools/sop-creation'
};

export const sopManagementDefinition: ToolDefinition = {
    id: 'sop-management',
    name: 'SOP Management',
    description: 'Manage SOP library.',
    icon: BookOpen,
    component: SopManagementTool,
    validationProfileId: 'sop_manage_v1',
    path: '/tools/sop-management'
};
