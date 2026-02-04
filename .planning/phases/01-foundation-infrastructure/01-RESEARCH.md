# Phase 1 Research: Foundation & Infrastructure

**Research Date:** 2026-02-04
**Phase Goal:** Establish core technical architecture with state management, routing, shared UI components, and localStorage persistence
**Target Requirements:** ARC-01 through ARC-05

---

## Executive Summary

Phase 1 establishes the foundational architecture for VWCGApp, a strategic assessment platform built with Astro 5 + React Islands. This hybrid approach delivers optimal performance for marketing pages (static Astro) while enabling rich interactivity for assessment tools (React components). The architecture prioritizes:

- **Modularity** - Tool registry pattern for easy addition of new assessment tools
- **Extensibility** - Synthesis rule registry for business logic without core engine changes
- **Persistence** - Zustand with localStorage for workspace auto-save and .vwcg file export
- **SEO** - Static site generation for marketing pages
- **Type Safety** - Comprehensive TypeScript interfaces across the stack

---

## 1. Astro 5 + React Islands Setup

### Overview

Astro 5 introduces a **hybrid architecture** where marketing/content pages are pure Astro (static HTML with zero JavaScript), while interactive assessment tools use React "islands" (isolated interactive components). This delivers 40% faster page loads compared to pure Next.js SPA approaches.

### Key Concepts

**Islands Architecture**
> "Islands architecture works by rendering the majority of your page to fast, static HTML with smaller 'islands' of JavaScript added when interactivity or personalization is needed on the page."
> — [Astro Islands Documentation](https://docs.astro.build/en/concepts/islands/)

Benefits for VWCGApp:
- **Marketing pages** (landing, blog) render as pure HTML - optimal for SEO and paid traffic conversion
- **Assessment tools** load React only where needed - minimal JavaScript overhead
- **Progressive enhancement** - content accessible even if JS fails

### Setup Steps

#### 1. Initialize Astro Project with React Integration

```bash
npm create astro@latest
cd vwcgapp
npx astro add react
```

This installs:
- `astro@5.10.0` (framework)
- `@astrojs/react` (integration)
- `react@18.3.0` + `react-dom@18.3.0`
- Required TypeScript types

#### 2. Configure React Integration

**astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static', // Static site generation for SEO
  vite: {
    ssr: {
      external: ['zustand'] // Prevent Zustand SSR issues
    }
  }
});
```

#### 3. Create Astro Pages with React Islands

**Pattern: Marketing Page (Pure Astro)**
```astro
---
// src/pages/index.astro
import Layout from '../layouts/MarketingLayout.astro';
---
<Layout title="VWCGApp - Strategic Assessment Platform">
  <h1>Transform Your Business Strategy</h1>
  <!-- Pure HTML, no JavaScript -->
</Layout>
```

**Pattern: Assessment Tool (React Island)**
```astro
---
// src/pages/app/tools/ai-readiness.astro
import Layout from '../../../layouts/AppLayout.astro';
import AIReadinessTool from '../../../components/tools/AIReadinessTool';
---
<Layout title="AI Readiness Assessment">
  <!-- React island with client directive -->
  <AIReadinessTool client:load />
</Layout>
```

### Client Directives (Hydration Strategies)

| Directive | When to Use | Use Case in VWCGApp |
|-----------|-------------|---------------------|
| `client:load` | Hydrate immediately on page load | Assessment tools that need instant interactivity |
| `client:idle` | Hydrate after initial page load | Low-priority UI like tooltips, help panels |
| `client:visible` | Hydrate when scrolled into view | Below-fold charts, synthesis insights panel |
| `client:only` | Skip SSR, client-side only | Tools fetching data from localStorage |

**Recommended Strategy for Assessment Tools:**
```tsx
// For tools reading from Zustand (localStorage state)
<AssessmentTool client:only="react" />
```

Rationale: Zustand state isn't available during SSR, so skip server rendering entirely to avoid hydration mismatches.

### React Context Across Islands

**Important:** Each React island is isolated by default. To share state:

**Option 1: Single Large Island (Recommended for VWCGApp)**
```astro
---
// src/pages/app/[...tool].astro
import AssessmentApp from '../../components/AssessmentApp';
---
<!-- Single React tree for entire /app section -->
<AssessmentApp client:only="react" />
```

Benefits:
- Zustand state shared across all assessment tools
- React Router works within the island
- Context providers work normally

**Option 2: Multiple Islands with Shared Store**
Use Zustand's `subscribe` API to sync state between islands (more complex, avoid unless needed).

### Routing Strategy

**Public Routes (Astro Pages):**
```
/index.astro           → Marketing homepage
/landing.astro         → Paid traffic landing page
/blog/[...slug].astro  → Blog posts (Content Collections)
/about.astro           → About page
```

**Gated Routes (React SPA within Island):**
```
/app/[...tool].astro   → Renders <AssessmentApp client:only="react" />
  └─ React Router handles:
      /app/dashboard
      /app/tools/ai-readiness
      /app/tools/leadership-dna
      /app/report
      /app/export
