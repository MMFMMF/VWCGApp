# Coding Conventions

**Analysis Date:** 2026-02-13

## Naming Patterns

**Files:**
- React components (`.tsx`): PascalCase (e.g., `AiReadinessTool.tsx`, `LeadershipDnaTool.tsx`, `StrategicHealthWidget.tsx`)
- TypeScript utilities and logic (`.ts`): camelCase (e.g., `workspaceStore.ts`, `validator.ts`, `synthesis.ts`)
- Directories: kebab-case (e.g., `src/tools/ai-readiness/`, `src/tools/leadership-dna/`)
- Tool IDs: kebab-case strings (e.g., `ai-readiness`, `leadership-dna`, `vision-canvas`, `90-day-roadmap`)

**Functions:**
- camelCase for all functions (e.g., `runSynthesis`, `updateToolData`, `validateWorkspace`, `navigateToTool`, `fillAiReadiness`)
- Export functions without prefix (not `export function getTools()` vs `export const getTools = ()` — use const arrow functions for consistency)
- Helper functions in test files follow same camelCase: `resetWorkspace`, `navigateToTool`, `fillSwot`

**Variables:**
- camelCase for all variables (e.g., `toolId`, `metadata`, `validationResults`, `insightCount`)
- Constants in UPPERCASE_SNAKE_CASE only for globally exported constants (e.g., `LOGIC_VERSION`, `STORAGE_KEY`, `DIMENSIONS`)
- Local constants use camelCase unless they are module-level configuration (e.g., `const DIMENSIONS = [...]` in tool components)

**Types:**
- PascalCase for all interface names (e.g., `ToolDefinition`, `WorkspaceState`, `ValidationResult`, `Insight`)
- PascalCase for type aliases (e.g., `InsightType`, `InsightSeverity`)
- String union types in lowercase (e.g., `'primary' | 'secondary' | 'outline'`, `'high' | 'medium' | 'low'`)

## Code Style

**Formatting:**
- No explicit formatter configured (not Prettier or Biome in project config)
- ESLint only, configured in `eslint.config.js`
- Target: ES2022 with React 19 JSX transform

**Linting:**
- ESLint 9.39.1 with:
  - TypeScript ESLint recommended rules
  - React Hooks eslint-plugin
  - React Refresh eslint-plugin
  - No strict style rules (formatting is loose)
- Run: `npm run lint` — checks all `.ts` and `.tsx` files
- No `.eslintignore` — uses ESLint's flat config `globalIgnores: ['dist']`

**TypeScript Strictness:**
- Strict mode enabled (`strict: true`)
- `noUnusedLocals: true` — unused variables cause build failures
- `noUnusedParameters: true` — unused parameters cause build failures
- `verbatimModuleSyntax: true` — **requires `import type` for type-only imports**
  - Example: `import type { Insight } from './types'` (not `import { Insight }`)
  - Example: `import { useState } from 'react'` (regular import for values)
- `erasableSyntaxOnly: true` — no enums, use string unions instead
- `noFallthroughCasesInSwitch: true` — all switch cases must have break or return
- `noUncheckedSideEffectImports: true` — side-effect imports must be explicit

## Import Organization

**Order (observed pattern):**
1. External libraries (React, zustand, lucide-react, chart.js)
2. Local type imports (`import type { ... } from '@/...'`)
3. Local value imports (`import { ... } from '@/...'`)
4. Relative imports (from parent/sibling directories)

**Path Aliases:**
- `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`)
- Used throughout codebase: `import { useWorkspaceStore } from '@/store/workspaceStore'`
- Enables clean imports without `../../../` chains

**Type-only Imports:**
Example from `src/store/workspaceStore.ts`:
```typescript
import type { Insight } from '../engine/types';
import type { ValidationResult } from '../validation/types';
```

Example from test files (`tests/helpers/navigation.ts`):
```typescript
import { type Page } from '@playwright/test';
```

## Error Handling

**Patterns:**
- Try-catch blocks for file operations and async calls
- Example in `src/utils/fileSystem.ts`:
  ```typescript
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!json.version || !json.tools) {
          throw new Error('Invalid workspace file format');
        }
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
  });
  ```

- Validation returns error codes and severity levels (not exceptions)
- Example in `src/validation/validator.ts`:
  ```typescript
  if (!workspace || typeof workspace !== 'object') {
    return { status: 'error', issues: [{ code: 'STRUCT-001', message: '...', path: 'root', severity: 'error' }] };
  }
  ```

