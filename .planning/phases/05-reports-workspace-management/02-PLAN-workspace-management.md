---
wave: 2
depends_on:
  - 01-PLAN-pdf-reports
files_modified:
  - src/stores/workspaceStore.ts
  - src/components/workspace/WorkspaceManager.tsx
  - src/lib/workspace/fileHandler.ts
  - src/types/workspace.ts
autonomous: true
---

# Plan: Workspace Management

## Objective

Implement workspace management features (WRK-01 to WRK-05) - auto-save to localStorage, export/import .vwcg files, safe mode validation, and version tracking.

## Tasks

### Task 1: Create Workspace File Handler

**Action:** Create utilities for workspace file export/import with validation
**Files:** src/lib/workspace/fileHandler.ts
**Details:**

```typescript
import type { Workspace, WorkspaceExport } from '@types/workspace';

// Current logic version - increment when data structure changes
export const WORKSPACE_VERSION = '1.0.0';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  needsUpgrade: boolean;
  fromVersion: string | null;
}

interface ImportOptions {
  selectedSections?: string[];
  mergeMode?: 'replace' | 'merge';
}

/**
 * Create exportable workspace format
 */
export function prepareExport(workspace: Workspace): WorkspaceExport {
  return {
    version: WORKSPACE_VERSION,
    exportedAt: new Date().toISOString(),
    workspace: {
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      toolData: workspace.toolData,
      meta: workspace.meta
    }
  };
}

/**
 * Export workspace to downloadable .vwcg file
 */
export function exportToFile(workspace: Workspace): void {
  const exportData = prepareExport(workspace);
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = workspace.name.replace(/[^a-zA-Z0-9]/g, '_');
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

    if (!ws.toolData || typeof ws.toolData !== 'object') {
      errors.push('Missing tool data');
    }

    // Version check
    if (fromVersion !== WORKSPACE_VERSION) {
      needsUpgrade = true;
      warnings.push(`File version ${fromVersion} will be upgraded to ${WORKSPACE_VERSION}`);
    }
  } else if (obj.toolData) {
    // Legacy format - direct workspace object
    fromVersion = '0.9.0';
    needsUpgrade = true;
    warnings.push('Legacy format detected - will be upgraded to current version');
  } else {
    errors.push('Unrecognized file format');
    return { valid: false, errors, warnings, needsUpgrade: false, fromVersion: null };
  }

  // Validate tool data structure
  const toolData = (obj.workspace as Record<string, unknown>)?.toolData || obj.toolData;
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
export function parseImport(data: unknown, options: ImportOptions = {}): Workspace | null {
  const validation = validateImport(data);
  if (!validation.valid) return null;

  const obj = data as Record<string, unknown>;

  let workspace: Partial<Workspace>;

  if (obj.version && obj.workspace) {
    // New format
    workspace = obj.workspace as Partial<Workspace>;
  } else {
    // Legacy format
    workspace = obj as Partial<Workspace>;
  }

  // Apply upgrade if needed
  if (validation.needsUpgrade) {
    workspace = upgradeWorkspace(workspace, validation.fromVersion || '0.9.0');
  }

  // Apply partial import if selected sections specified
  if (options.selectedSections && options.selectedSections.length > 0) {
    const filteredToolData: Record<string, unknown> = {};
    for (const section of options.selectedSections) {
      if (workspace.toolData?.[section]) {
        filteredToolData[section] = workspace.toolData[section];
      }
    }
    workspace.toolData = filteredToolData;
  }

  // Ensure required fields
  return {
    id: workspace.id || generateId(),
    name: workspace.name || 'Imported Workspace',
    createdAt: workspace.createdAt || Date.now(),
    updatedAt: Date.now(),
    toolData: workspace.toolData || {},
    meta: workspace.meta || {}
  } as Workspace;
}

/**
 * Upgrade workspace from older version (WRK-05)
 */
function upgradeWorkspace(workspace: Partial<Workspace>, fromVersion: string): Partial<Workspace> {
  // Currently no upgrades needed - this is where migrations would go
  // Example:
  // if (fromVersion === '0.9.0') {
  //   // Migrate from 0.9.0 to 1.0.0
  //   workspace.toolData = migrateToolData(workspace.toolData);
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
  const toolData = (obj.workspace as Record<string, unknown>)?.toolData || obj.toolData;

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
    hasData: data !== null && data !== undefined && Object.keys(data as object).length > 0
  }));
}

function generateId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
```

