# Architecture

**Analysis Date:** 2026-02-14

## Pattern Overview

**Overall:** Layered React SPA with Tool Registry pattern + Centralized Workspace Store + Cross-Tool Synthesis Engine

**Key Characteristics:**
- Plugin-style tool registration system that decouples tools from core routing
- Single source of truth (Zustand store) with localStorage persistence
- Synchronous synthesis engine that runs on every tool update
- Hierarchical validation system (L0 structural, L1/L2 per-tool, L3 import safety)
- Dedicated PDF/print routes for clean report generation without UI chrome

## Layers

**Entry Point Layer:**
- Purpose: Application bootstrap and initialization
- Location: `src/main.tsx`, `src/App.tsx`
- Contains: React DOM mounting, store initialization, registry setup, validation initialization
- Depends on: Registry, Validation, Charts, Store
- Used by: Browser runtime

**Presentation Layer (UI Components):**
- Purpose: Render tool interfaces and reports to users
- Location: `src/components/`, `src/tools/*/`
- Contains: React components for 12 tools (AI Readiness, Leadership DNA, BEI, Vision Canvas, SWOT, SOP, Roadmap, Advisor, Report, Business Context) plus Dashboard
- Depends on: Workspace Store, Report System, Zustand hooks
- Used by: Router, Print routes
- Key subdirectories:
  - `src/components/layout/` — AppShell (sidebar + topbar) and SafeModeBanner
  - `src/components/ui/` — Reusable UI primitives (Button, etc.)
  - `src/components/dashboard/` — Dashboard view and StrategicHealthWidget
  - `src/components/print/` — PrintReport router for PDF routes
  - `src/tools/*/` — Individual tool implementations (each has index.ts exporting ToolDefinition)

**Routing & Registry Layer:**
- Purpose: Dynamic route generation and tool/validation registration
- Location: `src/registry/`, `src/validation/`, `src/App.tsx`
- Contains: ToolRegistry (register/getTools), validation profiles (L0-L3)
- Depends on: Tool definitions
- Used by: App.tsx, Validator, AppShell
- Pattern: Registry is populated during initialization (`initializeRegistry()`, `initializeValidation()`) and provides runtime access via `getTools()` and `getTool(id)`

**State Management Layer:**
- Purpose: Persist and manage workspace state across tool updates
- Location: `src/store/workspaceStore.ts`
- Contains: Zustand store with `persist` middleware (localStorage key: `vwcg-workspace`)
- Depends on: Synthesis Engine, Validator
- Used by: All components (via hooks)
- Pattern: Single store with partitioned state (persisted vs. ephemeral); every tool update triggers synthesis synchronously

**Synthesis Engine Layer:**
- Purpose: Generate insights and derived metrics from cross-tool data
- Location: `src/engine/`
- Contains: 8 v2 synthesis rules, 6 derived metrics, SWOT keyword analysis, optional Gemini AI consultation
- Depends on: Tool data from store
- Used by: Workspace Store (on every update), Unified Strategic Briefing report
- Key files:
  - `src/engine/synthesis.ts` — Rule execution and insight sorting
  - `src/engine/rules-v2.ts` — 8 insight rules (V2_* prefixed)
  - `src/engine/derived-metrics.ts` — 6 metrics (execution-ambition, founder dependency, strategic coherence, revenue risk, readiness score, leadership archetype)
  - `src/engine/swot-keywords.ts` — Keyword scanning for SWOT analysis
  - `src/engine/cloud.ts` — Optional Gemini 1.5 Flash API (requires VITE_GEMINI_API_KEY env var)
  - `src/engine/types.ts` — Insight, SynthesisRule interfaces

**Validation Layer:**
- Purpose: Enforce data quality during import (Safe Mode) and on every update
- Location: `src/validation/`
- Contains: L0 (structural), L1/L2 (per-tool profiles), L3 (import safety)
- Depends on: Tool definitions, workspace data
- Used by: Workspace Store (stageWorkspace/commitWorkspace), validators
- Pattern: Registration at startup via `initializeValidation()`; validation profiles referenced by tool's `validationProfileId`

