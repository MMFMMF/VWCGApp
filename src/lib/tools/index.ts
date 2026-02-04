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

// Tool imports will be added here as tools are created
// Example:
// import '../../components/tools/AIReadinessTool';
// import '../../components/tools/LeadershipDNATool';

// For now, just export the registry
// Tools self-register when imported
