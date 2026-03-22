import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateWorkspace } from '../validation/validator';
import { runSynthesis } from '../engine/synthesis';
import type { Insight } from '../engine/types';
import type { ValidationResult } from '../validation/types';

// localStorage key for persistence
const STORAGE_KEY = 'vwcg-workspace';



export const LOGIC_VERSION = 'v1.1.0';

export interface WorkspaceMetadata {
    id: string;
    createdAt: string;
    lastModified: string;
    name: string;
    // Provenance
    computed_under_logic_version?: string;
    created_by_agent?: string;
    schema_version: 'v1';
}



export interface WorkspaceState {
    // Core Data (Persisted)
    version: string;
    metadata: WorkspaceMetadata;
    tools: Record<string, any>;
    provenance: Record<string, { timestamp: string; logicVersion: string }>;

    // Ephemeral State (Not Persisted)
    isSafeMode: boolean;
    previewData: Partial<WorkspaceState> | null;
    validationResults: ValidationResult | null;
    insights: Insight[];
    lastExportTime: number;

    // Actions
    setName: (name: string) => void;
    updateToolData: (toolId: string, data: any) => void;
    stageWorkspace: (data: any) => void;
    commitWorkspace: (selectedToolIds?: string[]) => void;
    cancelLoad: () => void;
    loadWorkspace: (data: Partial<WorkspaceState>) => void;
    resetWorkspace: () => void;
    recomputeLogic: () => void;
    refreshInsights: () => void;
    exportState: () => string;
    loadTeaserAnswers: () => boolean;
}

