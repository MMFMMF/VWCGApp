# Coding Conventions

**Analysis Date:** 2026-02-14

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `AiReadinessTool.tsx`, `ErrorBoundary.tsx`)
- Utility files: camelCase (e.g., `fileSystem.ts`, `cn.ts`)
- Tool definitions and modules: camelCase (e.g., `workspaceStore.ts`, `synthesis.ts`)
- Test helpers: camelCase (e.g., `navigation.ts`, `forms.ts`)

**Functions:**
- Regular functions: camelCase (e.g., `registerTool`, `runSynthesis`, `navigateToTool`)
- Async functions: camelCase (e.g., `consultAi`, `generateBriefingNarrative`, `captureIndividualReportPdf`)
- React components: PascalCase (e.g., `AppShell`, `ErrorBoundary`, `StrategicHealthWidget`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `LOGIC_VERSION`, `GEMINI_API_URL`)
- Regular variables: camelCase (e.g., `metadata`, `toolData`, `insights`)
- TypeScript types/interfaces: PascalCase (e.g., `WorkspaceState`, `ToolDefinition`, `Insight`)

**Types & Interfaces:**
- Types/interfaces always use PascalCase (e.g., `WorkspaceMetadata`, `ValidationResult`, `SynthesisRule`)
- Use `type` keyword for type-only imports (required by `verbatimModuleSyntax`): `import type { Insight } from '...'`
- Union types: camelCase descriptors (e.g., `InsightType = 'risk' | 'opportunity' | 'conflict' | 'strength'`)

## Code Style

**Formatting:**
- No explicit Prettier config; ESLint config in `eslint.config.js` with flat config format (ESLint v9)
- Import organization handled by ESLint recommended rules
- Indentation: 2 spaces (inferred from source code)

**Linting:**
- ESLint v9.39.1 with:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `eslint-plugin-react-hooks` for hooks rules
  - `eslint-plugin-react-refresh` for Vite React refresh
- Run via `npm run lint` (executes `eslint .`)

**TypeScript Strictness:**
- Strict mode enabled
- `noUnusedLocals: true` — unused variables cause build failures
- `noUnusedParameters: true` — unused function parameters cause build failures
- `verbatimModuleSyntax: true` — requires `import type` for type-only imports
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `erasableSyntaxOnly: true` — no enums, use string unions instead

**JSX Settings:**
- React 19 with automatic JSX transform (`jsx: "react-jsx"`)
- No need for `import React` in component files

## Import Organization

**Order:**
1. Third-party imports (React, lucide-react, zustand, etc.)
2. Type imports from third-party (using `import type`)
3. Internal path imports (using `@/` alias)
4. Type imports from internal modules (using `import type`)

**Path Aliases:**
- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)
- Always use `@/` for internal imports:
  - `import { useWorkspaceStore } from '@/store/workspaceStore'`
  - `import type { Insight } from '@/engine/types'`

**Example Pattern:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LucideIcon } from 'lucide-react';

import { validateWorkspace } from '@/validation/validator';
import type { Insight } from '@/engine/types';
```

## Error Handling

**Patterns:**
- Try/catch for async operations and file I/O: `src/components/layout/AppShell.tsx:25-31`, `src/engine/cloud.ts:42-73`
- Error messages should be descriptive and actionable
- For API errors, include status code and context: `src/engine/llm/openai-service.ts:101-114`
- Workspace errors use alert dialogs for user-facing failures: `src/components/layout/AppShell.tsx:29, 45`
- Synthesis rule failures log warning but don't crash the app: `src/engine/synthesis.ts:19-26`
- Error boundary catches React rendering errors: `src/components/ErrorBoundary.tsx`

**Error Recovery:**
- File loading: reset input element after handling error
- API calls: throw with descriptive message, let caller handle
- Component errors: ErrorBoundary catches and displays error details

## Logging

**Framework:** `console` (native browser API)

**Patterns:**
- `console.log()` for initialization and lifecycle events: `src/main.tsx:9`
- `console.log()` for LLM retry attempts: `src/engine/llm/openai-service.ts:247, 289`
- `console.warn()` for recoverable issues: `src/engine/synthesis.ts:25`, `src/registry/ToolRegistry.ts:17`
- `console.error()` for exceptions: `src/engine/cloud.ts:71`, `src/components/ErrorBoundary.tsx:24`
- Prefix logs with context: `[workspaceStore]`, `[PrintPdfService]` for easier debugging

**No Logging Config:** Application doesn't use structured logging or external logging service. All logs go to browser console.

## Comments

**When to Comment:**
- Complex business logic (e.g., synthesis rule conditions in `src/engine/rules-v2.ts`)
- Non-obvious DOM manipulation (e.g., PDF preparation in `tests/helpers/pdf.ts:36-72`)
- Provenance tracking and metadata explanations (e.g., `src/store/workspaceStore.ts:20-23`)
- Test helper purpose and UI interaction assumptions (e.g., `tests/helpers/forms.ts:7-8`)

**JSDoc/TSDoc:**
- Used selectively for exported functions and complex types
- Example from `tests/helpers/pdf.ts:29-35`:
```typescript
/**
 * Prepare the DOM for page.pdf() capture:
 * - Hide the Report Center left panel (config panel)
 * - Expand all scroll containers (remove height/overflow constraints)
 * - Remove transform/scale on preview wrapper
 * - Expand all ancestor containers up to body
 */
