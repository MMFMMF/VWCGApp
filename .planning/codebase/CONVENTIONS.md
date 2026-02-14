# Coding Conventions

**Analysis Date:** 2025-02-14

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `AiReadinessTool.tsx`, `AppShell.tsx`)
- Utilities: camelCase with `.ts` extension (e.g., `cn.ts`, `fileSystem.ts`)
- Hooks: camelCase starting with `use` (e.g., `useWorkspaceStore`)
- Test files: Descriptive names with `.spec.ts` extension (e.g., `alex.spec.ts`, `app.spec.ts`)
- Persona data: kebab-case in `/tests/personas/` (e.g., `alex.ts`, `sarah.ts`)

**Functions & Handlers:**
- Regular functions: camelCase (e.g., `registerTool`, `getTools`, `runSynthesis`)
- Event handlers: `handle` prefix + PascalCase action (e.g., `handleSave`, `handleChange`, `handleLoadClick`)
- Helper functions in tests: descriptive camelCase (e.g., `fillAiReadiness`, `waitForSynthesis`, `collectConsoleErrors`)
- Utility predicates: verb-first camelCase (e.g., `hasKeywordMatches`, `getKeywordFrequency`)

**Variables & Constants:**
- Regular variables: camelCase (e.g., `metadata`, `toolId`, `insights`)
- Constants: UPPER_SNAKE_CASE (e.g., `DIMENSIONS`, `LOGIC_VERSION`, `STORAGE_KEY`, `EMPTY_DATA`)
- Store selectors: descriptive camelCase (e.g., `metadata`, `updateToolData`, `validationResults`)
- Type predicates: camelCase, returned as booleans (e.g., `isLogicOutdated`, `isRegistered`)

**Types & Interfaces:**
- Interfaces: PascalCase, no `I` prefix (e.g., `ToolDefinition`, `WorkspaceState`, `Insight`)
- Type unions: PascalCase (e.g., `InsightType = 'risk' | 'opportunity' | 'conflict' | 'strength'`)
- Exported types: Use `export type` (required by `verbatimModuleSyntax`) for type-only exports (e.g., `export type InsightSeverity = 'high' | 'medium' | 'low'`)

## Code Style

**Formatting:**
- No explicit formatter configured in `package.json`; follow ESLint rules as source of truth
- Line length: Implicit (no hard limit enforced)
- Indentation: 4 spaces (inferred from source code)
- Semicolons: Always required (ESLint enforces)

**Linting:**
- Tool: ESLint 9.39.1 with flat config (`eslint.config.js`)
- Base configs: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Applies to: `**/*.{ts,tsx}`
- Command: `npm run lint`
- Key enforcement: React Hooks rules + React Refresh rules for fast refresh compatibility

**TypeScript Strictness:**
- Strict mode enabled: `true`
- `noUnusedLocals`: Enabled — all local variables must be used
- `noUnusedParameters`: Enabled — all function parameters must be used
- `noFallthroughCasesInSwitch`: Enabled — switch statements must have breaks
- `noUncheckedSideEffectImports`: Enabled — no side effects from imported modules without explicit imports
- `erasableSyntaxOnly`: Enabled — no enums, use string unions instead
- `verbatimModuleSyntax`: Enabled — requires `import type` for type-only imports
- Path aliases: `@/*` maps to `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`)

## Import Organization

**Order:**
1. React and React DOM (e.g., `import React from 'react'`, `import { useEffect } from 'react'`)
2. Third-party libraries (e.g., `zustand`, `react-router-dom`, `lucide-react`, `chart.js`)
3. Internal utilities and stores (e.g., `import { useWorkspaceStore }`, `import { cn }`)
4. Internal components (e.g., `import { AppShell }`)
5. Types (use `import type` for type-only imports, required by `verbatimModuleSyntax`)
6. Styles (e.g., `import './index.css'`)

