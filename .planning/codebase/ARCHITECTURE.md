# Architecture

**Analysis Date:** 2026-02-14

## Pattern Overview

**Overall:** Modular Plugin + Store + Synthesis Engine Pattern

VWCGApp follows a **registry-based tool plugin architecture** with a centralized state store and cross-tool synthesis engine. Each of the 12 tools (AI Readiness, Leadership DNA, Emotional Intelligence, Vision Canvas, SWOT, SOP Taxonomy/Creation/Management, 90-Day Roadmap, Advisor Readiness, Report Center, Business Context, Dashboard, Authority Tracker) operates independently while contributing data to a unified workspace store. Cross-tool synthesis rules compute insights from multi-tool data patterns.

**Key Characteristics:**
- **Decoupled tools:** Each tool in `src/tools/` manages its own UI and data schema independently
- **Centralized state:** Single Zustand store (`src/store/workspaceStore.ts`) persists all tool data to localStorage
- **Reactive synthesis:** Every tool data update triggers cross-tool rule evaluation synchronously
- **Safe Mode imports:** Protected workspace loading with validation before committing to state
- **Type-safe cross-tool:** Synthesis rules access `workspace.tools[toolId]` with full TypeScript support

## Layers

**Tool Layer:**
- Purpose: User-facing assessment interfaces and form logic
- Location: `src/tools/`
- Contains: React components, tool-specific UI, data input handlers, local form state
- Depends on: Workspace store (read/write via `useWorkspaceStore`), validation profiles
- Used by: App router (dynamic route generation), Report Center (aggregates tool data)

**Registry & Routing Layer:**
- Purpose: Tool discovery, registration, and dynamic route generation
- Location: `src/registry/ToolRegistry.ts` (interface), `src/registry/registry.ts` (registration)
- Contains: `ToolDefinition` interface (id, name, description, path, icon, component, validationProfileId), global `registerTool()` and `getTools()` functions
- Depends on: lucide-react for icons, imported tool definitions from `src/tools/`
- Used by: `App.tsx` (generates routes), `AppShell.tsx` (renders sidebar nav)

**Workspace Store Layer:**
- Purpose: Unified state management and persistence
- Location: `src/store/workspaceStore.ts`
- Contains: Zustand store with persisted core state (metadata, tools, provenance) + ephemeral state (isSafeMode, validationResults, insights); actions: `updateToolData()`, `stageWorkspace()`, `commitWorkspace()`, `loadWorkspace()`, `resetWorkspace()`, `recomputeLogic()`
- Depends on: Synthesis engine (`runSynthesis()`), validator (`validateWorkspace()`)
- Used by: Every tool component (via `useWorkspaceStore()` hook), AppShell, validation system

**Synthesis Engine Layer:**
- Purpose: Cross-tool insight generation and conflict detection
- Location: `src/engine/` (synthesis.ts, rules-v2.ts, derived-metrics.ts, swot-keywords.ts, types.ts)
- Contains: 8 advanced synthesis rules (v2), derived metrics computation, SWOT keyword scanner; `Insight` type (id, type, severity, title, message, recommendation, relatedTools)
- Depends on: Tool data from workspace simulation, helper modules (derived-metrics, swot-keywords)
- Used by: Workspace store on every `updateToolData()` call, Dashboard widget

**Validation Layer:**
- Purpose: Data integrity enforcement for workspace imports
- Location: `src/validation/` (types.ts, index.ts, profiles_p1.ts, profiles_p2.ts, profiles_p3.ts, validator.ts)
- Contains: Per-tool validation profiles (L0-L3), rule-based validation, `ValidationResult` type (status, issues array)
- Depends on: Tool definitions (validation profiles registered per tool)
- Used by: Workspace store's `stageWorkspace()`, Safe Mode banner

**Report Layer:**
- Purpose: Multi-page narrative and visual report generation
- Location: `src/report/` (6 subdirectories: charts, components, narrative, unified, individual, pdf, quality)
- Contains: Report pages per tool (AIReadinessReport.tsx, LeadershipDNAReport.tsx, etc.), unified strategic briefing, narrative generation templates, PDF export service, quality detectors (VagueEntryDetector.ts, EdgeCaseDetector.ts)
- Depends on: Chart.js/D3 for visualizations, Workspace store for tool data, jsPDF + html2canvas for PDF generation
- Used by: Report Center tool (`src/tools/report/ReportCenter.tsx`), E2E tests