async function prepareDomForPdf(page: Page)
```

## Function Design

**Size Guidelines:**
- Aim for functions under 50 lines for clarity
- Helper functions are shorter (e.g., `resetWorkspace` in `tests/helpers/navigation.ts:23-27` is 5 lines)
- Complex logic broken into named helper functions (e.g., PDF helpers split into `prepareDomForPdf`, `captureIndividualReportPdf`, `captureUnifiedReportPdf`)

**Parameters:**
- Use destructuring for objects: `async function fillSwotQuadrant(page: Page, quadrant: string, items: Array<{ text: string; confidence: number }>)`
- Type all parameters explicitly
- For data objects, define interfaces (e.g., `PersonaData` with `meta`, `aiReadiness`, `leadershipDna`, etc.)

**Return Values:**
- Always explicitly type return values: `runSynthesis(workspace: any): Insight[]`
- Use `void` for side-effect-only functions
- Async functions return `Promise<T>`
- Void functions that handle their own error logging

## Module Design

**Exports:**
- Named exports for functions and types: `export const registerTool`, `export type ToolDefinition`
- Default exports not used
- Re-export barrel files for convenience (e.g., `src/engine/index.ts` re-exports synthesis, types, metrics)

**Barrel Files:**
- Used in `src/engine/index.ts` to consolidate exports: synthesis engine, types, derived metrics, SWOT analysis
- Used in `src/report/charts/index.ts`, `src/report/components/index.ts` for report subsystems
- Pattern: import core functionality, then re-export with selective `export { ... }` or `export type { ... }`

**Module Organization by Function:**
- **Store:** `src/store/workspaceStore.ts` — single Zustand store, all workspace state
- **Engine:** `src/engine/` — synthesis rules, types, LLM integration, metrics
- **Registry:** `src/registry/` — tool registry, definitions, plugin system
- **Validation:** `src/validation/` — per-tool validation profiles, validator logic
- **Utils:** `src/utils/` — file I/O, utility functions like `cn()`
- **Components:** `src/components/` — layout, UI primitives, error boundary
- **Tools:** `src/tools/` — each tool in its own directory with `index.ts` exporting `ToolDefinition`
- **Report:** `src/report/` — organized by function: charts, components, narrative, unified/individual reports, PDF generation

## Specific Patterns Observed

**Tool Registration Pattern:**
Each tool exports a `ToolDefinition` from its `index.ts`:
```typescript
import type { ToolDefinition } from '../../registry/ToolRegistry';
import { BrainCircuit } from 'lucide-react';

export const aiReadinessDefinition: ToolDefinition = {
    id: 'ai-readiness',
    name: 'AI Readiness',
    description: 'Assess AI maturity across 6 dimensions',
    path: '/tools/ai-readiness',
    icon: BrainCircuit,
    component: AiReadinessTool,
    validationProfileId: 'aireadiness_v1'
};
```

**Zustand Store Pattern:**
- Single store instance with `persist` middleware
- Partialize function for selective persistence
- `onRehydrateStorage` callback for post-load logic
- All state updates through named action methods

**React Component Pattern:**
- Functional components with TypeScript interfaces for props
- Forward refs for UI primitives (e.g., `Button`)
- Hook-based state management with `useWorkspaceStore`
- Error boundary wraps error-prone subtrees

**Enum Alternative:**
No enums used. String unions replace them:
```typescript
export type InsightType = 'risk' | 'opportunity' | 'conflict' | 'strength';
export type InsightSeverity = 'high' | 'medium' | 'low';
```

---

*Convention analysis: 2026-02-14*
