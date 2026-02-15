# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Button.tsx`, `ErrorBoundary.tsx`, `AppShell.tsx`)
- Utilities and helpers: camelCase (e.g., `workspaceStore.ts`, `cn.ts`, `validator.ts`)
- Type/interface files: camelCase (e.g., `types.ts`)
- Constants/data files: camelCase (e.g., `alex.ts`, `templates.ts`, `derived-metrics.ts`)

**Functions:**
- camelCase for all functions (e.g., `navigateToTool`, `fillAiReadiness`, `runSynthesis`)
- Test/utility functions use camelCase (e.g., `resetWorkspace`, `expectInsightVisible`)
- Exported constants use SCREAMING_SNAKE_CASE (e.g., `LOGIC_VERSION`, `STORAGE_KEY`, `AI_DIMENSIONS`)

**Variables:**
- camelCase for all variables (e.g., `nextTools`, `newInsights`, `sliders`)
- Prefixes for booleans: `is`, `has`, `can` (e.g., `isSafeMode`, `hasError`)
- Array names plural or with "List" suffix (e.g., `errors`, `toolIds`)

**Types:**
- PascalCase for interfaces and types (e.g., `WorkspaceState`, `ToolDefinition`, `Insight`)
- String union types lowercase with pipes (e.g., `'risk' | 'opportunity' | 'conflict'`)
- Type imports use `import type` keyword (required by `verbatimModuleSyntax`)

## Code Style

**Formatting:**
- No explicit `.prettierrc` file — using project defaults
- Target ES2022, ESNext modules
- 2-space indentation (inferred from code)
- Line length unlimited (no specific limit enforced)

**Linting:**
- ESLint with flat config format in `eslint.config.js`
- Extends: `@eslint/js`, `typescript-eslint/recommended`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Target: ES2020 with browser globals

**Strict TypeScript:**
- `strict: true` — enables all strict type checking
- `noUnusedLocals: true` — unused variables cause build failure
- `noUnusedParameters: true` — unused parameters cause build failure
- `noFallthroughCasesInSwitch: true` — switch cases must have break/return
- `noUncheckedSideEffectImports: true` — side-effect imports must be explicit
- `erasableSyntaxOnly: true` — no enums, use string unions instead
- `verbatimModuleSyntax: true` — `import type` required for type-only imports

## Import Organization

**Order:**
1. React and framework imports (e.g., `import { useState } from 'react'`)
2. Third-party libraries (e.g., `import { create } from 'zustand'`)
3. Internal imports from `@/` alias (e.g., `import { useWorkspaceStore } from '@/store'`)
4. Local relative imports (when necessary)
5. Type imports via `import type` (placed at top regardless of group)

**Path Aliases:**
- `@/` maps to `src/` — use this for all internal imports
- Configured in both `vite.config.ts` and `tsconfig.app.json`
- Example: `import { cn } from '@/utils/cn'` (never `'../../utils/cn'`)

**Import Type Keyword:**
```typescript
// ✅ CORRECT — use import type for types only
import type { Insight } from '@/engine/types';
import type { FC } from 'react';

// ❌ INCORRECT — don't mix type and value imports
import { type Insight, runSynthesis } from '@/engine';
```

## Error Handling

**Patterns:**
- ErrorBoundary class component wraps React tree in `src/components/ErrorBoundary.tsx`
- Catches React render errors via `getDerivedStateFromError()` and `componentDidCatch()`
- Displays error details in a red bordered box with `<details>` element for expansion
- Workspace operations catch errors via try/catch with console logging (e.g., `catch (error) { console.error(...) }`)

**No try/catch in most paths** — React error boundary handles render errors. Data operations (validation, synthesis) return error status (e.g., `ValidationResult` with `status: 'error'`) rather than throwing.

## Logging

**Framework:** Native `console` (no logging library)