**UI Component Layer:**
- Purpose: Reusable design system and shared UI primitives
- Location: `src/components/` (layout, ui, dashboard subfolders)
- Contains: Button, ExportButton, AppShell (sidebar + topbar + outlet), SafeModeBanner, ErrorBoundary, StrategicHealthWidget (dashboard), ReportTypography, ReportPage
- Depends on: Tailwind CSS, Lucide React icons, React Router, Zustand store
- Used by: Tool components, Report layer, App routing

**Utilities Layer:**
- Purpose: Cross-cutting helper functions
- Location: `src/utils/` (cn.ts for class merging, fileSystem.ts for workspace I/O), `src/lib/` (charts.ts for Chart.js registration)
- Contains: `cn()` function (clsx + tailwind-merge), workspace file I/O (`saveWorkspaceToFile()`, `loadWorkspaceFromFile()`), chart registration
- Depends on: clsx, tailwind-merge, Chart.js
- Used by: Throughout codebase for styling, workspace persistence, chart initialization

## Data Flow

**Standard Tool Edit Flow:**

1. User edits a tool UI (e.g., adds SWOT item, updates leadership score)
2. Tool component calls `updateToolData(toolId, newData)` from Zustand store
3. Store action merges new data into `state.tools[toolId]`
4. **Synchronously:** Store runs `runSynthesis({ ...state, tools: nextTools })` with the new tool data
5. `runSynthesis()` executes all 8 rules from `rulesV2` array, collecting non-null `Insight` results
6. Insights sorted by severity (high → low) and stored in `state.insights`
7. Metadata updated with `lastModified` timestamp and tool's provenance record updated with current `LOGIC_VERSION`
8. **Persist middleware** saves `{version, metadata, tools, provenance}` to localStorage under key `vwcg-workspace`
9. Components re-render (insights widget updates, synthesis results visible on Dashboard)

**Workspace Load/Import Flow:**

1. User clicks Load button in AppShell, selects a `.vwcg` JSON file
2. `loadWorkspaceFromFile(file)` reads file and parses JSON
3. Calls `stageWorkspace(data)` action — enters Safe Mode
   - Calls `validateWorkspace(data)` (checks L0-L3 rules)
   - Sets `isSafeMode: true`, `previewData: data`, `validationResults: result`
4. SafeModeBanner displays validation issues; user reviews or dismisses
5. On user confirm: `commitWorkspace()` action executes
   - Merges previewData into state (tool by tool or all)
   - Re-runs synthesis for the merged state
   - Sets `isSafeMode: false`
6. Workspace persisted to localStorage

**Report Generation Flow:**

1. User navigates to Report Center tool
2. ReportCenter component reads `workspace.tools` via `useWorkspaceStore()`
3. Selects which tools to include in report
4. Renders individual report pages (AIReadinessReport, VisionCanvasReport, etc.) and unified briefing
5. Each report component reads tool data and renders charts + narrative content
6. User clicks "Export to PDF"
7. PdfGenerator.ts captures the rendered HTML at 2x scale, paginates to A4, exports via jsPDF

**Dashboard Insights Flow:**

1. Dashboard component reads `state.insights` from store
2. Groups insights by severity/type, displays in StrategicHealthWidget
3. Each insight links to related tools (via `relatedTools` array in Insight type)
4. Click on insight navigates to relevant tool

**State Management:**

- **Persisted state** (localStorage): version, metadata, tools, provenance
- **Ephemeral state** (memory only): isSafeMode, previewData, validationResults, insights, lastExportTime
- **Rehydration:** On app load, persist middleware restores persisted state from localStorage and updates metadata's `computed_under_logic_version` from store initialization
- **Logic version upgrade:** When LOGIC_VERSION constant changes, AppShell shows upgrade banner; user clicks "Upgrade Logic" to call `recomputeLogic()`, which updates all provenance records to new version

## Key Abstractions

**ToolDefinition:**
- Purpose: Describes a tool for registration and routing
- Examples: `aiReadinessDefinition` in `src/tools/ai-readiness/index.ts`, `swotDefinition` in `src/tools/swot/index.ts`
- Pattern: Export a `ToolDefinition` from each tool's `index.ts`; tool imports its component and lucide icon; registry collects these at startup via `initializeRegistry()`

**Insight:**
- Purpose: Represents a cross-tool finding or conflict
- Examples: Vision-Execution Mismatch (V2_vision_execution_mismatch), Values-Reality Contradiction (V2_values_reality_contradiction)
- Pattern: Synthesis rules return `Insight | null`; store collects and sorts by severity

**ValidationProfile:**
- Purpose: Encodes per-tool data validation rules
- Examples: `aiReadinessProfile`, `swotProfile`, `roadmapProfile`
- Pattern: Each profile has `id` (e.g., 'swot_v1') and `validate(data)` function returning `ValidationIssue[]`; profiles registered at startup via `initializeValidation()`

