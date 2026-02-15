# Architecture

**Analysis Date:** 2025-02-15

## Pattern Overview

**Overall:** Modular, tool-registry-based SPA with decoupled synthesis engine and persistent state management.

**Key Characteristics:**
- **Tool Registry Pattern** — All 12 business assessment tools are dynamically registered and routed from a central registry
- **Zustand + Persist** — Single global workspace store with automatic localStorage persistence and provenance tracking
- **Synthesis Engine** — Cross-tool rule execution layer that computes `Insight[]` on every data update, driving insights and recommendations
- **Report Layer** — Comprehensive reporting system with per-tool + unified report generation, narrative templates, and PDF export
- **Safe Mode Workflow** — Protected workspace import/export with integrated validation before data commit

## Layers

**Entry Point & Initialization:**
- Purpose: Bootstrap the application, register tools, and initialize systems
- Location: `src/main.tsx`
- Contains: Zustand store subscription setup, registry initialization, validation initialization, chart library registration
- Depends on: Nothing (startup layer)
- Used by: React root render

**Registry & Routing:**
- Purpose: Manage tool definitions, dynamic route generation, and tool lookup
- Location: `src/registry/ToolRegistry.ts`, `src/registry/registry.ts`
- Contains: `ToolDefinition` interface, `registerTool()`, `getTools()`, `getTool()` functions; imports all 12 tool definitions
- Depends on: Individual tool exports (e.g., `src/tools/ai-readiness/index.ts`)
- Used by: `App.tsx` (route generation), `AppShell.tsx` (sidebar navigation)

**Application Shell:**
- Purpose: Main layout container with sidebar navigation, topbar controls, and content routing
- Location: `src/components/layout/AppShell.tsx`
- Contains: Sidebar with tool nav, topbar with save/load/version controls, `<Outlet/>` for routed content
- Depends on: `getTools()`, workspace store, file system utilities, `SafeModeBanner`
- Used by: `App.tsx` as route wrapper

**Router & App Component:**
- Purpose: React Router setup, workspace initialization, print route separation
- Location: `src/App.tsx`
- Contains: `BrowserRouter` with two route groups: print routes (no AppShell) and app routes (with AppShell); workspace reset on first load
- Depends on: React Router, workspace store, all route components
- Used by: React root

**Workspace Store (State Management):**
- Purpose: Single source of truth for all tool data, provenance, validation state, and insights
- Location: `src/store/workspaceStore.ts`
- Contains: Zustand store with `persist` middleware; state = versioning + metadata + tools + provenance + ephemeral data
- Depends on: `runSynthesis()`, `validateWorkspace()`, file system utilities
- Used by: Every component and tool that reads/writes workspace data
- **Key Actions:**
  - `updateToolData(toolId, data)` → merges tool data, runs synthesis, updates provenance
  - `stageWorkspace(data)` → enters Safe Mode, validates, previews
  - `commitWorkspace(selectedToolIds)` → applies staged changes, exits Safe Mode
  - `exportState()` → returns JSON for file download (canonical ordering, 5s cooldown)

**Synthesis Engine (Rules & Insights):**
- Purpose: Execute cross-tool rules on every workspace change to generate insights and recommendations
- Location: `src/engine/synthesis.ts`, `src/engine/rules-v2.ts`, `src/engine/derived-metrics.ts`, `src/engine/swot-keywords.ts`
- Contains: Rule registry, rule executor, 8 v2 rules, derived metrics (6), SWOT keyword analyzer
- Depends on: Workspace state (read-only)
- Used by: Store's `updateToolData()` to compute insights synchronously
- **Output:** `Insight[]` sorted by severity (high → low), containing `{ type, severity, title, message, recommendation, relatedTools }`
- **Old Rules:** `src/engine/rules.ts` (E1-E5) still exists but is **not imported by synthesis.ts** — kept for historical reference only

**Validation System:**
- Purpose: Multi-level validation (L0-L3) of workspace data before Safe Mode commit
- Location: `src/validation/index.ts`, `src/validation/validator.ts`, `src/validation/profiles_p*.ts`
- Contains: Validator runner, 3 profile groups split across files, per-tool validation rules
- Depends on: Tool data structure types
- Used by: Store's `stageWorkspace()` to validate imports, `initializeValidation()` registers profiles at startup
- **Trigger:** Import workflow via Safe Mode

**Tool Components (Leaf Nodes):**
- Purpose: User interface for individual assessment tools
- Location: `src/tools/{tool-id}/{ToolComponent}.tsx`
- Contains: Form inputs, data visualization, tool-specific UI logic
- Depends on: Workspace store (read tool data, dispatch updates), validation
- Used by: Router (dynamically via registry)
- **Pattern:** Each tool exports `index.ts` with `ToolDefinition` (id, name, description, path, icon, component, optional validationProfileId)

