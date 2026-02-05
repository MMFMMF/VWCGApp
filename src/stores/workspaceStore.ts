/**
 * Zustand store for workspace state management
 *
 * Features:
 * - Automatic localStorage persistence
 * - Migration support for schema changes
 * - Type-safe state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WorkspaceStore,
  WorkspaceState,
  ToolId,
  ToolData,
  WorkspaceMeta,
  SynthesisState,
  Insight,
} from '../types/workspace';
import { initialWorkspaceState, WORKSPACE_VERSION } from '../types/workspace';
import type { SynthesisResult, SynthesisContext } from '../lib/synthesis/types';

/**
 * Generate a unique ID for workspace and insights
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate ISO timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create initial workspace with proper IDs and timestamps
 */
function createInitialWorkspace(): WorkspaceState {
  return {
    ...initialWorkspaceState,
    meta: {
      ...initialWorkspaceState.meta,
      id: generateId(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    },
  };
}

/**
 * Migration function for handling version upgrades
 */
function migrateWorkspace(persistedState: any, version: number): WorkspaceState {
  // If no persisted state, return initial
  if (!persistedState) {
    return createInitialWorkspace();
  }

  // If versions match, return as-is
  if (persistedState.meta?.version === WORKSPACE_VERSION) {
    return persistedState as WorkspaceState;
  }

  // Handle migrations from older versions
  let migrated = { ...persistedState };

  // Example migration from version 0 to 1
  if (version < 1) {
    // Add any necessary transformations for v1
    migrated.meta = {
      ...migrated.meta,
      version: 1,
    };
  }

  // Future migrations would go here
  // if (version < 2) { ... }

  return migrated as WorkspaceState;
}

/**
 * Create the workspace store
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      // Initial state
      ...createInitialWorkspace(),

      // Actions
      updateToolData: (toolId: ToolId, data: Partial<ToolData>) => {
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              ...state.tools[toolId],
              ...data,
              lastRun: data.lastRun || getTimestamp(),
            },
          },
          meta: {
            ...state.meta,
            updatedAt: getTimestamp(),
          },
        }));

        // Trigger synthesis after state update (debounced)
        setTimeout(() => {
          const currentState = useWorkspaceStore.getState();
          currentState.runSynthesis();
        }, 500);
      },

      setMeta: (meta: Partial<WorkspaceMeta>) => {
        set((state) => ({
          meta: {
            ...state.meta,
            ...meta,
            updatedAt: getTimestamp(),
          },
        }));
      },

      setSynthesis: (synthesis: Partial<SynthesisState>) => {
        set((state) => ({
          synthesis: {
            ...state.synthesis,
            ...synthesis,
            lastRun: synthesis.lastRun || getTimestamp(),
          },
          meta: {
            ...state.meta,
            updatedAt: getTimestamp(),
          },
        }));
      },

      addInsight: (insight: Omit<Insight, 'id' | 'generatedAt'>) => {
        set((state) => ({
          insights: [
            ...state.insights,
            {
              ...insight,
              id: generateId(),
              generatedAt: getTimestamp(),
            },
          ],
          meta: {
            ...state.meta,
            updatedAt: getTimestamp(),
          },
        }));
      },

      removeInsight: (insightId: string) => {
        set((state) => ({
          insights: state.insights.filter((insight) => insight.id !== insightId),
          meta: {
            ...state.meta,
            updatedAt: getTimestamp(),
          },
        }));
      },

      clearWorkspace: () => {
        set(createInitialWorkspace());
      },

      loadWorkspace: (workspace: WorkspaceState) => {
        set({
          ...workspace,
          meta: {
            ...workspace.meta,
            updatedAt: getTimestamp(),
          },
        });
      },

      runSynthesis: () => {
        const state = useWorkspaceStore.getState();

        // Dynamic import to avoid circular dependencies
        import('../lib/synthesis/rules').then(({ synthesisRuleRegistry }) => {
          const context: SynthesisContext = {
            tools: state.tools as Record<string, unknown>,
            meta: {
              companyName: state.meta.name || '',
              assessmentDate: new Date().toISOString(),
            },
          };

          const result = synthesisRuleRegistry.evaluateAll(context);

          set((state) => ({
            synthesisResult: result,
            meta: {
              ...state.meta,
              updatedAt: getTimestamp(),
            },
          }));
        }).catch(error => {
          console.error('Synthesis evaluation failed:', error);
        });
      },
    }),
    {
      name: 'vwcg-workspace',
      storage: createJSONStorage(() => localStorage),
      version: WORKSPACE_VERSION,
      migrate: migrateWorkspace,
      // Only persist workspace data, not UI state
      partialize: (state) => ({
        meta: state.meta,
        tools: state.tools,
        insights: state.insights,
        synthesis: state.synthesis,
        synthesisResult: state.synthesisResult,
      }),
    }
  )
);
