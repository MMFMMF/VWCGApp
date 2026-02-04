/**
 * Tool Wrapper Component
 *
 * Connects tool components to Zustand store, handling:
 * - Data loading from store
 * - Update callbacks
 * - Default data initialization
 * - Loading states
 * - Tool metadata display
 */

import { Suspense } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import type { ToolDefinition } from '../types/tool';

interface Props {
  /** Tool definition from registry */
  tool: ToolDefinition;
  /** Whether tool is in read-only mode */
  readonly?: boolean;
}

/**
 * Loading fallback shown while tool component loads
 */
function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

/**
 * Tool wrapper that connects tools to state management
 */
export function ToolWrapper({ tool, readonly = false }: Props) {
  // Get tool data and update function from store
  const toolData = useWorkspaceStore((state) => state.tools[tool.metadata.id as any]);
  const updateToolData = useWorkspaceStore((state) => state.updateToolData);

  // Get the tool component
  const Component = tool.component;

  // Initialize with default data if not present
  const data = toolData?.data ?? (tool.getDefaultData?.() || {});

  // Create update callback that updates the store
  const handleUpdate = (newData: Record<string, unknown>) => {
    updateToolData(tool.metadata.id as any, {
      data: newData,
      completed: false, // Will be set to true by tool when validation passes
    });
  };

  return (
    <div className="tool-container">
      {/* Tool header with metadata */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tool.metadata.name}</h1>
        <p className="mt-1 text-gray-600">{tool.metadata.description}</p>
        {tool.metadata.estimatedTime && (
          <span className="text-sm text-gray-500">
            Estimated time: {tool.metadata.estimatedTime} minutes
          </span>
        )}
      </header>

      {/* Tool component wrapped in Suspense for lazy loading */}
      <Suspense fallback={<ToolLoadingFallback />}>
        <Component
          data={data}
          onUpdate={handleUpdate}
          readonly={readonly}
        />
      </Suspense>
    </div>
  );
}