**Report System (Individual Reports):**
- Purpose: Generate per-tool assessment reports with branded formatting and charts
- Location: `src/report/individual/{Tool}Report.tsx`
- Contains: Report components for AI Readiness, Leadership DNA, SWOT, Vision Canvas, Roadmap, Advisor Readiness
- Depends on: Tool data from store, chart components, narrative templates
- Used by: Report Center tool, unified briefings, PDF generation

**Report System (Unified Reports):**
- Purpose: Cross-tool executive summaries and strategic briefings
- Location: `src/report/unified/UnifiedStrategicBriefing.tsx`, `src/report/unified/LLMStrategicBriefing.tsx`
- Contains: Integrated narrative synthesis, cross-tool insights, custom AI-generated briefing option
- Depends on: All tool data, narrative generator, optional Gemini API
- Used by: Report Center, PDF generation

**Report Narrative Generation:**
- Purpose: Template-driven text generation with voice/tone customization
- Location: `src/report/narrative/generator.ts`, `src/report/narrative/templates.ts`, `src/report/narrative/voice.ts`
- Contains: Text templates for each section, voice profiles (professional/conversational/strategic), keyword interpolation
- Depends on: SWOT keyword analysis, tool data
- Used by: Report components for dynamic section text

**Report Charts & Visualization:**
- Purpose: Reusable chart components for reports (bars, dots, gauges, progress)
- Location: `src/report/charts/{ChartType}.tsx`
- Contains: HorizontalBar, DotPlot, Gauge, ProgressBar components using Chart.js and React
- Depends on: React, Chart.js
- Used by: Report components

**Report Quality Assurance:**
- Purpose: Detect vague entries and edge cases in report content
- Location: `src/report/quality/{Detector}.ts`
- Contains: VagueEntryDetector, EdgeCaseDetector for content validation
- Depends on: Tool data, keyword analysis
- Used by: Report components to flag content quality issues

**PDF Generation:**
- Purpose: Export reports as high-quality PDFs (300 DPI, 3x capture scale, SVG-aware)
- Location: `src/report/pdf/PdfGenerator.ts`, `src/report/pdf/PrintPdfService.ts`
- Contains: PdfGenerator (html2canvas + jsPDF), PrintPdfService (browser print dialog)
- Depends on: html2canvas, jsPDF, report components
- Used by: Report Center, print routes

**Print Routes (No AppShell):**
- Purpose: Clean HTML rendering for PDF capture without UI chrome
- Location: `src/components/print/PrintReport.tsx`
- Contains: Route-specific report rendering (no sidebar/topbar)
- Depends on: Report components, router params
- Used by: Route `/report/print/:reportType`

**Utility Layers:**
- **File System** (`src/utils/fileSystem.ts`): Save/load workspace files (.vwcg JSON format)
- **ClassNames** (`src/utils/cn.ts`): Compose Tailwind classes with clsx + tailwind-merge
- **Charts** (`src/lib/charts.ts`): Initialize Chart.js plugins and defaults

## Data Flow

**User edits tool UI:**

1. User fills form in tool component (e.g., AiReadinessTool)
2. Component calls `updateToolData(toolId, newData)` from store
3. Store action:
   - Merges new data into `state.tools[toolId]`
   - Updates `state.provenance[toolId]` with timestamp + LOGIC_VERSION
   - Calls `runSynthesis(simulated_state)` **synchronously**
   - Synthesis executes all v2 rules, returns sorted `Insight[]`
   - Returns updated state with `insights` field
4. Zustand `persist` middleware saves **only** version + metadata + tools + provenance to localStorage (not ephemeral data)
5. React re-renders all subscribed components with new state

**Safe Mode Import Workflow:**

1. User clicks Load → file picker
2. AppShell reads file → calls `stageWorkspace(fileData)`
3. Store action:
   - Calls `validateWorkspace(data)` → `ValidationResult`
   - Sets `isSafeMode: true`, `previewData: data`, `validationResults: result`
4. SafeModeBanner renders overlay with validation errors/warnings
5. User reviews and clicks Commit or Cancel
6. Commit → `commitWorkspace()` → merges previewData into state, runs synthesis, exits Safe Mode

**Synthesis Rules Execute:**

1. Trigger: Every `updateToolData()` call or `loadWorkspace()` commit
2. Input: Full workspace snapshot (read-only)
3. Each rule in `rulesV2`:
   - Reads tool data (vision-canvas, leadership-dna, swot, etc.)
   - May call `computeDerivedMetrics()` or `scanSwotText()`
   - Returns `Insight | null`
4. All non-null insights collected, sorted by severity
5. Result stored in `state.insights`

**Report Generation & PDF Export:**

1. Report Center tool renders selected report type
2. Subscribed to workspace store, reads all tool data
3. Report component composes individual report sections + unified briefing
4. On export:
   - Route to `/report/print/:reportType` (no AppShell)
   - Browser/Puppeteer captures HTML at 3x scale
   - html2canvas + jsPDF converts to PDF
   - Branded filename (clientName + reportType + date)
   - Download triggered

## State Management

