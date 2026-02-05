/**
 * Workspace file handler for export/import functionality
 *
 * Supports:
 * - WRK-02: Export workspace to .vwcg file
 * - WRK-03: Import workspace from .vwcg or .json
 * - WRK-04: Safe mode validation with partial import
 * - WRK-05: Version tracking and upgrades
 */

import type { WorkspaceState } from '../../types/workspace';

// Current logic version - increment when data structure changes
export const WORKSPACE_VERSION = '1.0.0';

export interface WorkspaceExport {
  version: string;
  exportedAt: string;
  workspace: Omit<WorkspaceState, 'synthesisResult'>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  needsUpgrade: boolean;
  fromVersion: string | null;
}

export interface ImportOptions {
  selectedSections?: string[];
  mergeMode?: 'replace' | 'merge';
}

/**
 * Create exportable workspace format
 */
export function prepareExport(workspace: WorkspaceState): WorkspaceExport {
  return {
    version: WORKSPACE_VERSION,
    exportedAt: new Date().toISOString(),
    workspace: {
      meta: workspace.meta,
      tools: workspace.tools,
      insights: workspace.insights,
      synthesis: workspace.synthesis,
    },
  };
}

/**
 * Export workspace to downloadable .vwcg file
 */
export function exportToFile(workspace: WorkspaceState): void {
  const exportData = prepareExport(workspace);
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (workspace.meta.name || 'workspace').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${safeName}.vwcg`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported workspace data (WRK-04 safe mode)
 */
export function validateImport(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let needsUpgrade = false;
  let fromVersion: string | null = null;

  // Basic structure check
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid file format'], warnings, needsUpgrade: false, fromVersion: null };
  }

  const obj = data as Record<string, unknown>;

  // Check for workspace export format
  if (obj.version && obj.workspace) {
    // New export format
    fromVersion = obj.version as string;

    if (!obj.workspace || typeof obj.workspace !== 'object') {
      errors.push('Missing workspace data');
      return { valid: false, errors, warnings, needsUpgrade, fromVersion };
    }

    const ws = obj.workspace as Record<string, unknown>;

    if (!ws.tools || typeof ws.tools !== 'object') {
      errors.push('Missing tool data');
    }

    // Version check
    if (fromVersion !== WORKSPACE_VERSION) {
      needsUpgrade = true;
      warnings.push(`File version ${fromVersion} will be upgraded to ${WORKSPACE_VERSION}`);
    }
  } else if (obj.tools) {
    // Legacy format - direct workspace object
    fromVersion = '0.9.0';
    needsUpgrade = true;
    warnings.push('Legacy format detected - will be upgraded to current version');
  } else {
    errors.push('Unrecognized file format');
    return { valid: false, errors, warnings, needsUpgrade: false, fromVersion: null };
  }

  // Validate tool data structure
  const toolData = (obj.workspace as Record<string, unknown>)?.tools || obj.tools;
  if (toolData && typeof toolData === 'object') {
    const td = toolData as Record<string, unknown>;
    const toolCount = Object.keys(td).length;

    if (toolCount === 0) {
      warnings.push('No tool data found in workspace');
    } else {
      // Check for known tool IDs
      const knownTools = [
        'ai-readiness', 'leadership-dna', 'business-eq', 'swot-analysis',
        'vision-canvas', 'advisor-readiness', 'financial-readiness',
        'sop-maturity', '90day-roadmap'
      ];

      const unknownTools = Object.keys(td).filter(id => !knownTools.includes(id));
      if (unknownTools.length > 0) {
        warnings.push(`Unknown tools will be imported: ${unknownTools.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    needsUpgrade,
    fromVersion
  };
}

/**
 * Parse and upgrade imported data
 */
export function parseImport(data: unknown, options: ImportOptions = {}): WorkspaceState | null {
  const validation = validateImport(data);
  if (!validation.valid) return null;

  const obj = data as Record<string, unknown>;

  let workspace: Partial<WorkspaceState>;

  if (obj.version && obj.workspace) {
    // New format
    workspace = obj.workspace as Partial<WorkspaceState>;
  } else {
    // Legacy format
    workspace = obj as Partial<WorkspaceState>;
  }

  // Apply upgrade if needed
  if (validation.needsUpgrade) {
    workspace = upgradeWorkspace(workspace, validation.fromVersion || '0.9.0');
  }

  // Apply partial import if selected sections specified
  if (options.selectedSections && options.selectedSections.length > 0) {
    const filteredToolData: Record<string, unknown> = {};
    const tools = workspace.tools || {};

    for (const section of options.selectedSections) {
      if (tools[section as keyof typeof tools]) {
        filteredToolData[section] = tools[section as keyof typeof tools];
      }
    }
    workspace.tools = filteredToolData;
  }

  // Ensure required fields
  return {
    meta: {
      id: workspace.meta?.id || generateId(),
      createdAt: workspace.meta?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: workspace.meta?.version || 1,
      name: workspace.meta?.name || 'Imported Workspace',
      description: workspace.meta?.description,
    },
    tools: workspace.tools || {},
    insights: workspace.insights || [],
    synthesis: workspace.synthesis || { completed: false },
    synthesisResult: null,
  } as WorkspaceState;
}

/**
 * Upgrade workspace from older version (WRK-05)
 */
function upgradeWorkspace(workspace: Partial<WorkspaceState>, fromVersion: string): Partial<WorkspaceState> {
  // Currently no upgrades needed - this is where migrations would go
  // Example:
  // if (fromVersion === '0.9.0') {
  //   // Migrate from 0.9.0 to 1.0.0
  //   workspace.tools = migrateToolData(workspace.tools);
  // }

  return workspace;
}

/**
 * Read file and parse as workspace
 */
export async function readWorkspaceFile(file: File): Promise<{
  data: unknown;
  validation: ValidationResult;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const validation = validateImport(data);
        resolve({ data, validation });
      } catch (err) {
        resolve({
          data: null,
          validation: {
            valid: false,
            errors: ['Failed to parse file - invalid JSON'],
            warnings: [],
            needsUpgrade: false,
            fromVersion: null
          }
        });
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Get available sections from import data
 */
export function getImportSections(data: unknown): { id: string; name: string; hasData: boolean }[] {
  const obj = data as Record<string, unknown>;
  const toolData = (obj.workspace as Record<string, unknown>)?.tools || obj.tools;

  if (!toolData || typeof toolData !== 'object') return [];

  const toolNames: Record<string, string> = {
    'ai-readiness': 'AI Readiness',
    'leadership-dna': 'Leadership DNA',
    'business-eq': 'Business EQ',
    'swot-analysis': 'SWOT Analysis',
    'vision-canvas': 'Vision Canvas',
    'advisor-readiness': 'Advisor Readiness',
    'financial-readiness': 'Financial Readiness',
    'sop-maturity': 'SOP Maturity',
    '90day-roadmap': '90-Day Roadmap'
  };

  return Object.entries(toolData as Record<string, unknown>).map(([id, data]) => ({
    id,
    name: toolNames[id] || id,
    hasData: data !== null && data !== undefined &&
             typeof data === 'object' && Object.keys(data as object).length > 0
  }));
}

function generateId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