```

Pattern:
```tsx
// src/components/AssessmentApp.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function AssessmentApp() {
  return (
    <BrowserRouter basename="/app">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools/:toolId" element={<ToolView />} />
        <Route path="/report" element={<ReportView />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Server Islands (Astro 5 Feature)

**New in Astro 5:** `server:defer` directive for dynamic server-rendered content.

**Use Case:** Personalized welcome message after invite validation:
```astro
<WelcomeMessage server:defer inviteCode={code} />
```

Benefits:
- Static marketing page shell loads instantly
- Personalized content streams in after
- Better perceived performance

**Not critical for Phase 1** - focus on client-side islands first.

---

## 2. Zustand State Management with localStorage Persistence

### Why Zustand for VWCGApp

From requirements analysis:
- **WRK-01**: Auto-save to browser localStorage ✅
- **WRK-02**: Save workspace to downloadable .vwcg file ✅
- **WRK-03**: Load workspace from .vwcg file ✅

Zustand's `persist` middleware is purpose-built for this use case.

### Installation

```bash
npm install zustand@5.0.10
```

### Basic Workspace Store Pattern

```typescript
// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WorkspaceMeta {
  companyName: string;
  assessmentDate: string;
  version: string;
  lastSaved: number;
}

interface ToolData {
  [toolId: string]: Record<string, unknown>;
}

interface WorkspaceState {
  meta: WorkspaceMeta;
  tools: ToolData;
  synthesis: {
    insights: Insight[];
    scores: Record<string, number>;
  };

  // Actions
  updateToolData: (toolId: string, data: Record<string, unknown>) => void;
  setMeta: (meta: Partial<WorkspaceMeta>) => void;
  clearWorkspace: () => void;
}

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

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateToolData: (toolId, data) => set((state) => ({
        tools: {
          ...state.tools,
          [toolId]: data
        },
        meta: {
          ...state.meta,
          lastSaved: Date.now()
        }
      })),

      setMeta: (meta) => set((state) => ({
        meta: { ...state.meta, ...meta }
      })),

      clearWorkspace: () => set(initialState)
    }),
    {
      name: 'vwcg-workspace', // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Advanced Persist Patterns

#### 1. Partial Persistence (Exclude UI State)

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'vwcg-workspace',
    partialize: (state) => ({
      meta: state.meta,
      tools: state.tools,
      synthesis: state.synthesis
      // Exclude UI state like currentTool, progress
    })
  }
)
```

#### 2. Hydration Tracking (SSR-Safe)

```typescript
// src/components/AssessmentApp.tsx
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useEffect, useState } from 'react';

export default function AssessmentApp() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    useWorkspaceStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <LoadingSpinner />;
  }

  return <Router>...</Router>;
}
```

Rationale: Prevents hydration mismatches in Astro React islands.

#### 3. Migration Strategy (Version Upgrades)

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'vwcg-workspace',
    version: 2, // Increment when schema changes
    migrate: (persistedState: any, version: number) => {
      if (version === 1) {
        // Migrate v1 → v2
        return {
          ...persistedState,
          tools: {
            ...persistedState.tools,
            // Add new field to all tools
            ...(Object.keys(persistedState.tools).reduce((acc, key) => ({
              ...acc,
              [key]: {
                ...persistedState.tools[key],
                version: 2
              }
            }), {}))
          }
        };
      }
      return persistedState;
    }
  }
)
```

#### 4. Debounced Saves (Performance Optimization)

Built-in: Zustand persist middleware already debounces writes to localStorage (default ~100ms). For heavier state updates:

```typescript
import { debounce } from 'lodash-es';

const debouncedUpdate = debounce((toolId, data) => {
  useWorkspaceStore.getState().updateToolData(toolId, data);
}, 500);

// In component:
<input onChange={(e) => debouncedUpdate('tool-01', { field: e.target.value })} />
```

### File Export/Import Implementation

**Export Workspace to .vwcg File:**
```typescript
// src/lib/workspace/export.ts
import { useWorkspaceStore } from '../../stores/workspaceStore';