**Persisted State:**
- `version` (string)
- `metadata` (WorkspaceMetadata: id, createdAt, lastModified, name, schema_version, computed_under_logic_version)
- `tools` (Record<toolId, toolData>) — All tool inputs and outputs
- `provenance` (Record<toolId, { timestamp, logicVersion }>) — Track when data was last computed

**Ephemeral State (Not Persisted):**
- `insights` (Insight[]) — Recomputed on load from rules
- `validationResults` (ValidationResult | null) — Safe Mode only
- `isSafeMode` (boolean) — Overlay control
- `previewData` (Partial<WorkspaceState> | null) — Safe Mode staging
- `lastExportTime` (number) — 5s export cooldown

**On Rehydration from localStorage:**
- Zustand `onRehydrateStorage` hook uses `queueMicrotask` to recompute insights via `runSynthesis()`
- Insights regenerated from stored tool data without running validation

## Key Abstractions

**ToolDefinition Interface:**
- Purpose: Contract for tool registration
- Location: `src/registry/ToolRegistry.ts`
- Fields: `id` (kebab-case), `name`, `description`, `path`, `icon` (LucideIcon), `component` (React.ComponentType), `validationProfileId?` (optional)
- Pattern: Each tool exports an instance conforming to this interface from its `index.ts`

**Insight Type:**
- Purpose: Represent a cross-tool finding or recommendation
- Location: `src/engine/types.ts`
- Fields: `id`, `type` (risk|opportunity|conflict|strength), `severity` (high|medium|low), `title`, `message`, `recommendation`, `relatedTools` (array of tool IDs)
- Usage: Synthesized on every workspace change, displayed in reports and dashboards

**SynthesisRule Interface:**
- Purpose: Define a rule that executes against workspace state
- Location: `src/engine/types.ts`
- Fields: `id`, `name`, `description`, `execute(workspace) → Insight | null`
- Registry: Array in `src/engine/rules-v2.ts` (now v2 only)

**ReportType:**
- Purpose: Enumerate report types for PDF generation
- Location: `src/report/pdf/PdfGenerator.ts`
- Values: 'strategic-briefing', 'advisor-readiness', 'ai-readiness', 'leadership-dna', 'swot', 'vision-canvas', 'roadmap'

**DerivedMetrics:**
- Purpose: Computed across-tool metrics (leadership archetype, revenue risk, coherence)
- Location: `src/engine/derived-metrics.ts`
- Exported: `computeDerivedMetrics(workspace) → DerivedMetrics`
- Usage: Input to synthesis rules and reports

## Entry Points

**Application Entry (`src/main.tsx`):**
- Triggers: Browser load
- Responsibilities:
  1. Initialize registry via `initializeRegistry()`
  2. Initialize validation via `initializeValidation()`
  3. Register Chart.js plugins
  4. Create React root and render `App` component

**App Component (`src/App.tsx`):**
- Triggers: React init
- Responsibilities:
  1. Check if workspace.metadata.id exists; if not, call `resetWorkspace()` to initialize fresh state
  2. Set up `BrowserRouter`
  3. Define print routes (no AppShell) and app routes (with AppShell)
  4. Dynamically generate tool routes from `getTools()`

**Report Print Route (`src/components/print/PrintReport.tsx`):**
- Triggers: Navigation to `/report/print/:reportType`
- Responsibilities:
  1. Read `reportType` from URL params
  2. Render appropriate report component without AppShell
  3. Optimized for PDF capture (no interactive elements)

## Error Handling

**Strategy:** Error Boundary + console logging + graceful degradation.

**Patterns:**
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`): Class component catching render errors; displays error details in red box
- **Synthesis Rule Errors**: Wrapped in try-catch in `runSynthesis()`; failed rule logged, continues with other rules
- **Validation Errors**: Returned in `ValidationResult` object; does not throw; displayed in Safe Mode banner
- **File I/O**: Promise-based with try-catch; errors shown in alert dialogs
- **PDF Generation**: Handled by PdfGenerator/PrintPdfService; failures logged

## Cross-Cutting Concerns

**Logging:**
- Console logging for development (store updates, synthesis execution, rule failures)
- No external logging service configured; Firebase Hosting for deployment

**Validation:**
- Multi-level (L0-L3) integrated into Safe Mode workflow
- Profiles registered at startup; lazily applied during import
- Per-tool validation rules in `src/validation/profiles_p*.ts`

**Authentication:**
- Not implemented; app is client-side only, no user accounts
- Workspace isolation via localStorage key: `vwcg-workspace`

**Provenance:**
- Every tool data update records timestamp + LOGIC_VERSION in `provenance[toolId]`
- Used to detect outdated logic on load; banner prompts upgrade
- LOGIC_VERSION bumped in `src/store/workspaceStore.ts` when rules/validation change

**File Format:**
- Workspace export: `.vwcg` extension (JSON), canonical ordering (sorted keys)
- Canonical export runs max once per 5 seconds (cooldown in store)

---

*Architecture analysis: 2025-02-15*
