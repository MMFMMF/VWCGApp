/**
 * Custom hook for workspace operations
 *
 * Provides convenient access to workspace state and common operations
 * including export, import, and tool management.
 */

import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import {
  exportWorkspace,
  exportWorkspaceAsJSON,
  generateWorkspaceSummary,
} from '../lib/workspace/export';
import {
  importWorkspaceFromFile,
  formatValidationErrors,
  type ImportResult,
} from '../lib/workspace/import';
import type { ToolId, ToolData } from '../types/workspace';

/**
 * Hook return type
 */
interface UseWorkspaceReturn {
  // State
  workspace: ReturnType<typeof useWorkspaceStore>;

  // Tool operations
  getToolData: (toolId: ToolId) => ToolData | undefined;
  isToolCompleted: (toolId: ToolId) => boolean;
  completeToolCount: number;

  // Export operations
  handleExport: (filename?: string) => void;
  exportAsJSON: () => string;
  generateSummary: () => string;

  // Import operations
  handleImport: (file: File) => Promise<ImportResult>;

  // Clear operation
  handleClear: () => void;
}

/**
 * Custom hook for workspace operations
 */
export function useWorkspace(): UseWorkspaceReturn {
  const workspace = useWorkspaceStore();
  const { setLoading } = useUIStore();

  /**
   * Get data for a specific tool
   */
  const getToolData = (toolId: ToolId): ToolData | undefined => {
    return workspace.tools[toolId];
  };

  /**
   * Check if a tool is completed
   */
  const isToolCompleted = (toolId: ToolId): boolean => {
    return workspace.tools[toolId]?.completed ?? false;
  };

  /**
   * Count of completed tools
   */
  const completeToolCount = Object.values(workspace.tools).filter(
    (tool) => tool?.completed
  ).length;

  /**
   * Handle workspace export
   */
  const handleExport = (filename?: string) => {
    try {
      setLoading(true, 'Exporting workspace...');

      const state = {
        meta: workspace.meta,
        tools: workspace.tools,
        insights: workspace.insights,
        synthesis: workspace.synthesis,
      };

      exportWorkspace(state, filename);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export workspace as JSON string
   */
  const exportAsJSON = (): string => {
    const state = {
      meta: workspace.meta,
      tools: workspace.tools,
      insights: workspace.insights,
      synthesis: workspace.synthesis,
    };

    return exportWorkspaceAsJSON(state);
  };

  /**
   * Generate human-readable summary
   */
  const generateSummary = (): string => {
    const state = {
      meta: workspace.meta,
      tools: workspace.tools,
      insights: workspace.insights,
      synthesis: workspace.synthesis,
    };

    return generateWorkspaceSummary(state);
  };

  /**
   * Handle workspace import
   */
  const handleImport = async (file: File): Promise<ImportResult> => {
    try {
      setLoading(true, 'Importing workspace...');

      const result = await importWorkspaceFromFile(file);

      if (result.success && result.workspace) {
        // Load the imported workspace
        workspace.loadWorkspace(result.workspace);
      }

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        errors: [
          {
            field: 'import',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to import workspace',
          },
        ],
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle workspace clear
   */
  const handleClear = () => {
    workspace.clearWorkspace();
  };

  return {
    workspace,
    getToolData,
    isToolCompleted,
    completeToolCount,
    handleExport,
    exportAsJSON,
    generateSummary,
    handleImport,
    handleClear,
  };
}

/**
 * Hook for subscribing to specific tool data
 *
 * More efficient than useWorkspace when you only need one tool's data
 */
export function useToolData(toolId: ToolId): ToolData | undefined {
  return useWorkspaceStore((state) => state.tools[toolId]);
}

/**
 * Hook for checking if a tool is completed
 */
export function useIsToolCompleted(toolId: ToolId): boolean {
  return useWorkspaceStore(
    (state) => state.tools[toolId]?.completed ?? false
  );
}

/**
 * Hook for workspace metadata only
 */
export function useWorkspaceMeta() {
  return useWorkspaceStore((state) => state.meta);
}

/**
 * Hook for insights only
 */
export function useInsights() {
  return useWorkspaceStore((state) => ({
    insights: state.insights,
    addInsight: state.addInsight,
    removeInsight: state.removeInsight,
  }));
}

/**
 * Hook for synthesis state only
 */
export function useSynthesis() {
  return useWorkspaceStore((state) => ({
    synthesis: state.synthesis,
    setSynthesis: state.setSynthesis,
  }));
}