**Patterns:**
- Prefixed logs with module name in brackets: `console.log('[workspaceStore] ...')`, `console.warn('[validator] ...')`
- Log when running async operations: e.g., synthesis start and result count
- Filter test errors: exclude logs from `[workspaceStore]` tag when checking console errors in tests
- Error logs: `console.error('context:', error)` for failures

**Typical Usage:**
```typescript
console.log('[workspaceStore] Running synthesis with tools:', Object.keys(nextTools));
console.warn(`Validation profile ${id} not found`);
console.error('Failed to load saved workspace:', error);
```

## Comments

**When to Comment:**
- Above complex business logic (e.g., "Phase 5: Run Synthesis on every update")
- At section dividers for file organization (e.g., `// ---------------------------------------------------------------------------`)
- Explaining why something is done a certain way (e.g., "DO NOT auto-update logic version here. Logic version update requires explicit recompute.")

**JSDoc/TSDoc:**
- Used sparingly for public functions and helpers
- Function signature includes parameters and return type inline
- Example from test helpers:
```typescript
/**
 * Navigate to a tool by clicking its sidebar link.
 * Tool names match the sidebar text from the registry.
 */
export async function navigateToTool(page: Page, toolName: string) { ... }
```

**Multi-line comments in sections:**
```typescript
// ---------------------------------------------------------------------------
// SECTION NAME
// ---------------------------------------------------------------------------
```

## Function Design

**Size:** Functions typically 5-40 lines; no strict limit enforced

**Parameters:**
- Named parameters for object types (e.g., `function fillVisionCanvas(page: Page, data: { northStar: string; ... })`)
- Single-line parameter lists for simple functions
- Type annotations required (TypeScript strict mode)

**Return Values:**
- Explicit return types on exported functions (inferred for internal functions)
- No implicit `any` returns
- Async functions return `Promise<T>`
- Test helpers return void or Promise-based values

**Example from store:**
```typescript
updateToolData: (toolId: string, data: any) => set((state) => {
  const nextTools = { ...state.tools, [toolId]: { ...(state.tools[toolId] || {}), ...data } };
  const newInsights = runSynthesis(simulation);
  return { tools: nextTools, insights: newInsights };
})
```

## Module Design

**Exports:**
- Named exports preferred (e.g., `export const registerTool = (...)`)
- Default exports for main components (e.g., `export default App`)
- Type exports use `export type` keyword

**Barrel Files:**
- `src/engine/index.ts` exports public API for synthesis engine
- `src/validation/index.ts` exports profiles and validator
- Avoid barrel re-exports of internal details

**Example:**
```typescript
// src/engine/index.ts — public API
export { runSynthesis, registerRule } from './synthesis';
export { computeDerivedMetrics, scanSwotText } from './derived-metrics';
export type { Insight, SynthesisRule } from './types';
```

## React Patterns

**Components:**
- Function components exclusively (no class components except ErrorBoundary)
- Hooks for state: `useState` (rarely used), primarily `useWorkspaceStore` from Zustand
- No PropTypes — TypeScript interfaces define props

**Props Interface:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destruct';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => { ... }
);
Button.displayName = 'Button';
```

**Styling:**
- TailwindCSS utility classes exclusively
- `cn()` utility from `@/utils/cn.ts` for conditional classes (wraps clsx + tailwind-merge)
- No inline styles or CSS modules

## State Management

**Store Pattern (Zustand):**
- Single global store: `useWorkspaceStore` in `src/store/workspaceStore.ts`
- Selector syntax: `useWorkspaceStore(state => state.tools[toolId])`
- Never destructure at hook call top level (use selector for fine-grained updates)
- State divided: Persisted (via `persist` middleware) + Ephemeral

**Persisted Fields:**
```typescript
version, metadata, tools, provenance  // localStorage: 'vwcg-workspace'
```

**Ephemeral (computed on rehydrate):**
```typescript
isSafeMode, previewData, validationResults, insights, lastExportTime
```

---

*Convention analysis: 2026-02-15*
