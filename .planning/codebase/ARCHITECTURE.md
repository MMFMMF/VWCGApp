# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** React SPA with centralized state management, dynamic tool registry, and cross-tool synthesis engine.

**Key Characteristics:**
- Single Zustand store (`workspaceStore.ts`) persists all workspace data to localStorage
- Tool Registry pattern for dynamic route + navigation generation
- Synthesis Engine that runs cross-tool rules on every state update
- Safe Mode validation workflow for workspace imports
- Modular tool architecture with per-tool validation profiles
- Optional AI consultation via Gemini API for strategic insights

## Layers

**Presentation Layer:**
- Purpose: React components for UI rendering and user interaction
- Location: `src/components/`, `src/tools/*/` (component files)
- Contains: Layout shell, tool components, dashboard, UI primitives
- Depends on: Workspace Store (read data, dispatch actions), React Router for navigation
- Used by: Browser/user interaction

**State Management Layer:**
- Purpose: Central workspace state persistence and synchronization
- Location: `src/store/workspaceStore.ts`
- Contains: Zustand store with persist middleware, workspace metadata, tool data, provenance tracking, ephemeral state (Safe Mode, validation results, insights)
- Depends on: Synthesis Engine (runs on every update), Validation system (runs during import)
- Used by: All components via `useWorkspaceStore()` hook

**Synthesis Layer:**
- Purpose: Cross-tool rule execution to generate strategic insights
- Location: `src/engine/` (synthesis.ts, rules.ts, types.ts, cloud.ts)
- Contains: Registered synthesis rules (E1-E5), insight generation, optional AI consultation
- Depends on: Workspace Store data (reads tool data), optional Gemini API
- Used by: Workspace Store on every `updateToolData()` call

**Registry Layer:**
- Purpose: Tool definition and dynamic registration
- Location: `src/registry/` (ToolRegistry.ts, registry.ts)
- Contains: Tool definitions with metadata (id, name, path, icon, component, validationProfileId)
- Depends on: Tool definitions from `src/tools/*/index.ts`
- Used by: App.tsx (route generation), AppShell (sidebar navigation), Validation system (per-tool profiles)

**Validation Layer:**
- Purpose: Multi-level workspace validation (structural, per-tool, cross-tool)
- Location: `src/validation/` (types.ts, index.ts, validator.ts, profiles_p*.ts)
- Contains: Validation profiles per tool, validator orchestrator, issue tracking
- Depends on: Tool Registry (lookup registered tools), per-tool profile definitions
- Used by: Safe Mode workflow (stageWorkspace → commitWorkspace)

**Tool Layer:**
- Purpose: Individual assessment tools with domain logic
- Location: `src/tools/{tool-name}/`
- Contains: Tool component (React), tool definition (ToolDefinition), optional validation profile
- Depends on: Workspace Store (read/write tool data), optional UI components
- Used by: Router (renders on path match), Dashboard (tool listing)

**Infrastructure:**
- Purpose: Charts, utilities, file I/O
- Location: `src/lib/charts.ts`, `src/utils/`, `src/components/ui/`
- Contains: Chart.js registration, className utilities (clsx + tailwind-merge), file system (save/load .vwcg files)
- Depends on: External libraries (chart.js, lucide-react)
- Used by: Tool components, AppShell

## Data Flow

**Editing a Tool:**

1. User edits form in tool component (e.g., `LeadershipDnaTool.tsx`)
2. Component calls `updateToolData(toolId, data)`
3. Zustand store merges data into `state.tools[toolId]`
4. Provenance tracking updates with timestamp + `LOGIC_VERSION`
5. `runSynthesis()` executes all registered rules synchronously
6. New insights replace `state.insights`
7. Persist middleware saves `{version, metadata, tools, provenance}` to localStorage under key `vwcg-workspace`
8. Component re-renders with new data from store subscription

**Importing a Workspace:**

1. User clicks "Load" button → file input dialog
2. `loadWorkspaceFromFile(file)` reads and parses `.vwcg` JSON
3. Calls `loadWorkspace(data)` action
4. `stageWorkspace(data)` runs and:
   - Validates structure (L0: JSON, metadata, tools keys)
   - Validates each tool via registered profiles (L1/L2)
   - Stores validation result
   - Sets `isSafeMode: true` and `previewData: data`
5. `SafeModeBanner` renders full-screen modal with issues
6. User reviews and clicks "Load Workspace" (or "Load with Repair")
7. `commitWorkspace()` applies data, recomputes insights, exits Safe Mode
8. On rehydration from localStorage, `queueMicrotask` recomputes insights