export function exportWorkspace() {
  const state = useWorkspaceStore.getState();
  const data = {
    meta: state.meta,
    tools: state.tools,
    synthesis: state.synthesis
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VWCG_${state.meta.companyName || 'workspace'}_${Date.now()}.vwcg`;
  link.click();

  URL.revokeObjectURL(url);
}
```

**Import Workspace from .vwcg File:**
```typescript
// src/lib/workspace/import.ts
import { useWorkspaceStore } from '../../stores/workspaceStore';

export async function importWorkspace(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate schema
        if (!data.meta || !data.tools) {
          throw new Error('Invalid workspace file format');
        }

        // Check version compatibility
        const currentVersion = 1;
        if (data.meta.version > currentVersion) {
          throw new Error('Workspace created with newer app version');
        }

        // Apply migrations if needed
        const migratedData = migrateWorkspace(data);

        // Load into store
        useWorkspaceStore.setState({
          meta: migratedData.meta,
          tools: migratedData.tools,
          synthesis: migratedData.synthesis
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function migrateWorkspace(data: any) {
  // Apply version migrations
  // (Use same logic as persist middleware migrate function)
  return data;
}
```

**Usage in Component:**
```tsx
// src/components/workspace/ImportButton.tsx
import { importWorkspace } from '../../lib/workspace/import';

export function ImportButton() {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importWorkspace(file);
      alert('Workspace loaded successfully!');
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  return (
    <label>
      <input type="file" accept=".vwcg,.json" onChange={handleImport} />
      Import Workspace
    </label>
  );
}
```

### Safe Mode Imports (WRK-04 Requirement)

For partial imports with validation:

```typescript
// src/lib/workspace/safeImport.ts
interface ImportOptions {
  validateOnly?: boolean;
  selectiveImport?: {
    meta?: boolean;
    tools?: string[]; // List of tool IDs to import
    synthesis?: boolean;
  };
}

export async function safeImportWorkspace(
  file: File,
  options: ImportOptions = {}
): Promise<{ valid: boolean; errors: string[]; preview: any }> {
  const data = await parseWorkspaceFile(file);
  const errors: string[] = [];

  // Validation
  if (!data.meta?.companyName) {
    errors.push('Missing company name');
  }

  if (Object.keys(data.tools).length === 0) {
    errors.push('No tool data found');
  }

  // Validate each tool's data structure
  for (const [toolId, toolData] of Object.entries(data.tools)) {
    const validation = validateToolData(toolId, toolData);
    if (!validation.valid) {
      errors.push(`Tool ${toolId}: ${validation.error}`);
    }
  }

  if (options.validateOnly) {
    return { valid: errors.length === 0, errors, preview: data };
  }

  // Selective import
  if (options.selectiveImport) {
    const partialData = {
      meta: options.selectiveImport.meta ? data.meta : useWorkspaceStore.getState().meta,
      tools: options.selectiveImport.tools
        ? Object.fromEntries(
            Object.entries(data.tools).filter(([id]) =>
              options.selectiveImport.tools.includes(id)
            )
          )
        : {},
      synthesis: options.selectiveImport.synthesis ? data.synthesis : {}
    };

    useWorkspaceStore.setState(partialData);
  } else {
    useWorkspaceStore.setState(data);
  }

  return { valid: true, errors: [], preview: data };
}
```

---

## 3. Tool Registry Pattern

### Architecture Goal (ARC-02)

> "Tool registry pattern for dynamic tool registration"
> — Requirements ARC-02

**Benefits:**
- Add new assessment tools without modifying core router
- Enforce standardized interface (ARC-03)
- Enable dynamic tool discovery for dashboards
- Support lazy-loading of tool components

### Implementation Pattern

#### Registry Definition

```typescript
// src/lib/tools/toolRegistry.ts
import { ComponentType, lazy } from 'react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: 'assessment' | 'planning' | 'sop' | 'synthesis';
  order: number;
  icon?: string;
  estimatedTime?: number; // minutes
}

export interface ToolInterface {
  metadata: ToolMetadata;
  component: ComponentType<ToolProps>;
  validate?: (data: any) => { valid: boolean; errors: string[] };
  exportToPDF?: (data: any) => PDFSection;
}

interface ToolProps {
  data?: Record<string, unknown>;
  onUpdate?: (data: Record<string, unknown>) => void;
  readonly?: boolean;
}

class ToolRegistry {
  private tools = new Map<string, ToolInterface>();

  register(tool: ToolInterface): void {
    if (this.tools.has(tool.metadata.id)) {
      console.warn(`Tool ${tool.metadata.id} already registered, overwriting`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  get(id: string): ToolInterface | undefined {
    return this.tools.get(id);
  }

  getAll(): ToolInterface[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): ToolInterface[] {
    return this.getAll().filter(tool => tool.metadata.category === category);
  }

  getSorted(): ToolInterface[] {
    return this.getAll().sort((a, b) => a.metadata.order - b.metadata.order);
  }
}

export const toolRegistry = new ToolRegistry();
```

#### Tool Registration

**Pattern 1: Co-located Registration (Recommended)**
```typescript
// src/components/tools/AIReadinessTool.tsx
import { toolRegistry } from '../../lib/tools/toolRegistry';

export default function AIReadinessTool({ data, onUpdate }: ToolProps) {
  // Component implementation
  return <div>AI Readiness Assessment</div>;
}

// Register on module load
toolRegistry.register({
  metadata: {
    id: 'ai-readiness',
    name: 'AI Readiness Assessment',
    description: '6 dimensions of AI capability maturity',
    category: 'assessment',
    order: 1,
    estimatedTime: 15
  },
  component: AIReadinessTool,
  validate: (data) => {
    // Validation logic
    return { valid: true, errors: [] };
  },
  exportToPDF: (data) => {
    // PDF generation logic
    return { title: 'AI Readiness', content: [...] };
  }
});
```

**Pattern 2: Centralized Registration**
```typescript
// src/lib/tools/index.ts
import AIReadinessTool from '../../components/tools/AIReadinessTool';
import LeadershipDNATool from '../../components/tools/LeadershipDNATool';
import { toolRegistry } from './toolRegistry';

// Import all tools
const tools = [
  {
    metadata: { id: 'ai-readiness', name: 'AI Readiness', /* ... */ },
    component: AIReadinessTool
  },
  {
    metadata: { id: 'leadership-dna', name: 'Leadership DNA', /* ... */ },
    component: LeadershipDNATool
  }
];

// Register all on app init
tools.forEach(tool => toolRegistry.register(tool));
```

#### Dynamic Routing with Registry

```tsx
// src/components/AssessmentApp.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { toolRegistry } from '../lib/tools/toolRegistry';

export default function AssessmentApp() {
  const tools = toolRegistry.getSorted();

  return (
    <BrowserRouter basename="/app">
      <Routes>
        <Route path="/" element={<Dashboard tools={tools} />} />

        {/* Dynamic routes from registry */}
        {tools.map(tool => (
          <Route
            key={tool.metadata.id}
            path={`/tools/${tool.metadata.id}`}
            element={<ToolWrapper tool={tool} />}
          />
        ))}

        <Route path="/report" element={<ReportView />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Tool Wrapper (Connects to Zustand)

```tsx
// src/components/ToolWrapper.tsx
import { useWorkspaceStore } from '../stores/workspaceStore';
import type { ToolInterface } from '../lib/tools/toolRegistry';

interface Props {
  tool: ToolInterface;
}

export function ToolWrapper({ tool }: Props) {
  const toolData = useWorkspaceStore(state => state.tools[tool.metadata.id]);
  const updateToolData = useWorkspaceStore(state => state.updateToolData);

  const handleUpdate = (data: Record<string, unknown>) => {
    updateToolData(tool.metadata.id, data);
  };

  const Component = tool.component;

  return (
    <div className="tool-container">
      <h1>{tool.metadata.name}</h1>
      <p>{tool.metadata.description}</p>

      <Component
        data={toolData}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
```

### Lazy Loading Tools

For better performance, lazy-load tool components:

```typescript
// src/lib/tools/toolRegistry.ts
import { lazy } from 'react';

toolRegistry.register({
  metadata: { /* ... */ },
  component: lazy(() => import('../../components/tools/AIReadinessTool')),
  // ...
});
```

Then wrap routes in `<Suspense>`:
```tsx
<Suspense fallback={<ToolLoadingSpinner />}>
  <ToolWrapper tool={tool} />
</Suspense>
```

---

## 4. Standardized Tool Interface

### Interface Design (ARC-03)

> "Standardized tool interface (data structure, state management, PDF export)"
> — Requirements ARC-03

All assessment tools must implement this contract:

```typescript
// src/types/tool.ts

/**
 * Props passed to every tool component
 */
export interface ToolProps {
  /**
   * Current data for this tool from workspace store
   * Undefined if tool hasn't been started yet
   */
  data?: Record<string, unknown>;

  /**
   * Callback to save tool data to workspace
   * @param data - Complete tool data object
   */
  onUpdate?: (data: Record<string, unknown>) => void;

  /**
   * Whether tool is in read-only mode (e.g., report preview)
   */
  readonly?: boolean;
}

/**
 * Validation result returned by tool validators
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * PDF section structure for report generation
 */
export interface PDFSection {
  title: string;
  summary?: string;
  charts?: ChartData[];
  tables?: TableData[];
  insights?: string[];
  rawData?: Record<string, unknown>;
}

/**
 * Complete tool definition
 */
export interface Tool {
  /** Metadata describing the tool */
  metadata: ToolMetadata;

  /** React component implementing the tool UI */
  component: React.ComponentType<ToolProps>;

  /** Optional validation function */
  validate?: (data: any) => ValidationResult;

  /** Optional PDF export function */
  exportToPDF?: (data: any) => PDFSection;

  /** Optional default/initial data */
  getDefaultData?: () => Record<string, unknown>;
}
```

### Tool Implementation Template

```tsx
// src/components/tools/ExampleTool.tsx
import { useState, useEffect } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '../../types/tool';

interface ExampleToolData {
  dimension1: number;
  dimension2: number;
  notes: string;
}

export default function ExampleTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<ExampleToolData>({
    dimension1: 0,
    dimension2: 0,
    notes: ''
  });

  // Initialize from workspace data
  useEffect(() => {
    if (data) {
      setFormData(data as ExampleToolData);
    }
  }, [data]);

  // Auto-save on change
  const handleChange = (field: keyof ExampleToolData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(updated);
  };

  return (
    <form>
      <label>
        Dimension 1:
        <input
          type="range"
          min="0"
          max="100"
          value={formData.dimension1}
          onChange={(e) => handleChange('dimension1', Number(e.target.value))}
          disabled={readonly}
        />
      </label>

      <label>
        Notes:
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={readonly}
        />
      </label>
    </form>
  );
}

// Validation function
export function validateExampleTool(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.dimension1 || data.dimension1 < 0) {
    errors.push('Dimension 1 must be >= 0');
  }

  if (!data.notes || data.notes.trim().length === 0) {
    errors.push('Notes are required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// PDF export function
export function exportExampleToolToPDF(data: ExampleToolData): PDFSection {
  return {
    title: 'Example Tool Results',
    summary: `Dimension 1: ${data.dimension1}, Dimension 2: ${data.dimension2}`,
    charts: [
      {
        type: 'bar',
        data: [
          { label: 'Dimension 1', value: data.dimension1 },
          { label: 'Dimension 2', value: data.dimension2 }
        ]
      }
    ],
    insights: [
      data.dimension1 > 50 ? 'Strong performance on Dimension 1' : 'Improvement needed on Dimension 1'
    ],
    rawData: data
  };
}

// Register tool
import { toolRegistry } from '../../lib/tools/toolRegistry';

toolRegistry.register({
  metadata: {
    id: 'example-tool',
    name: 'Example Assessment',
    description: 'Example tool demonstrating standardized interface',
    category: 'assessment',
    order: 99
  },
  component: ExampleTool,
  validate: validateExampleTool,
  exportToPDF: exportExampleToolToPDF,
  getDefaultData: () => ({
    dimension1: 0,
    dimension2: 0,
    notes: ''
  })
});
```

### Shared UI Components for Tools

Create reusable form components to ensure consistency:

```typescript
// src/components/shared/SliderInput.tsx
interface SliderInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function SliderInput({ label, value, min = 0, max = 100, onChange, disabled }: SliderInputProps) {
  return (
    <div className="slider-input">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
      <span>{value}</span>
    </div>
  );
}
```

---

## 5. Synthesis Rule Registry

### Architecture Goal (ARC-05)

> "Synthesis rule registry for adding new rules without modifying engine core"
> — Requirements ARC-05

**Pattern:** Plugin-based rule engine where each synthesis rule is a self-contained module.

### Rule Interface

```typescript
// src/lib/synthesis/types.ts

export interface SynthesisContext {
  /** All tool data from workspace */
  tools: Record<string, any>;

  /** Workspace metadata */
  meta: {
    companyName: string;
    assessmentDate: string;
  };
}

export interface Insight {
  id: string;
  ruleId: string;
  type: 'gap' | 'strength' | 'warning' | 'opportunity';
  severity: 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical
  title: string;
  description: string;
  recommendation: string;
  affectedTools: string[];
  data?: Record<string, unknown>;
}

export interface SynthesisRule {
  /** Unique rule identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Rule description */
  description: string;

  /** Which tools this rule requires */
  requiredTools: string[];

  /** Execute the rule and return insights */
  evaluate: (context: SynthesisContext) => Insight[];

  /** Optional: Calculate dimension scores */
  calculateScores?: (context: SynthesisContext) => Record<string, number>;
}
```

### Rule Registry

```typescript
// src/lib/synthesis/ruleRegistry.ts

class SynthesisRuleRegistry {
  private rules = new Map<string, SynthesisRule>();

  register(rule: SynthesisRule): void {
    if (this.rules.has(rule.id)) {
      console.warn(`Rule ${rule.id} already registered, overwriting`);
    }
    this.rules.set(rule.id, rule);
  }

  unregister(id: string): void {
    this.rules.delete(id);
  }

  get(id: string): SynthesisRule | undefined {
    return this.rules.get(id);
  }

  getAll(): SynthesisRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluate all registered rules against workspace context
   */
  evaluateAll(context: SynthesisContext): {
    insights: Insight[];
    scores: Record<string, number>;
  } {
    const allInsights: Insight[] = [];
    const allScores: Record<string, number> = {};

    for (const rule of this.rules.values()) {
      // Check if required tools are present
      const hasRequiredTools = rule.requiredTools.every(
        toolId => context.tools[toolId] !== undefined
      );

      if (!hasRequiredTools) {
        console.debug(`Skipping rule ${rule.id}: missing required tools`);
        continue;
      }

      try {
        const insights = rule.evaluate(context);
        allInsights.push(...insights);

        if (rule.calculateScores) {
          const scores = rule.calculateScores(context);
          Object.assign(allScores, scores);
        }
      } catch (error) {
        console.error(`Rule ${rule.id} failed:`, error);
      }
    }

    return {
      insights: this.prioritizeInsights(allInsights),
      scores: allScores
    };
  }

  private prioritizeInsights(insights: Insight[]): Insight[] {
    return insights.sort((a, b) => {
      // Sort by severity (descending)
      if (b.severity !== a.severity) {
        return b.severity - a.severity;
      }
      // Then by type (gaps first)
      const typeOrder = { gap: 0, warning: 1, opportunity: 2, strength: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }
}

export const synthesisRuleRegistry = new SynthesisRuleRegistry();
```

### Example Rule: E1 - Execution Capability Gap

Based on REQUIREMENTS.md SYN-01:
> "E1 — Execution Capability Gap (Leadership Execution < 6 + Pillars exceed dynamic limit)"

```typescript
// src/lib/synthesis/rules/executionCapabilityGap.ts
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const executionCapabilityGapRule: SynthesisRule = {
  id: 'E1-execution-capability-gap',
  name: 'Execution Capability Gap',
  description: 'Detects when strategic ambition exceeds leadership execution capacity',
  requiredTools: ['leadership-dna', 'vision-canvas'],

  evaluate: (context: SynthesisContext): Insight[] => {
    const leadershipData = context.tools['leadership-dna'];
    const visionData = context.tools['vision-canvas'];

    const executionScore = leadershipData?.current?.execution || 0;
    const pillarCount = visionData?.strategicPillars?.length || 0;

    // Dynamic limit: max 3 pillars per execution point above 5
    // e.g., execution=6 → max 3 pillars, execution=7 → max 6 pillars
    const dynamicLimit = Math.max(0, (executionScore - 5) * 3);

    const insights: Insight[] = [];

    if (executionScore < 6 && pillarCount > dynamicLimit) {
      insights.push({
        id: `E1-${Date.now()}`,
        ruleId: 'E1-execution-capability-gap',
        type: 'gap',
        severity: 5,
        title: 'Execution Capability Gap Detected',
        description: `Your leadership execution score (${executionScore}/10) is insufficient for ${pillarCount} strategic pillars. This gap indicates high risk of strategic overload and execution failure.`,
        recommendation: `Focus on fewer strategic pillars (reduce to ${Math.floor(dynamicLimit)}) OR develop execution capacity through delegation, process improvement, or team expansion.`,
        affectedTools: ['leadership-dna', 'vision-canvas'],
        data: {
          executionScore,
          pillarCount,
          dynamicLimit,
          gap: pillarCount - dynamicLimit
        }
      });
    }

    return insights;
  },

  calculateScores: (context: SynthesisContext) => {
    const leadershipData = context.tools['leadership-dna'];
    const executionScore = leadershipData?.current?.execution || 0;

    return {
      executionCapability: executionScore
    };
  }
};

// Auto-register on module load
synthesisRuleRegistry.register(executionCapabilityGapRule);

export default executionCapabilityGapRule;
```

### Example Rule: E10 - Opportunity-Capability Match (Positive)

Based on REQUIREMENTS.md SYN-06:
> "E10 — Opportunity-Capability Match (high-confidence opportunity + aligned capabilities)"

```typescript
// src/lib/synthesis/rules/opportunityCapabilityMatch.ts
import type { SynthesisRule, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const opportunityCapabilityMatchRule: SynthesisRule = {
  id: 'E10-opportunity-capability-match',
  name: 'Opportunity-Capability Match',
  description: 'Identifies high-confidence opportunities aligned with current capabilities',
  requiredTools: ['swot-analysis', 'advisor-readiness'],

  evaluate: (context): Insight[] => {
    const swotData = context.tools['swot-analysis'];
    const advisorData = context.tools['advisor-readiness'];

    const opportunities = swotData?.opportunities || [];
    const maturityScore = advisorData?.maturityPercentage || 0;

    const insights: Insight[] = [];

    // Find high-confidence opportunities
    const highConfidenceOps = opportunities.filter(
      (opp: any) => opp.confidence >= 4
    );

    if (highConfidenceOps.length > 0 && maturityScore >= 60) {
      insights.push({
        id: `E10-${Date.now()}`,
        ruleId: 'E10-opportunity-capability-match',
        type: 'opportunity',
        severity: 2,
        title: 'Strategic Opportunities Aligned with Capabilities',
        description: `You have ${highConfidenceOps.length} high-confidence opportunities and a strong operational maturity (${maturityScore}%). This is an excellent position to execute strategic growth initiatives.`,
        recommendation: `Prioritize these opportunities: ${highConfidenceOps.map((o: any) => o.title).join(', ')}. Consider accelerating execution timelines.`,
        affectedTools: ['swot-analysis', 'advisor-readiness'],
        data: {
          opportunities: highConfidenceOps,
          maturityScore
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(opportunityCapabilityMatchRule);
export default opportunityCapabilityMatchRule;
```

### Rule Registration Pattern

**Centralized Registration (App Initialization):**
```typescript
// src/lib/synthesis/index.ts

// Import all rules (triggers auto-registration)
import './rules/executionCapabilityGap';
import './rules/unmitigatedThreat';
import './rules/burnoutRisk';
import './rules/strengthLeverage';
import './rules/sopMetricMissing';
import './rules/opportunityCapabilityMatch';
import './rules/strengthMultiplication';

export { synthesisRuleRegistry } from './ruleRegistry';
export * from './types';
```

Then in main app:
```typescript
// src/components/AssessmentApp.tsx
import { synthesisRuleRegistry } from '../lib/synthesis';

// Rules auto-registered on import
```

### Triggering Synthesis

```typescript
// src/hooks/useSynthesis.ts
import { useWorkspaceStore } from '../stores/workspaceStore';
import { synthesisRuleRegistry } from '../lib/synthesis';

export function useSynthesis() {
  const tools = useWorkspaceStore(state => state.tools);
  const meta = useWorkspaceStore(state => state.meta);

  const runSynthesis = () => {
    const context = { tools, meta };
    const result = synthesisRuleRegistry.evaluateAll(context);

    // Save to workspace
    useWorkspaceStore.setState(state => ({
      ...state,
      synthesis: result
    }));

    return result;
  };

  return { runSynthesis };
}
```

**Usage:**
```tsx
// In a component
const { runSynthesis } = useSynthesis();

<button onClick={runSynthesis}>
  Generate Insights
</button>
```

---

## 6. Recommended File Structure

Based on [Astro project structure best practices](https://docs.astro.build/en/basics/project-structure/) and modular architecture requirements:

```
C:\Users\Kamyar\Documents\FWT\
├── .planning/                       # Project documentation (existing)
│   ├── PROJECT.md
│   ├── REQUIREMENTS.md
│   ├── ROADMAP.md
│   └── research/
│       ├── STACK.md
│       └── ARCHITECTURE.md
│
├── public/                          # Static assets (not processed by Astro)
│   ├── images/
│   │   ├── logo.svg
│   │   └── og-image.png
│   ├── fonts/
│   └── robots.txt
│
├── src/
│   ├── pages/                       # Astro pages (file-based routing)
│   │   ├── index.astro              # Marketing homepage
│   │   ├── landing.astro            # Paid traffic landing page
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── blog/
│   │   │   ├── index.astro          # Blog listing
│   │   │   └── [...slug].astro      # Dynamic blog post pages
│   │   └── app/
│   │       └── [...tool].astro      # Single React island for all tools
│   │
│   ├── layouts/                     # Astro layouts
│   │   ├── BaseLayout.astro         # Shared HTML structure
│   │   ├── MarketingLayout.astro    # Marketing pages
│   │   └── AppLayout.astro          # Assessment app (thin wrapper)
│   │
│   ├── components/                  # React components
│   │   ├── AssessmentApp.tsx        # Main React SPA (router + context)
│   │   │
│   │   ├── tools/                   # Assessment tool components
│   │   │   ├── AIReadinessTool.tsx
│   │   │   ├── LeadershipDNATool.tsx
│   │   │   ├── BusinessEITool.tsx
│   │   │   ├── VisionCanvasTool.tsx
│   │   │   ├── SWOTAnalysisTool.tsx
│   │   │   ├── AdvisorReadinessTool.tsx
│   │   │   ├── FinancialReadinessTool.tsx
│   │   │   ├── SOPMaturityTool.tsx
│   │   │   ├── RoadmapTool.tsx
│   │   │   ├── ReportCenterTool.tsx
│   │   │   └── SynthesisViewTool.tsx
│   │   │
│   │   ├── shared/                  # Shared UI components
│   │   │   ├── forms/
│   │   │   │   ├── SliderInput.tsx
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── TextArea.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── CheckboxGroup.tsx
│   │   │   ├── charts/
│   │   │   │   ├── RadarChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── LineChart.tsx
│   │   │   │   └── TimelineChart.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Badge.tsx
│   │   │   └── navigation/
│   │   │       ├── ToolNavigation.tsx
│   │   │       └── ProgressIndicator.tsx
│   │   │
│   │   ├── workspace/               # Workspace management
│   │   │   ├── ExportButton.tsx
│   │   │   ├── ImportButton.tsx
│   │   │   └── WorkspaceInfo.tsx
│   │   │
│   │   ├── report/                  # Report generation
│   │   │   ├── ReportPreview.tsx
│   │   │   ├── ReportSectionSelector.tsx
│   │   │   └── PDFGenerator.tsx
│   │   │
│   │   └── marketing/               # Marketing components (for .astro pages)
│   │       ├── Hero.astro
│   │       ├── Features.astro
│   │       └── CTA.astro
│   │
│   ├── lib/                         # Utilities and services
│   │   ├── tools/
│   │   │   ├── toolRegistry.ts      # Tool registration system
│   │   │   └── index.ts             # Tool imports & registration
│   │   │
│   │   ├── synthesis/               # Synthesis engine
│   │   │   ├── types.ts             # Insight, Rule interfaces
│   │   │   ├── ruleRegistry.ts      # Rule registration system
│   │   │   ├── rules/               # Individual rule modules
│   │   │   │   ├── executionCapabilityGap.ts  # E1
│   │   │   │   ├── unmitigatedThreat.ts       # E2
│   │   │   │   ├── burnoutRisk.ts             # E3
│   │   │   │   ├── strengthLeverage.ts        # E4
│   │   │   │   ├── sopMetricMissing.ts        # E5
│   │   │   │   ├── opportunityCapabilityMatch.ts  # E10
│   │   │   │   └── strengthMultiplication.ts      # E11
│   │   │   └── index.ts             # Export all
│   │   │
│   │   ├── workspace/
│   │   │   ├── export.ts            # .vwcg file export
│   │   │   ├── import.ts            # .vwcg file import
│   │   │   └── validation.ts        # Schema validation
│   │   │
│   │   ├── report/
│   │   │   ├── pdfGenerator.ts      # jsPDF wrapper
│   │   │   └── templates/
│   │   │       └── defaultTemplate.ts
│   │   │
│   │   └── utils/
│   │       ├── dateHelpers.ts
│   │       └── formatting.ts
│   │
│   ├── stores/                      # Zustand state stores
│   │   ├── workspaceStore.ts        # Main workspace state
│   │   └── uiStore.ts               # UI state (current tool, modals, etc.)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useWorkspace.ts
│   │   ├── useSynthesis.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── tool.ts                  # Tool interfaces
│   │   ├── workspace.ts             # Workspace schema
│   │   └── index.ts
│   │
│   ├── content/                     # Content Collections (blog)
│   │   ├── config.ts                # Define collections
│   │   └── blog/
│   │       ├── post-001.md
│   │       └── post-002.md
│   │
│   └── styles/
│       ├── global.css               # Global styles
│       └── tailwind.css             # Tailwind imports
│
├── astro.config.mjs                 # Astro configuration
├── tailwind.config.mjs              # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
└── README.md
```

### Key Organizational Principles

1. **Astro pages (`src/pages/`) for routes**: File-based routing
2. **React components (`src/components/`) for interactivity**: All React code here
3. **Business logic (`src/lib/`) separate from UI**: Pure functions, registries
4. **State in `src/stores/`**: Zustand stores
5. **Types in `src/types/`**: Shared TypeScript interfaces
6. **Static assets in `public/`**: Images, fonts (not processed)

---

## 7. Implementation Recommendations

### Phase 1 Build Order

**Week 1: Foundation**
1. Initialize Astro 5 project with React, Tailwind integrations
2. Set up basic file structure
3. Create `workspaceStore.ts` with localStorage persistence
4. Build `toolRegistry.ts` and `ruleRegistry.ts`
5. Create base layouts (MarketingLayout, AppLayout)

**Week 2: Tool Infrastructure**
1. Implement `ToolWrapper` component
2. Create shared form components (SliderInput, TextInput, etc.)
3. Build first example tool (AI Readiness) following standardized interface
4. Implement tool routing in AssessmentApp
5. Test Zustand persistence and .vwcg export/import

**Week 3: Synthesis Engine**
1. Implement synthesis rule interface
2. Build first 2-3 synthesis rules (E1, E2, E3)
3. Create `useSynthesis` hook
4. Test rule evaluation and insight generation

**Week 4: Testing & Documentation**
1. Write documentation for tool creation pattern (ARC-04 requirement)
2. Test cross-browser (Chrome, Firefox, Safari)
3. Performance audit (Lighthouse)
4. Create example .vwcg files for testing imports

### Critical Path Items

**Must-Have for Phase 1 Completion:**
- ✅ Zustand store with localStorage auto-save
- ✅ Tool registry with dynamic routing
- ✅ Rule registry with 3+ example rules
- ✅ .vwcg file export/import
- ✅ Standardized tool interface with 1 working example
- ✅ Documentation for adding new tools and rules

**Nice-to-Have (Can defer to Phase 2):**
- Lazy-loading tools
- Advanced import validation (safe mode)
- Server islands for invite validation
- Chart component library (can use basic HTML first)

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    },
    "strict": true,
    "skipLibCheck": true
  }
}
```

Enables:
- Path aliases (`import { toolRegistry } from '@lib/tools'`)
- Strict type checking
- React JSX support

### Environment Variables

**.env:**
```bash
# Public variables (client-side accessible)
PUBLIC_APP_NAME="VWCGApp"
PUBLIC_APP_VERSION="1.0.0"

# Server-only variables
INVITE_CODE_SALT="random-secret-string"
```

Access in Astro:
```javascript
import.meta.env.PUBLIC_APP_NAME
```

### Testing Strategy

**Tools to Install:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Structure:**
```
src/
├── lib/
│   └── synthesis/
│       └── rules/
│           ├── executionCapabilityGap.ts
│           └── executionCapabilityGap.test.ts  # Co-located tests
```

**Example Test:**
```typescript
// src/lib/synthesis/rules/executionCapabilityGap.test.ts
import { describe, it, expect } from 'vitest';
import executionCapabilityGapRule from './executionCapabilityGap';

describe('Execution Capability Gap Rule', () => {
  it('should detect gap when execution < 6 and pillars exceed limit', () => {
    const context = {
      tools: {
        'leadership-dna': { current: { execution: 5 } },
        'vision-canvas': { strategicPillars: [{}, {}, {}] } // 3 pillars
      },
      meta: { companyName: 'Test Co', assessmentDate: '2026-02-04' }
    };

    const insights = executionCapabilityGapRule.evaluate(context);

    expect(insights).toHaveLength(1);
    expect(insights[0].type).toBe('gap');
    expect(insights[0].severity).toBe(5);
  });

  it('should not detect gap when execution is sufficient', () => {
    const context = {
      tools: {
        'leadership-dna': { current: { execution: 8 } },
        'vision-canvas': { strategicPillars: [{}, {}, {}] }
      },
      meta: { companyName: 'Test Co', assessmentDate: '2026-02-04' }
    };

    const insights = executionCapabilityGapRule.evaluate(context);

    expect(insights).toHaveLength(0);
  });
});
```

### Performance Considerations

**Bundle Size Optimization:**
1. **Lazy-load tools**: Use `React.lazy()` for tool components
2. **Code splitting**: Astro does this automatically per-page
3. **Tree-shaking**: Ensure imports are named (`import { X } from 'lib'` not `import * as lib`)
4. **Recharts optimization**: Only import needed chart types

**Runtime Performance:**
1. **Debounce workspace saves**: Already handled by Zustand persist
2. **Memoize synthesis results**: Cache in workspace state
3. **Virtual scrolling**: For long tool lists (react-window)

**SEO Optimization:**
1. **Static marketing pages**: Use Astro (not React) for SEO pages
2. **Meta tags**: Generate per-page with Astro layouts
3. **Sitemap**: Use `@astrojs/sitemap` integration

---

## 8. Key Decisions & Tradeoffs

### Decision: Single React Island vs Multiple Islands

**Chosen:** Single large React island for `/app/*` routes

**Rationale:**
- Zustand state must be shared across all tools
- React Router needs single tree for navigation
- Simpler mental model for developers

**Tradeoff:**
- Slightly larger initial JavaScript bundle
- Acceptable: marketing pages remain pure Astro (fast)

### Decision: Co-located Tool Registration vs Centralized

**Chosen:** Co-located registration (tool registers itself on import)

**Rationale:**
- Tool metadata lives next to tool code
- Easier to add/remove tools (one file change)
- Follows React Pluggable patterns

**Tradeoff:**
- All tools imported even if not immediately rendered
- Mitigated with: React.lazy() for components

### Decision: localStorage vs IndexedDB

**Chosen:** localStorage with Zustand persist

**Rationale:**
- Synchronous API (simpler)
- 5-10MB limit sufficient for assessment data
- Zustand persist has built-in support

**Tradeoff:**
- Size limit (acceptable for text/numbers)
- No structured querying (not needed)

### Decision: Pure Functions for Synthesis vs OOP

**Chosen:** Pure functions (functional programming style)

**Rationale:**
- Easier to test (deterministic outputs)
- Fits React/TypeScript ecosystem
- Supports rule composition

**Tradeoff:**
- No inheritance (use composition instead)
- Acceptable: composition is more flexible

---

## 9. Sources & References

### Astro 5 + React Islands
- [Islands Architecture - Astro Docs](https://docs.astro.build/en/concepts/islands/)
- [Astro Islands Architecture Explained](https://strapi.io/blog/astro-islands-architecture-explained-complete-guide)
- [Build a Blog Tutorial: Build Your First Astro Island](https://docs.astro.build/en/tutorial/6-islands/1/)
- [Implement React Context in Astro with a Single Client](https://astropatterns.dev/p/react-love/react-context-in-astro)
- [Understanding Astro Islands Architecture - LogRocket](https://blog.logrocket.com/understanding-astro-islands-architecture/)

### Zustand State Management
- [Persisting Store Data - Zustand Docs](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [persist Middleware - Zustand Docs](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Taking Zustand Further: Persist, Immer, and DevTools Explained](https://medium.com/@skyshots/taking-zustand-further-persist-immer-and-devtools-explained-ab4493083ca1)
- [Zustand Middleware: The Architectural Core of Scalable State Management](https://beyondthecode.medium.com/zustand-middleware-the-architectural-core-of-scalable-state-management-d8d1053489ac)

### Tool Registry Pattern
- [Building a Component Registry in React - Frontend Weekly](https://medium.com/front-end-weekly/building-a-component-registry-in-react-4504ca271e56)
- [react-registry - npm](https://www.npmjs.com/package/react-registry)
- [Registry Pattern - GeeksforGeeks](https://www.geeksforgeeks.org/system-design/registry-pattern/)
- [From If-Else Hell to Clean Architecture with Function Registry Pattern](https://techhub.iodigital.com/articles/function-registry-pattern-react)

### Plugin Architecture & Rule Engines
- [React Pluggable - Thinking Features over Components](https://react-pluggable.github.io/)
- [Building a Rule Engine With TypeScript - Benjamin Ayangbola](https://benjamin-ayangbola.medium.com/building-a-rule-engine-with-typescript-1732d891385c)
- [Towards a Well-Typed Plugin Architecture - Codeless Code](https://code.lol/post/programming/plugin-architecture/)
- [A Simple Open-Close TypeScript Rule Engine with JSON Rules](https://medium.com/@summitmman/a-simple-open-close-typescript-rule-engine-with-json-rules-7ee57f64115c)

### File Structure & Best Practices
- [Project Structure - Astro Docs](https://docs.astro.build/en/basics/project-structure/)
- [Best Practices for File Organization in Astro.js](https://tillitsdone.com/blogs/astro-js-file-organization-guide/)
- [Astro JS - Project Structure - Tutorialspoint](https://www.tutorialspoint.com/astrojs/astrojs-project-structure.htm)

### TypeScript Design Patterns
- [Standard Schema - A Standard Interface for TypeScript Schema Validation Libraries](https://github.com/standard-schema/standard-schema)
- [Design Patterns in TypeScript - Refactoring Guru](https://refactoring.guru/design-patterns/typescript)
- [Advanced Design Patterns in TypeScript - DEV Community](https://dev.to/shafayeat/advanced-design-patterns-in-typescript-275)

---

## RESEARCH COMPLETE

**Status:** Phase 1 research completed successfully.

**Deliverables:**
- ✅ Astro 5 + React Islands setup guide
- ✅ Zustand localStorage persistence patterns
- ✅ Tool registry implementation approach
- ✅ Standardized tool interface definition
- ✅ Synthesis rule registry architecture
- ✅ Recommended file structure
- ✅ Implementation recommendations with build order

**Next Step:** Use this research to create detailed execution plan in `01-PLAN.md`
