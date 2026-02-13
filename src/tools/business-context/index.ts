import type { ToolDefinition } from '@/registry/ToolRegistry';
import { BusinessContextTool } from './BusinessContextTool';
import { Building2 } from 'lucide-react';

export const businessContextDefinition: ToolDefinition = {
  id: 'business-context',
  name: 'Business Context',
  description: 'Company demographics for benchmarking and financial analysis',
  path: '/tools/business-context',
  icon: Building2,
  component: BusinessContextTool,
};
