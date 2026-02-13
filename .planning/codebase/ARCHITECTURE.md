# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** Layered MPA (Multi-Page Application) with centralized state management and cross-tool synthesis

**Key Characteristics:**
- Single Zustand store as the single source of truth for all workspace data
- Reactive synthesis engine that runs on every tool data update
- Tool-agnostic registry system enabling dynamic routing and validation
- Separation of persisted (tools, metadata, provenance) and ephemeral (insights, validation results) state
- Cross-layer validation before data commit (Safe Mode pattern)

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/components/`, `src/tools/`
- Contains: React components (layout shells, tool UIs, dashboard), icons from lucide-react
- Depends on: Zustand store (via hooks), utilities (cn, fileSystem)
- Used by: Browser/DOM, AppShell router

**State Management Layer:**
- Purpose: Centralized workspace state persistence and synchronization
- Location: `src/store/workspaceStore.ts`
- Contains: Zustand store with persist middleware, store actions (updateToolData, stageWorkspace, commitWorkspace, loadWorkspace, resetWorkspace)
- Depends on: Synthesis engine (runSynthesis), validation system (validateWorkspace)
- Used by: All presentation components via useWorkspaceStore hook

**Synthesis Layer:**
- Purpose: Generate cross-tool insights by analyzing multi-tool data patterns
- Location: `src/engine/synthesis.ts`, `src/engine/rules-v2.ts`, `src/engine/derived-metrics.ts`, `src/engine/swot-keywords.ts`
- Contains: SynthesisRule registry, 8 v2 rules with complex cross-tool logic, derived metrics computation, keyword analysis
- Depends on: Store data structure (workspace.tools)
- Used by: Store's updateToolData action, onRehydrateStorage lifecycle

**Validation Layer:**
- Purpose: Enforce data integrity at import time using multi-level profiles
- Location: `src/validation/`
- Contains: L0-L3 validation profiles (profiles_p1.ts, profiles_p2.ts, profiles_p3.ts), validator.ts (applies profiles), types.ts (profile interface)
- Depends on: Tool registry (getTools) to iterate registered tools
- Used by: Store's stageWorkspace action, Safe Mode workflow

**Registry Layer:**
- Purpose: Maintain dynamic catalog of all tools and their metadata
- Location: `src/registry/ToolRegistry.ts`, `src/registry/registry.ts`
- Contains: ToolDefinition interface, registerTool/getTools/getTool functions, initialization that registers all 12 tools
- Depends on: Individual tool definitions (imported from src/tools/*/index.ts)
- Used by: App.tsx (dynamic routing), AppShell (sidebar nav), validator.ts (profile lookup)

**Tool Layer:**
- Purpose: Individual assessment tools with their data models
- Location: `src/tools/{tool-name}/`
- Contains: Tool component (*.tsx), ToolDefinition export (index.ts with validation profile reference)
- Depends on: Zustand store (read/write via updateToolData), utilities
- Used by: Presentation layer (rendered via routes), Synthesis engine (data reading)

**Report System Layer:**
- Purpose: Multi-format report generation and narrative composition
- Location: `src/report/`
- Contains: PDF generation (pdf/PdfGenerator.ts), charts (charts/), narratives (narrative/), individual report templates (individual/), quality checks (quality/)
- Depends on: jsPDF, html2canvas, workspace store (reading tool data)
- Used by: Report Center tool (`src/tools/report/`)

**Utilities Layer:**
- Purpose: Cross-cutting helper functions
- Location: `src/utils/`
- Contains: cn.ts (className merging), fileSystem.ts (save/load workspace files)
- Depends on: Third-party (clsx, tailwind-merge, browser File API)
- Used by: All presentation components, AppShell

## Data Flow

**User edits tool UI:**

1. User changes value in tool component (e.g., slider in Leadership DNA)
2. Component calls `updateToolData(toolId, data)` from store
3. Store merges data into `state.tools[toolId]`
4. Store updates `provenance[toolId]` with timestamp + LOGIC_VERSION
5. Store synchronously calls `runSynthesis(simulation)` with merged state
6. Synthesis engine evaluates all 8 rules against cross-tool data
7. Rules return Insight[] sorted by severity (high → medium → low)
8. Store updates `state.insights` with results
9. Zustand persist middleware saves {version, metadata, tools, provenance} to localStorage (ephemeral state excluded)
10. All components using `useWorkspaceStore` hooks re-render with new insights/tools/metadata

**Workspace load (Safe Mode workflow):**

1. User clicks "Load" button in AppShell topbar
2. File picker opens; user selects .vwcg file
3. `loadWorkspaceFromFile(file)` reads and parses JSON
4. Store calls `stageWorkspace(parsedData)`:
   - `validateWorkspace()` runs L0+L1+L2 checks (structural, metadata, per-tool profiles)
   - Sets `isSafeMode: true`, stores data in `previewData`, saves validation result
   - SafeModeBanner renders showing issues (if any)
5. User reviews validation results, clicks "Load" or "Cancel"
6. If "Load": `commitWorkspace()` applies repairs, merges previewData into live state, exits Safe Mode
7. On commit, `queueMicrotask()` defers insights recomputation for proper hydration

**Logic version upgrade:**

1. LOGIC_VERSION constant in `workspaceStore.ts` incremented (currently v1.1.0)
2. On workspace hydration, if loaded version < current LOGIC_VERSION, topbar shows upgrade banner
3. User clicks "Upgrade to {LOGIC_VERSION}"
4. `recomputeLogic()` action updates all provenance entries to new version, recomputes insights
5. Metadata.computed_under_logic_version updated

## State Management Details

**Persisted State (localStorage key: `vwcg-workspace`):**
```
{
  version: '1.0',
  metadata: {
    id: UUID,
    createdAt: ISO timestamp,
    lastModified: ISO timestamp,
    name: string,
    schema_version: 'v1',
    computed_under_logic_version: 'v1.1.0'
  },
  tools: {
    'tool-id': { ...tool data },
    ...
  },
  provenance: {
    'tool-id': { timestamp: ISO, logicVersion: 'v1.1.0' },
    ...
  }
}
```

**Ephemeral State (not persisted, cleared on page reload):**
- `isSafeMode: boolean` - Safe Mode workflow active
- `previewData: Partial<WorkspaceState> | null` - Staged workspace before commit
- `validationResults: ValidationResult | null` - Safe Mode validation output
- `insights: Insight[]` - Current synthesis results (recomputed on hydration)
- `lastExportTime: number` - Export cooldown timestamp (5 seconds between exports)

## Key Abstractions

**ToolDefinition:**
- Purpose: Metadata contract for each tool
- Examples: `src/tools/ai-readiness/index.ts`, `src/tools/leadership-dna/index.ts`, `src/tools/vision-canvas/index.ts`
- Pattern: Each tool exports a constant with id, name, description, path, icon, component, validationProfileId

**SynthesisRule:**
- Purpose: Encapsulate cross-tool logic with error isolation
- Examples: `visionExecutionMismatch`, `valuesRealityContradiction` in `src/engine/rules-v2.ts`
- Pattern: `{ id, name, description, execute(workspace) }` where execute returns `Insight | null`

**ValidationProfile:**
- Purpose: Per-tool data integrity checks
- Examples: Profiles in `src/validation/profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts`
- Pattern: `{ id, validate(toolData) }` returns `ValidationIssue[]`

**Insight:**
- Purpose: Cross-tool findings and recommendations
- Pattern: `{ id, type: ('risk'|'opportunity'|'conflict'|'strength'), severity: ('high'|'medium'|'low'), title, message, recommendation, relatedTools: string[] }`

## Entry Points

**main.tsx:**
- Location: `src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Initialize registry, validation, charts before mounting React app; creates DOM root

