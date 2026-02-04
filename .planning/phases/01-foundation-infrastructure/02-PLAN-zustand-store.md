---
wave: 1
depends_on: []
files_modified:
  - src/stores/workspaceStore.ts
  - src/stores/uiStore.ts
  - src/types/workspace.ts
  - src/lib/workspace/export.ts
  - src/lib/workspace/import.ts
  - src/hooks/useWorkspace.ts
autonomous: true
---

# Plan: Zustand Store with localStorage Persistence

## Objective

Implement Zustand workspace store with automatic localStorage persistence, workspace export/import functionality (.vwcg files), and migration support for future schema changes. This fulfills requirements WRK-01 through WRK-05.

## Tasks

### Task 1: Install Zustand

**Action:** Add Zustand to project dependencies
**Files:** package.json
**Details:**

```bash
npm install zustand@5
```

### Task 2: Define Workspace Types

**Action:** Create TypeScript interfaces for workspace data structure
**Files:** src/types/workspace.ts
**Details:**

```typescript
export interface WorkspaceMeta {
  companyName: string;
  assessmentDate: string;
  version: string;
  lastSaved: number;
}

export interface ToolData {
  [toolId: string]: Record<string, unknown>;
}

export interface Insight {
  id: string;
  ruleId: string;
  type: 'gap' | 'strength' | 'warning' | 'opportunity';
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  recommendation: string;
  affectedTools: string[];
  data?: Record<string, unknown>;
}

export interface SynthesisState {
  insights: Insight[];
  scores: Record<string, number>;
}

export interface WorkspaceState {
  meta: WorkspaceMeta;
  tools: ToolData;
  synthesis: SynthesisState;
}
```

### Task 3: Create Workspace Store

**Action:** Implement Zustand store with persist middleware
**Files:** src/stores/workspaceStore.ts
**Details:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const STORE_VERSION = 1;

const initialState = {
  meta: {
    companyName: '',
    assessmentDate: new Date().toISOString(),
    version: '1.0',
    lastSaved: Date.now()
  },
  tools: {},
  synthesis: { insights: [], scores: {} }
};

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      updateToolData: (toolId, data) => set((state) => ({
        tools: { ...state.tools, [toolId]: data },
        meta: { ...state.meta, lastSaved: Date.now() }
      })),

      setMeta: (meta) => set((state) => ({
        meta: { ...state.meta, ...meta }
      })),

      setSynthesis: (synthesis) => set({ synthesis }),

      clearWorkspace: () => set(initialState),

      loadWorkspace: (data) => set({
        meta: data.meta,
        tools: data.tools,
        synthesis: data.synthesis || { insights: [], scores: {} }
      })
    }),
    {
      name: 'vwcg-workspace',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        meta: state.meta,
        tools: state.tools,
        synthesis: state.synthesis
      }),
      migrate: (persistedState, version) => {
        // Future migrations go here
        return persistedState;
      }
    }
  )
);
```

### Task 4: Create UI Store

**Action:** Implement separate store for transient UI state (not persisted)
**Files:** src/stores/uiStore.ts
**Details:**

```typescript
import { create } from 'zustand';

interface UIState {
  currentToolId: string | null;
  isHydrated: boolean;
  modalOpen: string | null;

  setCurrentTool: (toolId: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentToolId: null,
  isHydrated: false,
  modalOpen: null,

  setCurrentTool: (toolId) => set({ currentToolId: toolId }),
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null })
}));
```

### Task 5: Implement Workspace Export

**Action:** Create function to export workspace as .vwcg file
**Files:** src/lib/workspace/export.ts
**Details:**

```typescript
import { useWorkspaceStore } from '@stores/workspaceStore';