**Report System Layer:**
- Purpose: Generate multi-page narrative-driven reports for PDF export
- Location: `src/report/`
- Contains: 6 subdirectories for charts, typography, narrative, individual tool reports, unified briefing, PDF generation, quality checks
- Depends on: Workspace data, Synthesis Engine, Derived Metrics
- Used by: ReportCenter tool, Print routes
- Architecture:
  - `src/report/charts/` — Reusable chart components (HorizontalBar, DotPlot, Gauge, ProgressBar)
  - `src/report/components/` — Report typography (ReportPage, ReportHero, ReportSectionTitle, ReportBody, etc.) and ReportPage layout wrapper
  - `src/report/narrative/` — Template-driven narrative generation with voice/tone enforcement, banned phrase detection, section templates
  - `src/report/individual/` — Per-tool report components (AIReadinessReport, LeadershipDNAReport, SwotReport, VisionCanvasReport, AdvisorReadinessReport, RoadmapReport)
  - `src/report/unified/` — UnifiedStrategicBriefing (12-16 page flagship report) and LLMStrategicBriefing (AI-generated narrative variant)
  - `src/report/pdf/` — PdfGenerator (high-resolution html2canvas + jsPDF) and PrintPdfService (browser print dialog)
  - `src/report/quality/` — VagueEntryDetector and EdgeCaseDetector for report content quality assurance
  - `src/report/design.ts` — Color palettes and design constants

**Tools Layer:**
- Purpose: Domain-specific assessment interfaces
- Location: `src/tools/*/` (12 registered tools + Dashboard)
- Contains: React components for user input/display
- Each tool exports: ToolDefinition (id, name, description, path, icon, component, validationProfileId)
- Tools: ai-readiness, leadership-dna, emotional-intelligence, vision-canvas, swot, sop (3 tools), roadmap, advisor-readiness, report, business-context, dashboard (not in registry)

**Utilities Layer:**
- Purpose: Shared helper functions
- Location: `src/utils/`
- Contains: cn.ts (Tailwind utility), fileSystem.ts (workspace import/export)

## Data Flow

**User Tool Update Flow:**

1. User edits tool UI component (e.g., sets AI Readiness score)
2. Component calls `updateToolData(toolId, data)` from store
3. Store merges data into `state.tools[toolId]`
4. Store updates `provenance[toolId]` with timestamp + LOGIC_VERSION
5. Store calls `runSynthesis(simulation)` synchronously
6. Synthesis engine executes all registered rules, returns `Insight[]` sorted by severity
7. Store updates `state.insights` with new insights
8. Zustand persist middleware auto-saves `{version, metadata, tools, provenance}` to localStorage
9. Component re-renders with fresh data via Zustand hooks

**Report Generation Flow:**

1. User clicks "Generate Report" in ReportCenter
2. ReportCenter calls appropriate report component (e.g., UnifiedStrategicBriefing)
3. Report component reads workspace store, computes derived metrics, runs synthesis
4. Report component generates narrative via template system (buildSectionTemplate, generateNarrative)
5. Report rendered as HTML div (e.g., id="unified-strategic-briefing")
6. User clicks "Download PDF"
7. PdfGenerator captures HTML at 3x scale (300 DPI), renders jsPDF, generates blob
8. Browser triggers download as branded file (e.g., "ClientName-Strategic-Briefing-2026-02-14.pdf")

**Safe Mode (Import) Flow:**

1. User selects .vwcg file to load
2. AppShell calls `stageWorkspace(data)`
3. Store calls `validateWorkspace(data)` synchronously
4. Validator runs L0 (structural) + L1/L2 (per-tool profiles) + import safety checks
5. Store sets `isSafeMode: true`, `previewData: data`, `validationResults: result`
6. SafeModeBanner displays issues; user resolves or confirms
7. User clicks "Commit"
8. Store calls `commitWorkspace()`, merges `previewData` into actual state, exits Safe Mode
9. Synthesis runs on new data, insights update

**State Management:**

- All tool data persisted under `state.tools[toolId]`
- Workspace-level metadata: id, name, createdAt, lastModified, computed_under_logic_version
- Provenance tracking: each tool has `{ timestamp, logicVersion }` entry
- Ephemeral state (not persisted): isSafeMode, previewData, validationResults, insights, lastExportTime
- Logic version upgrade: LOGIC_VERSION constant in workspaceStore.ts bumps when rules/validation change; triggers recomputeLogic() if needed

## Key Abstractions

**ToolDefinition (src/registry/ToolRegistry.ts):**
- Purpose: Metadata contract for registering tools
- Interface: id, name, description, path, icon (lucide-react), component, validationProfileId (optional)
- Used by: registerTool(), routing in App.tsx, sidebar nav in AppShell
- Examples: `src/tools/ai-readiness/index.ts`, `src/tools/leadership-dna/index.ts`

**SynthesisRule (src/engine/types.ts):**
- Purpose: Pluggable insight generation rule
- Interface: id, name, description, execute(workspace) → Insight | null
- Used by: runSynthesis(), rule registry in synthesis.ts
- Examples: visionExecutionMismatch, valuesRealityContradiction, founderDependencyRisk (8 total in rules-v2.ts)