**State Management:**

- **Persisted:** `version`, `metadata` (id, createdAt, lastModified, name, schema_version, computed_under_logic_version), `tools` (all tool data), `provenance` (per-tool: timestamp, logicVersion)
- **Ephemeral:** `isSafeMode` (boolean), `previewData` (workspace preview), `validationResults` (validation issues), `insights` (synthesis results), `lastExportTime` (cooldown timestamp)

## Key Abstractions

**ToolDefinition Interface:**
- Purpose: Declares a tool's metadata and component
- Location: `src/registry/ToolRegistry.ts`
- Example: `aiReadinessDefinition` in `src/tools/ai-readiness/index.ts`
- Pattern: Each tool directory has `index.ts` exporting a `ToolDefinition` that gets registered in `src/registry/registry.ts`

**Insight Object:**
- Purpose: Represents a synthesis rule output
- Location: `src/engine/types.ts`
- Fields: id, type (risk|opportunity|conflict|strength), severity (high|medium|low), title, message, recommendation, relatedTools
- Usage: Synthesis rules return `Insight | null`, stored in `state.insights`, displayed on Dashboard

**SynthesisRule Interface:**
- Purpose: Defines a cross-tool analysis rule
- Location: `src/engine/types.ts`, implementation in `src/engine/rules.ts`
- Pattern: Each rule has `id`, `name`, `description`, `execute(workspace) → Insight | null`
- Examples: `executionGapRule` (Leadership DNA + Vision Canvas), `unmitigatedThreatRule` (SWOT + Roadmap)

**ValidationProfile Interface:**
- Purpose: Per-tool validation schema
- Location: `src/validation/types.ts`
- Pattern: Each tool can optionally register a profile via `validationProfileId` in ToolDefinition
- Registration: Profiles in `profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts` are registered at startup in `initializeValidation()`
- Usage: Validator looks up profile by `toolDef.validationProfileId` and calls `profile.validate(toolData)`

**WorkspaceState:**
- Purpose: Complete workspace shape
- Location: `src/store/workspaceStore.ts`
- Root keys: `version`, `metadata`, `tools`, `provenance`, `isSafeMode`, `previewData`, `validationResults`, `insights`, `lastExportTime`
- Exported via `exportState()` as canonical JSON (sorted keys) with 5-second cooldown

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Initializes tool registry, validation system, charts library, then renders App

**App Initialization:**
- Location: `src/App.tsx`
- Triggers: React root render
- Responsibilities: Checks if `metadata.id` exists; if not, calls `resetWorkspace()` to generate new UUID. Sets up React Router with dynamic tool routes from `getTools()`

**Layout Shell:**
- Location: `src/components/layout/AppShell.tsx`
- Triggers: Every route render
- Responsibilities: Renders sidebar (nav to dashboard + all tools), topbar (workspace name, save/load/upgrade buttons), main content area with Outlet. Also renders SafeModeBanner overlay when in Safe Mode.

**Dashboard:**
- Location: `src/tools/dashboard/DashboardTool.tsx`
- Triggers: Route `/` (home)
- Responsibilities: Shows workspace progress, tool completion status, strategic health widget, insights list, quick-start buttons to tools

## Error Handling

**Strategy:** Try-catch in async operations, console warnings for failed synthesis rules, validation issues tracked and displayed in Safe Mode banner.

**Patterns:**
- Synthesis rules wrapped in try-catch with warning log; bad rule doesn't crash app
- File I/O errors caught and displayed via alert()
- Validation errors accumulated and reported in Safe Mode banner
- Invalid workspace structure detected at L0 validation before per-tool validation

## Cross-Cutting Concerns

**Logging:** `console.log()` and `console.warn()` used throughout; key checkpoints in main.tsx (registry/validation/charts init), workspaceStore (synthesis execution), synthesis.ts (rule execution), cloud.ts (API calls)

**Validation:** L0 (structural), L1/L2 (per-tool via registered profiles), applied during workspace import via `stageWorkspace()`. Safe Mode prevents apply until issues resolved.

**Authentication:** None; app is client-side only. Optional Gemini API key via environment variable `VITE_GEMINI_API_KEY` enables AI Consultation (consultAi() in `src/engine/cloud.ts`).

**Provenance:** Every tool update records `{ timestamp: ISO, logicVersion: 'vX.Y.Z' }` in `state.provenance[toolId]`. When `LOGIC_VERSION` in store changes, topbar shows "Logic Outdated" banner with "Upgrade" button that calls `recomputeLogic()` to bump all provenances to current version.

---

*Architecture analysis: 2026-02-13*