**Example from `src/main.tsx`:**
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeRegistry } from './registry/registry'
import { initializeValidation } from './validation'
import { registerCharts } from './lib/charts'
```

**Path aliases:**
- Always use `@/` prefix for internal imports instead of relative paths (e.g., `@/utils/cn`, `@/store/workspaceStore`)

## Error Handling

**Patterns:**
- Try/catch for file operations and async operations (e.g., `handleFileChange` in `AppShell.tsx`)
- Console logging for non-critical failures: `console.warn()` for degraded behavior, `console.error()` for exceptions
- Rule execution: Try/catch with `console.warn` on rule failure, synthesis continues with other rules (see `src/engine/synthesis.ts` lines 18-26)
- Validation failure: Return `{ status: 'error', issues: [...] }` object from validators
- UI error feedback: Show alert() dialogs for user-facing errors (e.g., "Failed to load workspace file.")
- Fail-safe returns: Functions return safe defaults when inputs are invalid (e.g., `runSynthesis` returns `[]` if workspace is null)

**Example from `src/engine/synthesis.ts`:**
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

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- Development logs: `console.log()` for initialization and debug info (often commented out in production code)
- Warning logs: `console.warn()` for degraded behavior, rule failures, missing profiles
- Error logs: `console.error()` for caught exceptions
- Log context: Always include context prefix or rule name (e.g., `[workspaceStore]`, `Rule ${rule.id}`)

**Example from `src/store/workspaceStore.ts` (lines 95-97):**
```typescript
console.log('[workspaceStore] Running synthesis with tools:', Object.keys(nextTools));
const newInsights = runSynthesis(simulation);
console.log('[workspaceStore] Synthesis returned insights:', newInsights.length, newInsights);
```

## Comments

**When to Comment:**
- Complex logic: Explain the "why" not the "what" (e.g., explaining severity sorting or maturity calculation)
- Non-obvious intent: Clarify business rules (e.g., "burnout risk fires when maturity < 70%")
- Initialization sequence: Document startup order (e.g., registry → validation → charts in `main.tsx`)
- Workarounds: Note temporary solutions or hacks (e.g., "reset input" in `AppShell.tsx` line 48)
- Edge cases: Document boundaries and assumptions (e.g., "pillarCount === 0 means no ambition, default safe")

**Avoid:**
- Commenting obvious code: `const name = 'Alex'` doesn't need a comment
- Outdated comments: Keep comments in sync with code
- Redundant comments: Let type annotations and clear naming speak for themselves

**JSDoc/TSDoc:**
- Used minimally; only on exported functions and interfaces with complex behavior
- Format: Standard JSDoc with `/**` ... `*/` block comments
- Example from `src/engine/derived-metrics.ts` (lines 1-4):
```typescript
/**
 * Derived Metrics Module
 * Computes 6 cross-assessment metrics from workspace data
 */
```

**Test comment style:**
- Descriptive test names replace comments (e.g., test name "AI Readiness — set all 6 dimension sliders" is self-documenting)
- Inline comments in test helpers explain selector logic or data structure mapping (e.g., in `fillLeadershipDna` explaining DOM order)

## Function Design

**Size:**
- Small, focused functions (15-40 lines typical)
- Complex synthesis rules broken into helper functions (e.g., `computeExecutionAmbitionRatio`, `computeFounderDependencyIndex`)
- React components: 50-150 lines (larger components like `StrategicHealthWidget` at 284 lines are exceptions and candidates for refactoring)

**Parameters:**
- Prefer explicit parameters over destructuring for clarity (e.g., `fillAiReadiness(page: Page, data: Record<string, number>)`)
- Use record/object for related data (e.g., `data: Record<string, number>` for dimension scores)
- No more than 4-5 parameters; use objects for options

**Return Values:**
- Functions return early on error conditions (e.g., `if (!dna || !vision) return 0;`)
- Null/undefined for missing data; `0` or empty arrays `[]` for "no results"
- Complex returns use interfaces (e.g., `DerivedMetrics`, `ValidationResult`)
- Promises in async handlers; synchronous where possible (synthesis runs synchronously per MVP design)

## Module Design

**Exports:**
- One primary export per file (e.g., `export const AiReadinessTool` for component files)
- Multiple named exports for utilities and constants (e.g., `export const registerTool`, `export const getTools`)
- Type exports: Always use `export type` (required by `verbatimModuleSyntax`)

**Barrel Files:**
- Used selectively in `src/engine/index.ts` to re-export public API
- Example: `export { runSynthesis, registerRule } from './synthesis.ts'`
- Avoid circular dependencies through barrel files

**File organization:**
- One component per file (except helpers which can have multiple related functions)
- Co-locate related types with their implementation (e.g., `Insight` interface in `types.ts` alongside `SynthesisRule`)
- Utilities grouped by domain (e.g., all file system utilities in `src/utils/fileSystem.ts`)

---

*Convention analysis: 2025-02-14*