**SynthesisRule:**
- Purpose: Cross-tool logic executed on every data update
- Examples: `visionExecutionMismatch` (vision pillars + leadership execution score), `technologyAmbitionGap` (vision mentions AI + AI Readiness <40%)
- Pattern: Each rule has `id`, `name`, `description`, and `execute(workspace)` function; returns `Insight | null`; rules can access multiple tools from workspace snapshot

**Report Type Abstractions:**
- **ReportPage:** Wrapper for A4-sized PDF page rendering
- **ReportTypography:** Standardized fonts and spacing for narratives
- **ChartComponent:** Gauge, HorizontalBar, DotPlot — render chart visualizations in reports

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Script load in `index.html`
- Responsibilities: Initializes registry, validation, charts; renders React app to DOM root

**Startup Sequence:**
- `initializeRegistry()` → registers all 12 tools
- `initializeValidation()` → registers validation profiles (called but commented in current code)
- `registerCharts()` → initializes Chart.js with custom plugins
- React render → mounts `App` component

**App Component:**
- Location: `src/App.tsx`
- Triggers: React root render
- Responsibilities:
  - Checks if `metadata.id` exists; if not, calls `resetWorkspace()` to initialize
  - Sets up React Router with `BrowserRouter`
  - Generates tool routes dynamically from `getTools()`
  - Wraps routes with `AppShell` layout

**AppShell Layout:**
- Location: `src/components/layout/AppShell.tsx`
- Triggers: Every route
- Responsibilities:
  - Renders sidebar nav (Dashboard + all tools from registry)
  - Renders topbar (workspace name, Save/Load buttons, logic version banner)
  - Renders `<Outlet/>` for nested routes
  - Handles workspace file I/O

**Tool Components:**
- Location: `src/tools/<tool-id>/<ToolComponent>.tsx`
- Triggers: Navigation to `/tools/<tool-id>`
- Responsibilities:
  - Read tool data from `useWorkspaceStore(state => state.tools[toolId])`
  - Render form UI
  - Call `updateToolData(toolId, newData)` on user changes

## Error Handling

**Strategy:** Three-layer approach with fallbacks

**Layer 1 — Error Boundary:**
- Location: `src/components/ErrorBoundary.tsx`
- Coverage: Wraps entire app (implicit in React 19 StrictMode)
- Catches: Uncaught component render errors
- Response: Displays red error box with error text in details collapsible

**Layer 2 — Synthesis Rule Fail-Safe:**
- Location: `src/engine/synthesis.ts` in `runSynthesis()`
- Coverage: Each rule in try-catch block
- Catches: Rule execution errors
- Response: Logs warning with rule ID and error; continues with other rules

**Layer 3 — Workspace Validation:**
- Location: `src/validation/validator.ts` and individual profiles
- Coverage: Pre-commit validation during Safe Mode
- Catches: Invalid/incomplete tool data
- Response: Returns `ValidationResult` with issues array; SafeModeBanner displays; user can ignore or fix

**Pattern:**
- No global error handlers for async operations (synthesis is synchronous)
- File I/O errors in `fileSystem.ts` wrapped in try-catch; alert user on failure
- Synthesis rules all check for tool data existence before accessing (return `null` if tool missing)

## Cross-Cutting Concerns

**Logging:** Console-based only
- Synthesis: `console.log('[workspaceStore] Running synthesis...')` on every update
- Rules: `console.warn('Rule {id} failed execution...')` on rule exceptions
- No structured logging service

**Validation:** Two-stage approach
- **L0-L1:** Type and required field checks (run on import in Safe Mode)
- **L2-L3:** Domain-specific rules (optional, registered per tool)
- Profiles split across `profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts` for organization

**Authentication:** Not implemented
- App is fully public; no user identity tracking
- Firebase deployment allows unauthenticated access

**Persistence:** Zustand with localStorage
- Key: `vwcg-workspace`
- Persisted fields: `version`, `metadata`, `tools`, `provenance` (via `partialize` in persist config)
- Rehydration: Automatic on app load; insights recomputed via `queueMicrotask` in `onRehydrateStorage`

**Styling:** Tailwind CSS + utility components
- Global utility: `cn()` function for class composition (clsx + tailwind-merge)
- Reusable Button component with variants (primary, secondary, outline, ghost, destruct) and sizes (sm, md, lg)
- Color palette: slate (grays), emerald (success), rose (danger), blue (info), amber (warning)

---

*Architecture analysis: 2026-02-14*
