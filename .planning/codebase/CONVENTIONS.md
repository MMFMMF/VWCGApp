# Coding Conventions

**Analysis Date:** 2026-02-13

## Naming Patterns

**Files:**
- React components: PascalCase, matching component name (e.g., `AiReadinessTool.tsx`)
- Utility/logic files: camelCase (e.g., `fileSystem.ts`, `synthesis.ts`)
- Type files: camelCase (e.g., `types.ts`, `prompts.ts`)
- Index files: `index.ts` or `index.tsx` for tool/component exports
- Tool definition files: Named after tool (e.g., `AiReadinessTool.tsx`), with companion `index.ts` for export

**Functions:**
- Handlers: `handle` prefix + camelCase (e.g., `handleSave`, `handleChange`, `handleFileChange`)
- Utilities: camelCase, verb-noun pattern (e.g., `saveWorkspaceToFile`, `loadWorkspaceFromFile`)
- React hooks (custom): `use` prefix + camelCase (e.g., `useWorkspaceStore`)
- Synthesis rules: camelCase + `Rule` suffix (e.g., `executionGapRule`, `burnoutRiskRule`)

**Variables:**
- Constants (module-level): UPPER_SNAKE_CASE (e.g., `LOGIC_VERSION`, `STORAGE_KEY`, `DIMENSIONS`, `EMPTY_DATA`)
- Local variables: camelCase (e.g., `nextTools`, `newInsights`, `metadata`)
- Store state: camelCase (e.g., `isSafeMode`, `lastModified`, `previewData`)
- Data objects: camelCase (e.g., `chartData`, `simulation`)

**Types:**
- Interfaces: PascalCase, with `I` optional (used with interface keyword) (e.g., `Props`, `State`, `WorkspaceMetadata`, `WorkspaceState`, `ValidationResult`)
- Type aliases: PascalCase (e.g., `ValidationStatus`)
- Type imports: Use `type` keyword for type-only imports (required by TypeScript strict mode) (e.g., `import type { LucideIcon } from 'lucide-react'`)

## Code Style

**Formatting:**
- Line length: No explicit limit enforced, but code remains readable
- Indentation: 4 spaces in configuration files (e.g., `tsconfig.app.json`); otherwise follows Vite defaults
- Semicolons: Always present at end of statements
- Quotes: Single quotes for strings, double quotes for HTML/JSX attributes
- Trailing commas: Present in multi-line structures