### Task 2: Update Workspace Types

**Action:** Add WorkspaceExport type
**Files:** src/types/workspace.ts
**Details:**

Add to existing types:

```typescript
export interface WorkspaceExport {
  version: string;
  exportedAt: string;
  workspace: Omit<Workspace, 'synthesisResult'>;
}
```

### Task 3: Update Workspace Store

**Action:** Add import/export actions to store
**Files:** src/stores/workspaceStore.ts
**Details:**

Add to store actions:

```typescript
// Import actions
exportWorkspace: () => void;
importWorkspace: (workspace: Workspace, merge?: boolean) => void;

// Implementation
exportWorkspace: () => {
  const state = get();
  if (!state.currentWorkspace) return;
  exportToFile(state.currentWorkspace);
},

importWorkspace: (workspace: Workspace, merge = false) => {
  set(state => {
    if (merge && state.currentWorkspace) {
      // Merge tool data
      return {
        ...state,
        currentWorkspace: {
          ...state.currentWorkspace,
          toolData: {
            ...state.currentWorkspace.toolData,
            ...workspace.toolData
          },
          updatedAt: Date.now()
        }
      };
    } else {
      // Replace workspace
      return {
        ...state,
        currentWorkspace: workspace
      };
    }
  });

  // Trigger synthesis after import
  setTimeout(() => get().runSynthesis(), 500);
}
```

### Task 4: Create Workspace Manager Component

**Action:** Create UI for workspace export/import with safe mode
**Files:** src/components/workspace/WorkspaceManager.tsx
**Details:**