**Insight (src/engine/types.ts):**
- Purpose: Cross-tool concern requiring user attention
- Fields: id, type (risk|opportunity|conflict|strength), severity (high|medium|low), title, message, recommendation, relatedTools[]
- Generated by: Synthesis engine, stored in workspace.insights

**ValidationProfile (src/validation/types.ts):**
- Purpose: Per-tool data quality rules
- Interface: id, validate(data) → ValidationIssue[]
- Used by: registerProfile(), validator at import time
- Examples: profiles_p1.ts (AI Readiness, Leadership DNA, BEI, Vision Canvas), profiles_p2.ts (SWOT, SOP), profiles_p3.ts (Roadmap, Advisor, Business Context)

**ReportDefinition:**
- Purpose: Metadata for report generation
- Determined by: reportType param in PrintReport route
- Maps to: React components (UnifiedStrategicBriefing, AIReadinessReport, etc.)

**DerivedMetrics (src/engine/derived-metrics.ts):**
- Purpose: Cross-tool aggregated insights
- Metrics: executionAmbitionRatio, founderDependencyIndex, strategicCoherence, revenueRiskEstimate, organizationalReadinessScore, leadershipArchetype
- Used by: Unified report, synthesis rules, dashboard health widget

## Entry Points

**Browser Entry (src/main.tsx):**
- Location: `src/main.tsx`
- Triggers: npm run dev, npm run build
- Responsibilities:
  1. initializeRegistry() — registers all 12 tools
  2. initializeValidation() — registers validation profiles
  3. registerCharts() — sets up chart.js plugins
  4. createRoot() — mounts App to #root

**App Component (src/App.tsx):**
- Location: `src/App.tsx`
- Triggers: Browser renders React app
- Responsibilities:
  1. Checks if workspace exists (metadata.id); calls resetWorkspace() if not
  2. Renders BrowserRouter with two route groups:
     - Print routes (/report/print/:reportType) — no AppShell wrapper
     - App routes (/ + /tools/* + catch-all) — wrapped in AppShell
  3. Dynamically generates tool routes via getTools().map()

**AppShell Layout (src/components/layout/AppShell.tsx):**
- Location: `src/components/layout/AppShell.tsx`
- Triggers: Every app route (except print routes)
- Responsibilities:
  1. Renders sidebar nav (Dashboard + all tools from getTools())
  2. Renders topbar with Save/Load/Logic Version controls
  3. Renders <Outlet/> for tool/dashboard component
  4. Manages Safe Mode banner display

**Print Route (src/components/print/PrintReport.tsx):**
- Location: `src/components/print/PrintReport.tsx`
- Triggers: /report/print/:reportType
- Responsibilities:
  1. Maps reportType to corresponding report component
  2. Renders report without AppShell (for clean PDF capture)
  3. For ai-briefing: reads LLM narrative from localStorage

**Dashboard (src/tools/dashboard/DashboardTool.tsx):**
- Location: `src/tools/dashboard/DashboardTool.tsx`
- Triggers: Route to / (home)
- Responsibilities:
  1. Displays workspace name and metadata
  2. Shows StrategicHealthWidget (summary metrics)
  3. Lists all tools with cards

## Error Handling

**Strategy:** Try-catch at rule/component boundaries, graceful fallbacks, console warnings for non-critical failures

**Patterns:**

- **Synthesis Rules:** Each rule wrapped in try-catch in runSynthesis(); failures log warning and return null (skipped)
- **Validation:** Validator gathers all issues (errors + warnings) and reports status; import halts on structural errors
- **Component Render:** ErrorBoundary wrapper (`src/components/ErrorBoundary.tsx`) catches React render errors
- **Tool Data Access:** Components defensively check for undefined tool data (e.g., `const dna = workspace.tools?.['leadership-dna']`)
- **Workspace Operations:** Export/Load operations wrapped in try-catch; UI alerts on failure

## Cross-Cutting Concerns

**Logging:** Console.log() for debug info (synthesis runs, rule execution, store updates). All prefixed with [module-name] for easy filtering.

**Validation:** Three-tier system:
- L0: Structural (JSON shape, required sections)
- L1/L2: Per-tool profiles (required fields, type checks)
- L3: Import safety (logic version compatibility, data migrations)

**Authentication:** Not implemented; app is single-user (runs in browser, workspace stored in localStorage)

**Persistence:** Zustand persist middleware → localStorage (key: `vwcg-workspace`). Export as .vwcg file (JSON) for backup/sharing. Import via Safe Mode with validation.

**Provenance Tracking:** Every tool update records timestamp + LOGIC_VERSION; enables audit trail and selective recomputation on logic upgrades.

---

*Architecture analysis: 2026-02-14*