**Linting:**
- Tool: ESLint 9.39.1 with TypeScript ESLint
- Config: `eslint.config.js` using flat config format
- Extends: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`
- Key rules enforced:
  - React hooks rules (`eslint-plugin-react-hooks`)
  - React refresh rules (`eslint-plugin-react-refresh`)
  - No undefined variables
  - Proper promise/async handling

## Import Organization

**Order:**
1. React and core libraries (e.g., `import React from 'react'`, `import { useEffect } from 'react'`)
2. Third-party packages (e.g., `import { create } from 'zustand'`, `import { useWorkspaceStore } from '...'`)
3. Internal absolute imports using `@/` path alias (e.g., `import { useWorkspaceStore } from '@/store/workspaceStore'`)
4. Relative imports (e.g., `import { Button } from '../../components/ui/Button'`)
5. Type-only imports separate at top of each group: `import type { ToolDefinition } from '...'`

**Path Aliases:**
- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)
- Used for cleaner imports across tool components and utilities
- Example: `import { useWorkspaceStore } from '@/store/workspaceStore'`

## Error Handling

**Patterns:**
- Synthesis rules: Wrapped in try-catch with `console.warn()` logging (rule execution failures do not halt synthesis)
  - Example in `src/engine/synthesis.ts`:
    ```typescript
    try {
        const result = rule.execute(workspace);
        if (result) insights.push(result);
    } catch (err) {
        console.warn(`Rule ${rule.id} failed execution:`, err);
    }
    ```
- File I/O: Try-catch with user-facing error dialogs via `alert()` fallback
  - Example in `src/components/layout/AppShell.tsx`:
    ```typescript
    try {
        const data = await loadWorkspaceFromFile(file);
        loadWorkspace(data);
    } catch (err) {
        console.error('Failed to load workspace', err);
        alert('Failed to load workspace file.');
    }
    ```
- Cloud API calls: Throw errors on failure with descriptive messages; caller handles
  - Example in `src/engine/cloud.ts`:
    ```typescript
    if (!apiKey) throw new Error('API Key is missing');
    throw new Error(errorData.error?.message || 'Gemini API call failed');
    ```
- ErrorBoundary: Class component at `src/components/ErrorBoundary.tsx` catches React render errors and displays fallback UI with error details

**Logging:**
- Debug logging: `console.log()` with prefixed context (e.g., `'[workspaceStore]'`, `'[validation]'`)
- Errors: `console.error()` for critical failures
- Warnings: `console.warn()` for non-fatal issues
- Example:
  ```typescript
  console.log('[workspaceStore] Running synthesis with tools:', Object.keys(nextTools));
  console.warn(`Tool with id ${tool.id} is already registered.`);
  ```

## Comments

**When to Comment:**
- Complex algorithmic logic (e.g., maturity calculations in synthesis rules)
- Non-obvious state transformations (e.g., localStorage serialization in workspace store)
- Edge cases and workarounds (e.g., "Only initialize fresh workspace if no data exists")
- Persona/test data purposes (e.g., "Persona: Alex Rivera — Burned Out COO")

**JSDoc/TSDoc:**
- Used minimally; TypeScript interfaces and exported functions have brief descriptions
- Example in `src/tools/ai-readiness/index.ts`:
  ```typescript
  export const aiReadinessDefinition: ToolDefinition = {
      id: 'ai-readiness',
      name: 'AI Readiness',
      description: 'Assess AI maturity across 6 dimensions',
      ...
  };
  ```
- Test helpers documented with JSDoc blocks explaining parameters and behavior

## Function Design

**Size:** Functions are typically 20-50 lines; complex ones (synthesis rules, form handlers) reach 60-80 lines without aggressive refactoring pressure

**Parameters:**
- Handlers and utilities take explicit parameters (e.g., `(toolId: string, data: any)`)
- React components receive props via interface (e.g., `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`)
- Store actions passed via Zustand set/get pattern: `(set, get) => ({ ... })`

**Return Values:**
- React components: JSX.Element or React.ReactNode
- Handlers: void (side effects)
- Utilities: Typed return (e.g., `string`, `ValidationResult`, `Insight[]`)
- Store actions: Updated state object via Zustand immutability pattern

## Module Design

**Exports:**
- Named exports for utilities and definitions (e.g., `export const cn = (...)`, `export const aiReadinessDefinition = {...}`)
- Default export only for main App component: `export default App`
- React components as named exports from tool index files

**Barrel Files:**
- Used sparingly; most tool directories have single component + index.ts
- Validation system uses barrel: `src/validation/index.ts` imports and registers all profiles
- Registry uses barrel: `src/registry/registry.ts` imports and registers all tools

**Type Exports:**
- Always use `import type` for TypeScript types (required by `verbatimModuleSyntax`)
- Example: `import type { ToolDefinition } from '../../registry/ToolRegistry'`
- Allows tree-shaking and prevents circular import issues

## React Patterns

**Functional Components:**
- All components are functional components with hooks
- Typed with `React.FC` or explicit return type
- Example from `src/components/ui/Button.tsx`:
  ```typescript
  export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
      ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
          return <button ref={ref} className={cn(...)} {...props} />;
      }
  );
  Button.displayName = 'Button';
  ```

**Hooks:**
- `useWorkspaceStore()` from Zustand for all state management
- `useRef()` for file inputs and imperative DOM access
- `useEffect()` for initialization and side effects

**ClassName Composition:**
- Use `cn()` utility (wraps `clsx` + `tailwind-merge`) for dynamic Tailwind classes
- Always pass component className as final argument to allow overrides
- Example: `cn('base-styles', { 'conditional-class': condition }, className)`

---

*Convention analysis: 2026-02-13*
