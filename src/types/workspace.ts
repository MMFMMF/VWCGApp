/**
 * Type definitions for workspace state management
 *
 * These types define the structure of the workspace data,
 * including tool responses, insights, and synthesis state.
 */

// Version for migration support
export const WORKSPACE_VERSION = 1;

/**
 * Metadata about the workspace
 */
export interface WorkspaceMeta {
  /** Unique identifier for the workspace */
  id: string;
  /** When the workspace was created */
  createdAt: string;
  /** When the workspace was last modified */
  updatedAt: string;
  /** Version number for migration support */
  version: number;
  /** Optional workspace name */
  name?: string;
  /** Optional workspace description */
  description?: string;
}

/**
 * Tool identifiers in the application
 */
export type ToolId =
  | 'vision'
  | 'workload-capacity-gap'
  | 'capability-model';

/**
 * Generic tool data structure
 * Each tool can store its own response data
 */
export interface ToolData {
  /** When the tool was last run */
  lastRun?: string;
  /** Whether the tool has been completed */
  completed: boolean;
  /** Tool-specific response data (flexible structure) */
  data: Record<string, any>;
}

/**
 * Insight generated from tool analysis
 */
export interface Insight {
  /** Unique identifier for the insight */
  id: string;
  /** Source tool that generated this insight */
  sourceToolId: ToolId;
  /** Insight content/description */
  content: string;
  /** When the insight was generated */
  generatedAt: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional priority level */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Synthesis state - aggregated analysis across tools
 */
export interface SynthesisState {
  /** Whether synthesis has been run */
  completed: boolean;
  /** When synthesis was last run */
  lastRun?: string;
  /** Key findings from synthesis */
  keyFindings?: string[];
  /** Recommended actions */
  recommendations?: string[];
  /** Overall assessment summary */
  summary?: string;
}

/**
 * Complete workspace state structure
 */
export interface WorkspaceState {
  /** Workspace metadata */
  meta: WorkspaceMeta;

  /** Tool data indexed by tool ID */
  tools: Partial<Record<ToolId, ToolData>>;

  /** Generated insights */
  insights: Insight[];

  /** Synthesis state */
  synthesis: SynthesisState;

  /** Latest synthesis result from rule evaluation */
  synthesisResult: any | null;
}

/**
 * Initial/default workspace state
 */
export const initialWorkspaceState: WorkspaceState = {
  meta: {
    id: '',
    createdAt: '',
    updatedAt: '',
    version: WORKSPACE_VERSION,
  },
  tools: {},
  insights: [],
  synthesis: {
    completed: false,
  },
  synthesisResult: null,
};

/**
 * Workspace store actions
 */
export interface WorkspaceActions {
  /** Update data for a specific tool */
  updateToolData: (toolId: ToolId, data: Partial<ToolData>) => void;

  /** Update workspace metadata */
  setMeta: (meta: Partial<WorkspaceMeta>) => void;

  /** Update synthesis state */
  setSynthesis: (synthesis: Partial<SynthesisState>) => void;

  /** Add an insight */
  addInsight: (insight: Omit<Insight, 'id' | 'generatedAt'>) => void;

  /** Remove an insight by ID */
  removeInsight: (insightId: string) => void;

  /** Clear all workspace data */
  clearWorkspace: () => void;

  /** Load workspace from external data */
  loadWorkspace: (workspace: WorkspaceState) => void;

  /** Run synthesis evaluation on current workspace data */
  runSynthesis: () => void;

  /** Export workspace to .vwcg file */
  exportWorkspace: () => void;

  /** Import workspace from data (merge or replace mode) */
  importWorkspace: (workspace: WorkspaceState, merge?: boolean) => void;
}

/**
 * Combined workspace store type
 */
export type WorkspaceStore = WorkspaceState & WorkspaceActions;

/**
 * Workspace export format for .vwcg files
 */
export interface WorkspaceExport {
  version: string;
  exportedAt: string;
  workspace: Omit<WorkspaceState, 'synthesisResult'>;
}