const INITIAL_STATE = {
    version: '1.0',
    metadata: {
        id: '',
        createdAt: '',
        lastModified: '',
        name: 'My Business Strategy',
        schema_version: 'v1' as const,
        computed_under_logic_version: LOGIC_VERSION,
    },
    tools: {},
    provenance: {},

    // Safe Mode Defaults
    isSafeMode: false,
    previewData: null,
    validationResults: null,
    insights: [],

    // Ephemeral
    lastExportTime: 0,
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
    ...INITIAL_STATE,

    setName: (name) => set((state) => ({
        metadata: { ...state.metadata, name, lastModified: new Date().toISOString() }
    })),

    updateToolData: (toolId, data) => set((state) => {
        const nextTools = {
            ...state.tools,
            [toolId]: { ...(state.tools[toolId] || {}), ...data }
        };

        // Phase 5: Run Synthesis on every update (Debouncing recommended for prod, direct for MVP)
        // We pass the partial state simulation
        const simulation = { ...state, tools: nextTools };
        console.log('[workspaceStore] Running synthesis with tools:', Object.keys(nextTools));
        const newInsights = runSynthesis(simulation);
        console.log('[workspaceStore] Synthesis returned insights:', newInsights.length, newInsights);

        return {
            tools: nextTools,
            metadata: { ...state.metadata, lastModified: new Date().toISOString() },
            provenance: {
                ...state.provenance,
                [toolId]: {
                    timestamp: new Date().toISOString(),
                    logicVersion: LOGIC_VERSION
                }
            },
            insights: newInsights
        };
    }),

    // Phase 3: Explicit Logic Version Opt-In
    recomputeLogic: () => {
        set((state) => {
            const newProvenance = { ...state.provenance };
            // Update all existing tools to current logic version
            Object.keys(state.tools).forEach(toolId => {
                newProvenance[toolId] = {
                    timestamp: new Date().toISOString(),
                    logicVersion: LOGIC_VERSION
                };
            });

            return {
                metadata: {
                    ...state.metadata,
                    computed_under_logic_version: LOGIC_VERSION,
                    lastModified: new Date().toISOString()
                },
                provenance: newProvenance
            };
        });
    },

    // Re-run synthesis against current tool data (used by InsightsDashboard Refresh button)
    refreshInsights: () => {
        set((state) => {
            const newInsights = runSynthesis(state);
            return { insights: newInsights };
        });
    },

    // Phase 1: Stage Workspace (Safe Mode Enter)
    stageWorkspace: (data) => {
        // Phase 2: Integrated Validator Checks (L0 + L1 + L2)
        const validationResult = validateWorkspace(data);

        set({
            isSafeMode: true,
            previewData: data,
            validationResults: validationResult
        });
    },

    // Phase 1: Commit Workspace (Safe Mode Exit)
    commitWorkspace: (selectedToolIds) => {
        const { previewData } = get();
        if (!previewData) return;

        // Apply repairs only on commit
        const safeData = { ...previewData };
        if (!safeData.metadata) {
            safeData.metadata = { ...INITIAL_STATE.metadata, lastModified: new Date().toISOString() };
        }
        if (!safeData.tools) safeData.tools = {};
        if (!safeData.provenance) safeData.provenance = {};
        if (!safeData.metadata.schema_version) safeData.metadata.schema_version = 'v1';

        // Filter tools if selectedToolIds provided
        let toolsToLoad = safeData.tools || {};
        if (selectedToolIds && safeData.tools) {
            toolsToLoad = {};
            selectedToolIds.forEach(id => {
                if (safeData.tools && safeData.tools[id]) toolsToLoad[id] = safeData.tools[id];
            });
        }

        set({
            ...INITIAL_STATE,
            ...safeData,
            tools: toolsToLoad,
            isSafeMode: false,
            previewData: null,
            validationResults: null,
            // DO NOT auto-update logic version here. Logic version update requires explicit recompute.
        });
    },

    cancelLoad: () => set({
        isSafeMode: false,
        previewData: null,
        validationResults: null
    }),

    // Legacy / Direct Load wrapper
    loadWorkspace: (data) => {
        get().stageWorkspace(data);
        get().commitWorkspace(); // Auto-commit for now until UI supports Safe Mode
    },

    resetWorkspace: () => {
        // Clear persisted data from localStorage
        localStorage.removeItem(STORAGE_KEY);
        set({
            ...INITIAL_STATE,
            metadata: {
                ...INITIAL_STATE.metadata,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
            }
        });
    },

    // Load teaser answers from the landing page mini-assessment into AI Readiness tool.
    // Returns true if data was loaded, false if no valid teaser data exists.
    loadTeaserAnswers: () => {
        const teaserAnswersRaw = localStorage.getItem('vwcg-teaser-answers');
        const teaserCompletedRaw = localStorage.getItem('vwcg-teaser-completed');

        if (!teaserAnswersRaw || !teaserCompletedRaw) return false;

        try {
            const teaserAnswers = JSON.parse(teaserAnswersRaw);
            const completedTimestamp = parseInt(teaserCompletedRaw, 10);

            // Expire after 24 hours
            const age = Date.now() - completedTimestamp;
            if (age > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('vwcg-teaser-answers');
                localStorage.removeItem('vwcg-teaser-completed');
                localStorage.removeItem('vwcg-teaser-score');
                return false;
            }

            // Don't overwrite if AI Readiness tool already has user data.
            // Uses lowercase field names matching AIReadinessTool's data shape.
            const currentToolData = useWorkspaceStore.getState().tools['ai-readiness'];
            const DEFAULT_SCORE = 50;
            const hasExistingData = currentToolData && (
                currentToolData.strategy !== DEFAULT_SCORE ||
                currentToolData.data !== DEFAULT_SCORE ||
                currentToolData.infrastructure !== DEFAULT_SCORE ||
                currentToolData.talent !== DEFAULT_SCORE ||
                currentToolData.governance !== DEFAULT_SCORE ||
                currentToolData.culture !== DEFAULT_SCORE
            );

            if (hasExistingData) {
                localStorage.removeItem('vwcg-teaser-answers');
                localStorage.removeItem('vwcg-teaser-completed');
                localStorage.removeItem('vwcg-teaser-score');
                return false;
            }

            // Load teaser data into AI Readiness using flat Architecture A format.
            // Uses lowercase field names matching AIReadinessTool's data shape.
            set((state) => {
                const existing = state.tools['ai-readiness'] || {};
                const merged = {
                    ...existing,
                    strategy: teaserAnswers.strategy ?? DEFAULT_SCORE,
                    data: teaserAnswers.data ?? DEFAULT_SCORE,
                    talent: teaserAnswers.talent ?? DEFAULT_SCORE,
                    infrastructure: existing.infrastructure ?? DEFAULT_SCORE,
                    governance: existing.governance ?? DEFAULT_SCORE,
                    culture: existing.culture ?? DEFAULT_SCORE,
                    completed: true,
                };
                const nextTools = { ...state.tools, 'ai-readiness': merged };
                const newInsights = runSynthesis({ ...state, tools: nextTools });
                return { tools: nextTools, insights: newInsights };
            });

            localStorage.removeItem('vwcg-teaser-answers');
            localStorage.removeItem('vwcg-teaser-completed');
            localStorage.removeItem('vwcg-teaser-score');
            return true;
        } catch (e) {
            console.error('[Teaser Bridge] Failed to load teaser answers:', e);
            return false;
        }
    },

    exportState: () => {
        const state = get();
        const { version, metadata, tools, provenance, lastExportTime } = state;

        // Phase 3: Export Cooldown (5 Seconds)
        const NOW = Date.now();
        if (NOW - lastExportTime < 5000) {
            throw new Error('Export cooldown active. Please wait 5 seconds.');
        }

        // Canonical Serialization: Stable Key Order
        const canonicalize = (obj: any): any => {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(canonicalize);
            }
            return Object.keys(obj)
                .sort()
                .reduce((result: any, key) => {
                    result[key] = canonicalize(obj[key]);
                    return result;
                }, {});
        };

        const exportObj = {
            version,
            metadata,
            tools,
            provenance
        };

        // Update export time
        set({ lastExportTime: NOW });

        return JSON.stringify(canonicalize(exportObj), null, 2);
    }
    }),
    {
      name: STORAGE_KEY,
      // Only persist data fields, not ephemeral state
      partialize: (state) => ({
        version: state.version,
        metadata: state.metadata,
        tools: state.tools,
        provenance: state.provenance,
      }),
      // Handle hydration errors gracefully and recompute derived state
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to load saved workspace:', error);
          localStorage.removeItem(STORAGE_KEY);
        } else if (state) {
          // Recompute insights from persisted tool data after hydration
          // Use queueMicrotask to defer until after store initialization completes
          queueMicrotask(() => {
            const newInsights = runSynthesis(state);
            useWorkspaceStore.setState({ insights: newInsights });
          });
        }
      },
    }
  )
);