- Synthesis rules wrap execution in try-catch and log warnings (don't throw)
- Example in `src/engine/synthesis.ts`:
  ```typescript
  for (const rule of rules) {
    try {
      const result = rule.execute(workspace);
      if (result) {
        insights.push(result);
      }
    } catch (err) {
      console.warn(`Rule ${rule.id} failed execution:`, err);
    }
  }
  ```

- UI error handling via `<ErrorBoundary>` component for React errors
- Alert dialogs for user-facing errors: `alert(err.message)`

## Logging

**Framework:** `console` (no dedicated logging library)

**Patterns:**
- Development info: `console.log('[context] message')`
  - Example: `console.log('[workspaceStore] Running synthesis with tools:', ...)`
  - Bracketed context helps identify log source
- Warnings: `console.warn('Rule {id} failed execution:', err)`
- Errors: `console.error('Uncaught error:', error, errorInfo)` (in ErrorBoundary)
- Test helpers collect errors via Playwright: `page.on('console', msg => if (msg.type() === 'error') ...)`

## Comments

**When to Comment:**
- JSDoc for exported functions and components (not consistently used, but present in test helpers)
- Block comments for major sections (validation profiles, synthesis rules)
- Inline comments for non-obvious logic or workarounds

**Examples:**
- In `tests/helpers/navigation.ts`:
  ```typescript
  /**
   * Navigate to a tool by clicking its sidebar link.
   * Tool names match the sidebar text from the registry.
   */
  export async function navigateToTool(page: Page, toolName: string) { ... }
  ```

- In `src/validation/profiles_p1.ts`:
  ```typescript
  // Note: The current implementation stores flat fields like 'current_Vision', not an executives array
  // We will validate against the CURRENT implementation structure...
  ```

- In `src/engine/synthesis.ts`:
  ```typescript
  // Sort by severity (High -> Low)
  return insights.sort((a, b) => { ... });
  ```

## Function Design

**Size:** Functions range from 5-50 lines; component render functions can be 100+ lines for complex UI

**Parameters:**
- Typed with TypeScript interfaces
- Example: `function fillSwotQuadrant(page: Page, quadrant: string, items: Array<{ text: string; confidence: number }>) { ... }`
- Zustand selectors use inline arrow functions: `useWorkspaceStore(state => state.metadata)`

**Return Values:**
- Explicit return types (enforced by TypeScript strict mode)
- Null for "no result" (synthesis rules return `Insight | null`)
- Void for side-effect functions (Zustand actions)
- Promise wrappers for async file operations

## Module Design

**Exports:**
- Single default export for tool components: `export const AiReadinessTool: React.FC = () => { ... }`
- Named exports for utilities and helpers: `export function navigateToTool(...) { ... }`
- Constants and types exported as-is: `export const LOGIC_VERSION = 'v1.1.0'`

**Barrel Files:**
- `src/registry/registry.ts` imports all tools and calls `registerTool()` for each
- `src/validation/index.ts` imports all profiles and calls `registerProfile()` for each
- `src/report/charts/index.ts` exports chart components
- `src/report/components/index.ts` exports report UI components
- Pattern: collect related exports in barrel `index.ts` files for easier imports

**Structure:**
- Zustand store in single file: `src/store/workspaceStore.ts` with persist middleware
- Validation profiles split across three files by tool group: `profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts`
- Synthesis rules in `src/engine/rules-v2.ts` (old `rules.ts` kept but unused)
- Engine utilities: `synthesis.ts`, `types.ts`, `swot-keywords.ts`, `derived-metrics.ts`

## React Patterns

**Functional Components:**
- Arrow function const: `export const ComponentName: React.FC = () => { ... }`
- Hooks used extensively: `useState`, `useEffect`, `useRef`
- Custom hooks for store access: `const data = useWorkspaceStore(state => state.tools[toolId])`

**Props:**
- Typed via interfaces extending `React.HTMLAttributes<Element>` for button/input components
- Example: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | ...; size?: 'sm' | 'md' | 'lg'; }`

**Styling:**
- TailwindCSS classes directly in JSX
- `cn()` utility from `src/utils/cn.ts` for conditional class merging (uses clsx + tailwind-merge)
- Example: `className={cn('base-classes', { 'conditional-class': condition })}`

**Components Location:**
- UI components: `src/components/ui/` (Button, ExportButton, etc.)
- Layout components: `src/components/layout/` (AppShell, SafeModeBanner)
- Domain components: `src/tools/{tool-name}/` (tool-specific UI)
- Report components: `src/report/components/`, `src/report/charts/`
- Dashboard: `src/tools/dashboard/`, `src/components/dashboard/`

## Special Cases

**Zustand Store:**
- Single store for entire workspace: `useWorkspaceStore`
- Persisted to localStorage under key `vwcg-workspace`
- Structured as: `{ version, metadata, tools: { [toolId]: data }, provenance, ... }`
- Actions trigger Synthesis Engine synchronously on data update

**Validation:**
- Per-tool profiles registered via `ValidationProfiles` registry
- Validation results use code + severity + path for precise error reporting
- Status: `'ok' | 'warn' | 'error'` (aggregate based on issue severity)

**Synthesis Rules:**
- Rule interface: `{ id, name, description, execute: (workspace) => Insight | null }`
- Rules sorted by severity after execution
- Rules use cross-tool pattern matching (e.g., Leadership DNA + Vision Canvas → Execution Gap)

---

*Convention analysis: 2026-02-13*