export function exportWorkspace(): void {
  const state = useWorkspaceStore.getState();
  const data = {
    meta: state.meta,
    tools: state.tools,
    synthesis: state.synthesis,
    exportedAt: Date.now(),
    appVersion: import.meta.env.PUBLIC_APP_VERSION || '1.0.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const filename = `VWCG_${state.meta.companyName || 'workspace'}_${Date.now()}.vwcg`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Task 6: Implement Workspace Import

**Action:** Create function to import workspace from .vwcg file with validation
**Files:** src/lib/workspace/import.ts
**Details:**

```typescript
import { useWorkspaceStore } from '@stores/workspaceStore';

interface ImportResult {
  valid: boolean;
  errors: string[];
  preview?: any;
}

export async function importWorkspace(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const errors: string[] = [];

        // Validation
        if (!data.meta) errors.push('Missing workspace metadata');
        if (!data.tools) errors.push('Missing tool data');
        if (typeof data.meta?.companyName !== 'string') {
          errors.push('Invalid company name');
        }

        if (errors.length > 0) {
          resolve({ valid: false, errors, preview: data });
          return;
        }

        // Load into store
        useWorkspaceStore.getState().loadWorkspace({
          meta: { ...data.meta, lastSaved: Date.now() },
          tools: data.tools,
          synthesis: data.synthesis || { insights: [], scores: {} }
        });

        resolve({ valid: true, errors: [], preview: data });
      } catch (error) {
        resolve({
          valid: false,
          errors: [`Parse error: ${(error as Error).message}`]
        });
      }
    };

    reader.onerror = () => resolve({
      valid: false,
      errors: ['Failed to read file']
    });

    reader.readAsText(file);
  });
}
```

### Task 7: Create useWorkspace Hook

**Action:** Create convenience hook for common workspace operations
**Files:** src/hooks/useWorkspace.ts
**Details:**

```typescript
import { useWorkspaceStore } from '@stores/workspaceStore';
import { useUIStore } from '@stores/uiStore';
import { useEffect } from 'react';

export function useWorkspace() {
  const meta = useWorkspaceStore((s) => s.meta);
  const tools = useWorkspaceStore((s) => s.tools);
  const synthesis = useWorkspaceStore((s) => s.synthesis);
  const updateToolData = useWorkspaceStore((s) => s.updateToolData);
  const setMeta = useWorkspaceStore((s) => s.setMeta);
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);

  const isHydrated = useUIStore((s) => s.isHydrated);
  const setHydrated = useUIStore((s) => s.setHydrated);

  // Handle hydration on mount
  useEffect(() => {
    useWorkspaceStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return {
    meta,
    tools,
    synthesis,
    updateToolData,
    setMeta,
    clearWorkspace,
    isHydrated
  };
}

export function useToolData<T = Record<string, unknown>>(toolId: string) {
  const data = useWorkspaceStore((s) => s.tools[toolId]) as T | undefined;
  const updateToolData = useWorkspaceStore((s) => s.updateToolData);

  const update = (newData: T) => {
    updateToolData(toolId, newData as Record<string, unknown>);
  };

  return { data, update };
}
```

## Verification

- [ ] Zustand store initializes with default state
- [ ] `updateToolData('test', { value: 1 })` persists to localStorage
- [ ] Page refresh restores state from localStorage
- [ ] `exportWorkspace()` downloads .vwcg file with correct JSON structure
- [ ] `importWorkspace(file)` loads valid .vwcg file into store
- [ ] Invalid .vwcg files return validation errors without crashing
- [ ] `clearWorkspace()` resets to initial state and clears localStorage
- [ ] `useWorkspace` hook returns hydration state correctly
- [ ] UI store changes (modal state) do NOT persist to localStorage

## Must-Haves

- Auto-save to browser localStorage via Zustand persist (WRK-01)
- Save workspace to downloadable .vwcg file (WRK-02)
- Load workspace from .vwcg or .json file (WRK-03)
- Basic validation for imports (WRK-04 partial)
- Version tracking in store for future migrations (WRK-05)
- Separate UI state store (not persisted)
