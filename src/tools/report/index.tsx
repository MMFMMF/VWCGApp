
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { ReportCenter } from './ReportCenter';
import { FileDown } from 'lucide-react';

export const reportCenterDefinition: ToolDefinition = {
    id: 'report-center',
    name: 'Report Center',
    description: 'Generate and export comprehensive reports.',
    icon: FileDown,
    component: ReportCenter,
    path: '/tools/report'
};