```typescript
import { useState, useRef } from 'react';
import { useWorkspaceStore } from '@stores/workspaceStore';
import {
  readWorkspaceFile,
  parseImport,
  getImportSections,
  WORKSPACE_VERSION
} from '@lib/workspace/fileHandler';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';

interface ImportState {
  file: File | null;
  data: unknown | null;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    needsUpgrade: boolean;
    fromVersion: string | null;
  } | null;
  sections: { id: string; name: string; hasData: boolean }[];
  selectedSections: string[];
  mergeMode: 'replace' | 'merge';
}

export default function WorkspaceManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>({
    file: null,
    data: null,
    validation: null,
    sections: [],
    selectedSections: [],
    mergeMode: 'replace'
  });
  const [showImportModal, setShowImportModal] = useState(false);

  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const exportWorkspace = useWorkspaceStore(state => state.exportWorkspace);
  const importWorkspace = useWorkspaceStore(state => state.importWorkspace);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, validation } = await readWorkspaceFile(file);
      const sections = getImportSections(data);

      setImportState({
        file,
        data,
        validation,
        sections,
        selectedSections: sections.filter(s => s.hasData).map(s => s.id),
        mergeMode: 'replace'
      });
      setShowImportModal(true);
    } catch (err) {
      console.error('Failed to read file:', err);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm import
  const confirmImport = () => {
    if (!importState.data || !importState.validation?.valid) return;

    const workspace = parseImport(importState.data, {
      selectedSections: importState.selectedSections,
      mergeMode: importState.mergeMode
    });

    if (workspace) {
      importWorkspace(workspace, importState.mergeMode === 'merge');
      setShowImportModal(false);
      setImportState({
        file: null,
        data: null,
        validation: null,
        sections: [],
        selectedSections: [],
        mergeMode: 'replace'
      });
    }
  };

  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setImportState(prev => ({
      ...prev,
      selectedSections: prev.selectedSections.includes(sectionId)
        ? prev.selectedSections.filter(id => id !== sectionId)
        : [...prev.selectedSections, sectionId]
    }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Workspace Management</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          {/* Current Workspace Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm">
              <div><strong>Workspace:</strong> {currentWorkspace?.name || 'Unnamed'}</div>
              <div><strong>Version:</strong> {WORKSPACE_VERSION}</div>
              <div>
                <strong>Last Updated:</strong>{' '}
                {currentWorkspace?.updatedAt
                  ? new Date(currentWorkspace.updatedAt).toLocaleString()
                  : 'Never'}
              </div>
              <div>
                <strong>Tools with Data:</strong>{' '}
                {Object.keys(currentWorkspace?.toolData || {}).length}
              </div>
            </div>
          </div>

          {/* Auto-save indicator (WRK-01) */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-saving to browser storage
          </div>

          {/* Export Button (WRK-02) */}
          <Button
            variant="secondary"
            onClick={exportWorkspace}
            disabled={!currentWorkspace}
            className="w-full"
          >
            Export Workspace (.vwcg)
          </Button>

          {/* Import Button (WRK-03) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".vwcg,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Import Workspace
          </Button>
        </div>
      </Card>

      {/* Import Modal (WRK-04 Safe Mode) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Import Workspace</h3>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <strong>File:</strong> {importState.file?.name}
                </div>
                {importState.validation?.fromVersion && (
                  <div className="text-sm">
                    <strong>Version:</strong> {importState.validation.fromVersion}
                    {importState.validation.needsUpgrade && (
                      <Badge size="sm" variant="warning" className="ml-2">
                        Will upgrade to {WORKSPACE_VERSION}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Errors */}
              {importState.validation?.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="text-red-800 font-medium text-sm mb-1">Errors:</div>
                  <ul className="text-red-700 text-sm list-disc list-inside">
                    {importState.validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importState.validation?.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="text-amber-800 font-medium text-sm mb-1">Warnings:</div>
                  <ul className="text-amber-700 text-sm list-disc list-inside">
                    {importState.validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section Selection (WRK-04) */}
              {importState.validation?.valid && importState.sections.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Select sections to import:</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importState.sections.map(section => (
                      <label
                        key={section.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={importState.selectedSections.includes(section.id)}
                          onChange={() => toggleSection(section.id)}
                          disabled={!section.hasData}
                          className="rounded"
                        />
                        <span className={!section.hasData ? 'text-gray-400' : ''}>
                          {section.name}
                        </span>
                        {!section.hasData && (
                          <span className="text-xs text-gray-400">(no data)</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Merge Mode */}
              {importState.validation?.valid && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Import mode:</div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={importState.mergeMode === 'replace'}
                        onChange={() => setImportState(p => ({ ...p, mergeMode: 'replace' }))}
                      />
                      <span className="text-sm">Replace current workspace</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={importState.mergeMode === 'merge'}
                        onChange={() => setImportState(p => ({ ...p, mergeMode: 'merge' }))}
                      />
                      <span className="text-sm">Merge with current</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmImport}
                  disabled={!importState.validation?.valid || importState.selectedSections.length === 0}
                  className="flex-1"
                >
                  Import {importState.selectedSections.length} section(s)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Task 5: Ensure Auto-Save is Working

**Action:** Verify Zustand persist middleware is properly configured
**Files:** src/stores/workspaceStore.ts
**Details:**

The store should already have persist middleware from Phase 1. Verify it's working:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store should use persist middleware
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'vwcg-workspace',
      // Only persist necessary data, not functions
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        synthesisResult: state.synthesisResult
      })
    }
  )
);
```

### Task 6: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Auto-save to localStorage works (WRK-01)
- [ ] Export creates .vwcg file with correct name
- [ ] Import accepts .vwcg and .json files
- [ ] Validation catches invalid files with clear errors
- [ ] Warnings show for version mismatches
- [ ] Section selection allows partial import
- [ ] Merge mode combines with existing workspace
- [ ] Replace mode overwrites workspace
- [ ] Version tracking shows current version (WRK-05)
- [ ] Upgrade mechanism handles legacy formats
- [ ] Build completes successfully

## Must-Haves

- WRK-01: Auto-save to browser localStorage via Zustand persist
- WRK-02: Save workspace to downloadable .vwcg file (JSON format)
- WRK-03: Load workspace from .vwcg or .json file
- WRK-04: Safe mode for imports with validation and partial import selection
- WRK-05: Logic version tracking and upgrade mechanism