**App.tsx:**
- Location: `src/App.tsx`
- Triggers: React mounting
- Responsibilities: Set up BrowserRouter, check if workspace exists (metadata.id), call resetWorkspace if first load, render dynamic tool routes via App.tsx

**AppShell.tsx:**
- Location: `src/components/layout/AppShell.tsx`
- Triggers: App.tsx Route element (parent layout)
- Responsibilities: Render sidebar with tool navigation, topbar with Save/Load/Upgrade buttons, logic version banner, Safe Mode overlay, outlet for tool components

**DashboardTool.tsx:**
- Location: `src/tools/dashboard/DashboardTool.tsx`
- Triggers: "/" route
- Responsibilities: Show workspace overview, progress metrics, getting-started steps, synthesis insights, strategic health widget

## Error Handling

**Strategy:** Try-catch with graceful degradation; error boundaries for React component failures

**Patterns:**
- **Synthesis rules:** Wrapped in try-catch in `runSynthesis()` loop; failed rules log warning but don't crash
- **File I/O:** `loadWorkspaceFromFile()` rejects promise on parse error; caught in AppShell with alert dialog
- **Validation:** Structural errors halt validation (status: 'error'); tool-level issues collected but non-fatal
- **Store persistence:** `onRehydrateStorage()` catches hydration errors, removes corrupted localStorage, initializes fresh state
- **React:** `ErrorBoundary` component wraps app sections; displays error details in red panel for debugging

## Cross-Cutting Concerns

**Logging:** Console.log statements in synthesis, store initialization, rule execution; filterable by '[component]' prefix

**Validation:** Three layers (L0: structural, L1-L2: per-tool) with per-tool ValidationProfile registry; Safe Mode enforces validation before commit

**Authentication:** None (SPA, no backend auth required; workspace tied to localStorage/file system)

**Persistence:** Zustand persist middleware with partialize to exclude ephemeral state; export/import via .vwcg JSON files with 5-second cooldown

**Logic Versioning:** LOGIC_VERSION constant tracks synthesis/validation contract; provenance tracks when each tool was last computed; upgrade banner prompts recomputation

---

*Architecture analysis: 2026-02-13*
