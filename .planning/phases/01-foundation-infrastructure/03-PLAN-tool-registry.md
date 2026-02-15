---
wave: 2
depends_on:
  - 02-PLAN-zustand-store
files_modified:
  - src/types/tool.ts
  - src/lib/tools/toolRegistry.ts
  - src/lib/tools/index.ts
  - src/components/ToolWrapper.tsx
  - src/components/AssessmentApp.tsx
autonomous: true
---

# Plan: Tool Registry Pattern

## Objective

Create the tool registry pattern for dynamic tool registration and routing. This enables adding new assessment tools without modifying core router code, fulfilling requirements ARC-01 (modular architecture), ARC-02 (tool registry pattern), and ARC-03 (standardized interface).

## Tasks

### Task 1: Define Tool Interface Types

**Action:** Create comprehensive TypeScript interfaces for tool definitions
**Files:** src/types/tool.ts
**Details:**

```typescript
import { ComponentType } from 'react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: 'assessment' | 'planning' | 'sop' | 'synthesis';
  order: number;
  icon?: string;
  estimatedTime?: number; // minutes
}

export interface ToolProps {
  data?: Record<string, unknown>;
  onUpdate?: (data: Record<string, unknown>) => void;
  readonly?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ChartData {
  type: 'radar' | 'bar' | 'line' | 'pie';
  data: Array<{ label: string; value: number; [key: string]: unknown }>;
  options?: Record<string, unknown>;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface PDFSection {
  title: string;
  summary?: string;
  charts?: ChartData[];
  tables?: TableData[];
  insights?: string[];
  rawData?: Record<string, unknown>;
}

export interface ToolDefinition {
  metadata: ToolMetadata;
  component: ComponentType<ToolProps>;
  validate?: (data: unknown) => ValidationResult;
  exportToPDF?: (data: unknown) => PDFSection;
  getDefaultData?: () => Record<string, unknown>;
}
```

### Task 2: Create Tool Registry Class

**Action:** Implement singleton registry for tool registration and retrieval
**Files:** src/lib/tools/toolRegistry.ts
**Details:**

```typescript
import type { ToolDefinition } from '@types/tool';

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.metadata.id)) {
      console.warn(`Tool ${tool.metadata.id} already registered, overwriting`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  unregister(id: string): void {
    this.tools.delete(id);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): ToolDefinition[] {
    return this.getAll().filter(tool => tool.metadata.category === category);
  }

  getSorted(): ToolDefinition[] {
    return this.getAll().sort((a, b) => a.metadata.order - b.metadata.order);
  }

  getIds(): string[] {
    return Array.from(this.tools.keys());
  }

  has(id: string): boolean {
    return this.tools.has(id);
  }

  count(): number {
    return this.tools.size;
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
```

### Task 3: Create Tool Registry Index

**Action:** Create centralized entry point that imports/registers all tools
**Files:** src/lib/tools/index.ts
**Details:**

```typescript
// Re-export registry
export { toolRegistry } from './toolRegistry';
export type { ToolDefinition, ToolProps, ToolMetadata } from '@types/tool';

// Tool imports will be added here as tools are created
// Example:
// import '../../../components/tools/AIReadinessTool';
// import '../../../components/tools/LeadershipDNATool';

// For now, just export the registry
// Tools self-register when imported
```

### Task 4: Create Tool Wrapper Component

**Action:** Create wrapper that connects tools to Zustand store
**Files:** src/components/ToolWrapper.tsx
**Details:**

```typescript
import { Suspense } from 'react';
import { useToolData } from '@hooks/useWorkspace';
import type { ToolDefinition } from '@types/tool';

interface Props {
  tool: ToolDefinition;
  readonly?: boolean;
}

function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

export function ToolWrapper({ tool, readonly = false }: Props) {
  const { data, update } = useToolData(tool.metadata.id);
  const Component = tool.component;

  // Initialize with default data if not present
  const toolData = data ?? (tool.getDefaultData?.() || {});

  return (
    <div className="tool-container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tool.metadata.name}</h1>
        <p className="mt-1 text-gray-600">{tool.metadata.description}</p>
        {tool.metadata.estimatedTime && (
          <span className="text-sm text-gray-500">
            Estimated time: {tool.metadata.estimatedTime} minutes
          </span>
        )}
      </header>

      <Suspense fallback={<ToolLoadingFallback />}>
        <Component
          data={toolData}
          onUpdate={update}
          readonly={readonly}
        />
      </Suspense>
    </div>
  );
}
```

### Task 5: Update AssessmentApp with Dynamic Routing

**Action:** Update main React app to generate routes from tool registry
**Files:** src/components/AssessmentApp.tsx
**Details:**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toolRegistry } from '@lib/tools';
import { useWorkspace } from '@hooks/useWorkspace';
import { ToolWrapper } from './ToolWrapper';

function Dashboard() {
  const tools = toolRegistry.getSorted();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">VWCGApp Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <a
            key={tool.metadata.id}
            href={`/app/tools/${tool.metadata.id}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{tool.metadata.name}</h3>
            <p className="text-sm text-gray-600">{tool.metadata.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function ToolView({ toolId }: { toolId: string }) {
  const tool = toolRegistry.get(toolId);

  if (!tool) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Tool Not Found</h1>
        <p>The tool "{toolId}" does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToolWrapper tool={tool} />
    </div>
  );
}

export default function AssessmentApp() {
  const { isHydrated } = useWorkspace();
  const tools = toolRegistry.getSorted();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/app">
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Dynamic routes from registry */}
          {tools.map(tool => (
            <Route
              key={tool.metadata.id}
              path={`/tools/${tool.metadata.id}`}
              element={<ToolView toolId={tool.metadata.id} />}
            />
          ))}

          {/* Catch-all for unknown tool routes */}
          <Route path="/tools/*" element={<Navigate to="/" replace />} />

          {/* Future routes */}
          <Route path="/report" element={<div>Report Center (Coming Soon)</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

### Task 6: Add Tool Type Exports

**Action:** Create centralized type exports
**Files:** src/types/index.ts
**Details:**

```typescript
export * from './tool';
export * from './workspace';
```

## Verification

- [ ] `toolRegistry.register(tool)` adds tool to registry
- [ ] `toolRegistry.get('tool-id')` retrieves registered tool
- [ ] `toolRegistry.getSorted()` returns tools in order
- [ ] `toolRegistry.getByCategory('assessment')` filters correctly
- [ ] Dashboard shows registered tools as cards
- [ ] Clicking tool card navigates to `/app/tools/{tool-id}`
- [ ] ToolWrapper renders tool component with correct props
- [ ] ToolWrapper passes data from Zustand store to tool
- [ ] ToolWrapper calls onUpdate when tool saves data
- [ ] Unknown tool IDs show "Tool Not Found" message
- [ ] TypeScript types are exported and importable

## Must-Haves

- Modular tool architecture - each tool is self-contained (ARC-01)
- Tool registry pattern for dynamic registration (ARC-02)
- Standardized tool interface (data, onUpdate, readonly) (ARC-03)
- Dynamic route generation from registry
- Tool wrapper that connects components to Zustand
- Type-safe tool definitions with TypeScript
