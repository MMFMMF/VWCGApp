/**
 * Tool Registry Index - Central entry point for tool system
 *
 * Re-exports the tool registry and types.
 * Tool imports will be added here as tools are created.
 * Each tool module should self-register by calling toolRegistry.register()
 */

// Re-export registry
export { toolRegistry } from './toolRegistry';

// Re-export types for convenience
export type { ToolDefinition, ToolProps, ToolMetadata } from '../../types/tool';

// Import tools to trigger auto-registration
// Each tool file registers itself when imported
import '../../components/tools/ExampleTool';
import '../../components/tools/AIReadinessTool';
import '../../components/tools/LeadershipDNATool';
import '../../components/tools/BusinessEQTool';
import '../../components/tools/VisionCanvasTool';
import '../../components/tools/SWOTAnalysisTool';
import '../../components/tools/AdvisorReadinessTool';
import '../../components/tools/FinancialReadinessTool';

// Future tools will be added here:
// etc.
