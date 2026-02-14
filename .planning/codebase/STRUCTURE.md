# Codebase Structure

**Analysis Date:** 2026-02-14

## Directory Layout

```
src/
├── assets/                    # Static images and media files
├── components/                # Shared UI components
│   ├── dashboard/            # Dashboard-specific widgets
│   ├── layout/               # AppShell, SafeModeBanner (page layout)
│   ├── print/                # PrintReport router for PDF routes
│   ├── ui/                   # Reusable UI primitives (Button, etc.)
│   └── ErrorBoundary.tsx     # React error boundary wrapper
├── engine/                    # Cross-tool synthesis and insights
│   ├── llm/                  # Gemini AI integration (optional)
│   ├── cloud.ts              # Gemini API client
│   ├── derived-metrics.ts    # 6 cross-assessment metrics
│   ├── index.ts              # Public API export
│   ├── prompts.ts            # LLM prompt templates
│   ├── rules.ts              # Legacy v1 rules (no longer imported)
│   ├── rules-v2.ts           # 8 active synthesis rules
│   ├── swot-keywords.ts      # SWOT keyword analysis
│   ├── synthesis.ts          # Rule execution engine
│   └── types.ts              # Insight, SynthesisRule interfaces
├── lib/                       # Library exports and configurations
│   └── charts.ts             # Chart.js plugin registration
├── registry/                  # Tool and validation registration
│   ├── ToolRegistry.ts       # registerTool(), getTools(), getTool()
│   └── registry.ts           # initializeRegistry() — registers all 12 tools
├── report/                    # Comprehensive report generation
│   ├── charts/               # Reusable chart components
│   ├── components/           # Report typography and layout (ReportPage, ReportHero, etc.)
│   ├── individual/           # Per-tool report components
│   ├── narrative/            # Template-driven narrative generation
│   ├── pdf/                  # PDF generation and print service
│   ├── quality/              # Content quality assurance (VagueEntryDetector)
│   ├── unified/              # UnifiedStrategicBriefing and LLMStrategicBriefing
│   └── design.ts             # Color palettes and design constants
├── scripts/                   # Standalone verification scripts (excluded from TypeScript)
├── store/                     # Zustand workspace store
│   └── workspaceStore.ts     # Single source of truth (localStorage-backed)
├── tools/                     # 12+ Tool implementations
│   ├── advisor-readiness/    # Advisor readiness assessment
│   ├── ai-readiness/         # AI maturity across 6 dimensions
│   ├── authority/            # Authority tracker (not in registry)
│   ├── business-context/     # Business context and founder info
│   ├── dashboard/            # Dashboard landing page (not in registry)
│   ├── emotional-intelligence/ # BEI (Behavioral Event Interview)
│   ├── leadership-dna/       # Leadership archetype assessment
│   ├── report/               # ReportCenter (report generation UI)
│   ├── roadmap/              # 90-Day roadmap with timeline
│   ├── sop/                  # SOP Taxonomy, Creation, Management (3 tools)
│   ├── swot/                 # SWOT analysis matrix
│   └── vision-canvas/        # Vision canvas (pillars, values, metrics)
├── utils/                     # Shared utility functions
│   ├── cn.ts                 # Tailwind className composition
│   └── fileSystem.ts         # Workspace import/export
├── validation/                # Data quality validation system
│   ├── profiles_p1.ts        # Validation profiles (part 1)
│   ├── profiles_p2.ts        # Validation profiles (part 2)
│   ├── profiles_p3.ts        # Validation profiles (part 3)
│   ├── index.ts              # initializeValidation()
│   ├── types.ts              # ValidationProfile, ValidationResult interfaces
│   └── validator.ts          # validateWorkspace() — L0/L1/L2/L3 checks
├── App.tsx                    # Router setup and main app component
├── App.css                    # App-wide styles
├── index.css                  # Global CSS (Tailwind)
└── main.tsx                   # React DOM mount point
```

## Directory Purposes

**src/assets/:**
- Purpose: Static images, icons, media (not yet populated)
- Committed: Yes
- Generated: No

**src/components/:**
- Purpose: Shared UI components used across multiple tools/pages
- Key subdirectories:
  - `layout/` — AppShell (main page wrapper), SafeModeBanner (import validation UI)
  - `dashboard/` — Dashboard home page widgets
  - `ui/` — Primitive components (Button, etc.)
  - `print/` — PrintReport router for PDF routes (no AppShell wrapper)
- Committed: Yes

**src/engine/:**
- Purpose: Synthesis logic for cross-tool insights
- Key files:
  - `synthesis.ts` (35 lines) — Rule execution and sorting
  - `rules-v2.ts` (650+ lines) — 8 active insight rules
  - `derived-metrics.ts` (550+ lines) — 6 aggregated metrics
  - `swot-keywords.ts` (200+ lines) — Keyword analysis for SWOT text
  - `types.ts` — Insight, SynthesisRule interfaces
  - `rules.ts` — Legacy v1 rules (E1-E5, no longer used)
  - `cloud.ts` — Optional Gemini AI integration
- Committed: Yes
- How synthesis runs: Every `updateToolData()` call triggers `runSynthesis()` synchronously; results stored in `state.insights`

**src/lib/:**
- Purpose: Library configuration and exports
- Contains: `charts.ts` for Chart.js plugin registration
- Committed: Yes

**src/registry/:**
- Purpose: Tool and validation profile registration
- Files:
  - `ToolRegistry.ts` (26 lines) — Registry interface and access functions
  - `registry.ts` (28 lines) — Calls registerTool() for each of 12 tools
- Initialization: Called in `main.tsx` via `initializeRegistry()`
- Access: Components use `getTools()` for list, `getTool(id)` for lookup
- Committed: Yes

**src/report/:**
- Purpose: Multi-page report generation for PDF export
- 6 subdirectories:
  - `charts/` — Reusable chart components (HorizontalBar, DotPlot, Gauge, ProgressBar)
  - `components/` — Report layout primitives (ReportPage, ReportHero, ReportSectionTitle, ReportBody, ReportCaption, ReportCallout, ReportList) and typography (ReportTypography)
  - `individual/` — 6 per-tool reports (AIReadinessReport, LeadershipDNAReport, SwotReport, VisionCanvasReport, AdvisorReadinessReport, RoadmapReport)
  - `narrative/` — Template system for consultant-voice narrative generation (templates.ts, generator.ts, voice.ts, types.ts)
  - `pdf/` — PdfGenerator (html2canvas + jsPDF at 300 DPI), PrintPdfService (browser print)
  - `unified/` — UnifiedStrategicBriefing (flagship 12-16 page report), LLMStrategicBriefing (AI-generated variant)
  - `quality/` — VagueEntryDetector, EdgeCaseDetector for content quality assurance
- Key design: ReportPage wrapper provides consistent layout; all reports render inside for PDF capture
- Committed: Yes

**src/scripts/:**
- Purpose: Standalone verification/debug scripts (excluded from TypeScript compilation)
- Committed: Yes
- Note: These run outside the normal build and are not type-checked

**src/store/:**
- Purpose: Workspace state management
- Single file: `workspaceStore.ts` (250+ lines)
- Pattern: Zustand with persist middleware (localStorage key: `vwcg-workspace`)
- State shape:
  - Persisted: version, metadata, tools, provenance
  - Ephemeral: isSafeMode, previewData, validationResults, insights, lastExportTime
- Access: All components use `useWorkspaceStore(state => ...)` hooks
- Committed: Yes

**src/tools/:**
- Purpose: 12 registered assessment tools + Dashboard (not registered)
- Each tool has:
  - Main component file (e.g., AiReadinessTool.tsx)
  - `index.ts` or `index.tsx` exporting ToolDefinition
  - Optional: type definitions, sub-components, data helpers
- Registered tools (in registry.ts):
  1. `ai-readiness/` — AI maturity across 6 dimensions
  2. `leadership-dna/` — Leadership archetype (4 archetypes: Builder, Connector, Optimizer, Visionary)
  3. `emotional-intelligence/` — BEI trend data
  4. `vision-canvas/` — Pillars, values, 3-year metrics
  5. `swot/` — Strengths, weaknesses, opportunities, threats
  6. `sop/` — SOP Taxonomy, Creation, Management (3 separate tools)
  7. `roadmap/` — 90-day initiatives with timeline
  8. `advisor-readiness/` — Operational readiness questions
  9. `report/` — ReportCenter (generates and downloads reports)
  10. `business-context/` — Founder, revenue, industry context
- Non-registered tools:
  - `dashboard/` — Landing page (special route at /)
  - `authority/` — Authority tracker (legacy, not in registry)
- Committed: Yes

**src/utils/:**
- Purpose: Shared helper functions
- Files:
  - `cn.ts` (7 lines) — Wrapper for clsx + tailwind-merge
  - `fileSystem.ts` (30+ lines) — saveWorkspaceToFile(), loadWorkspaceFromFile()
- Committed: Yes

**src/validation/:**
- Purpose: Data quality validation system
- Files:
  - `types.ts` — ValidationProfile, ValidationResult, ValidationIssue interfaces
  - `validator.ts` — validateWorkspace() — L0/L1/L2 checks
  - `profiles_p1.ts` — Validation profiles for AI Readiness, Leadership DNA, BEI, Vision Canvas
  - `profiles_p2.ts` — Validation profiles for SWOT, SOP
  - `profiles_p3.ts` — Validation profiles for Roadmap, Advisor, Business Context
  - `index.ts` — initializeValidation() — registers all profiles
- Validation tiers:
  - L0: Structural (JSON shape, required sections)
  - L1/L2: Per-tool (field presence, type checks, business rules)
  - L3: Import safety (logic version compatibility, data migration)
- Registration: Happens in `main.tsx` during startup; profiles keyed by id (e.g., 'aireadiness_v1')
- Access: validator.ts looks up profiles via tool's `validationProfileId`
- Committed: Yes

**src/App.tsx:**
- Purpose: Main application router
- Responsibilities:
  1. Check if workspace exists; call resetWorkspace() if not
  2. Set up BrowserRouter with two route groups:
     - Print routes (/report/print/:reportType) — no AppShell
     - App routes (/ and /tools/*) — wrapped in AppShell
  3. Dynamically generate tool routes via getTools().map()
- Committed: Yes

**src/index.css:**
- Purpose: Global CSS (Tailwind imports, custom utilities)
- Committed: Yes

**src/main.tsx:**
- Purpose: React DOM entry point
- Responsibilities:
  1. initializeRegistry()
  2. initializeValidation()
  3. registerCharts()
  4. createRoot().render(<App />)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/main.tsx` — React DOM mount (npm run dev starts here)
- `src/App.tsx` — Router and app initialization
- `src/components/layout/AppShell.tsx` — Main page layout for tool routes

**Configuration:**
- `tsconfig.app.json` — TypeScript compiler config (target ES2022, strict mode)
- `vite.config.ts` — Vite bundler config (path alias @/ → src/)
- `src/index.css` — Global CSS (Tailwind)

**Core Logic:**
- `src/store/workspaceStore.ts` — Single state store (localStorage-backed)
- `src/engine/synthesis.ts` — Insight generation
- `src/engine/rules-v2.ts` — 8 synthesis rules
- `src/engine/derived-metrics.ts` — 6 cross-assessment metrics
- `src/validation/validator.ts` — Data quality checks

**Tool Definitions:**
- `src/registry/ToolRegistry.ts` — Tool registration system
- `src/registry/registry.ts` — Register all 12 tools

**Report Generation:**
- `src/report/unified/UnifiedStrategicBriefing.tsx` — Flagship 12-16 page report
- `src/report/pdf/PdfGenerator.ts` — HTML to PDF conversion (300 DPI)
- `src/components/print/PrintReport.tsx` — Print route router

**Validation:**
- `src/validation/types.ts` — Validation interfaces
- `src/validation/profiles_p*.ts` — Per-tool validation rules
- `src/validation/validator.ts` — Master validation function

**Testing:**
- `tests/` — Playwright E2E tests
  - `smoke/` — Quick smoke tests
  - `journeys/` — Multi-tool user journeys (alex.spec.ts, mike.spec.ts, sarah.spec.ts)
  - `helpers/` — Test utilities (forms.ts, navigation.ts, workspace.ts)

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., AiReadinessTool.tsx, AppShell.tsx)
- Utility/logic modules: camelCase (e.g., workspaceStore.ts, synthesis.ts)
- Types/interfaces: Exported from .ts files with `export type`
- Index files: `index.ts` for logic modules, `index.tsx` for tool definitions

**Directories:**
- Tool directories: kebab-case (e.g., `ai-readiness`, `vision-canvas`)
- Feature directories: kebab-case (e.g., `error-boundary` would be, but currently `ErrorBoundary.tsx` is in components/)
- Subdomain directories: descriptive names (e.g., `narrative`, `charts`, `quality`)

**Functions:**
- camelCase for all functions and methods
- Prefix with verb for clarity: `get*`, `compute*`, `generate*`, `validate*`, `scan*`
- Examples: getTools(), computeDerivedMetrics(), generateNarrative(), validateWorkspace()

**Variables:**
- camelCase for local variables and state
- UPPERCASE_SNAKE_CASE for constants (e.g., LOGIC_VERSION, STORAGE_KEY, A4_WIDTH_MM)
- Type-prefixed for descriptive clarity (e.g., insights[], scores[], tools{})

**Types/Interfaces:**
- PascalCase for interface names (e.g., ToolDefinition, WorkspaceState, Insight)
- Descriptive names matching domain concepts (e.g., DerivedMetrics, ValidationProfile, ReportType)
- Type keyword for type-only imports (e.g., `import type { Insight } from '...'`) — required by verbatimModuleSyntax

## Where to Add New Code

**New Feature (e.g., new synthesis rule):**
- Primary code: Add rule to `src/engine/rules-v2.ts` (implement SynthesisRule interface)
- Tests: Add test case to `tests/` (Playwright journey or unit)
- Export: Update `src/engine/index.ts` to export if public

**New Tool:**
1. Create `src/tools/<tool-id>/` directory
2. Implement main component (e.g., MyTool.tsx)
3. Create `src/tools/<tool-id>/index.ts` exporting ToolDefinition with:
   - Unique id (kebab-case)
   - Path: `/tools/<tool-id>`
   - Icon from lucide-react
   - Validation profile id (optional)
4. Import and register in `src/registry/registry.ts` via registerTool()
5. (Optional) Create validation profile in `src/validation/profiles_p*.ts` and register in `src/validation/index.ts`
6. Add route to AppShell sidebar automatically via getTools()

**New Report:**
1. Create component in `src/report/individual/` or `src/report/unified/`
2. Wrap content in ReportPage component
3. Use ReportSectionTitle, ReportBody, etc. from `src/report/components/` for consistent styling
4. Use narrative system: createNarrativeContext(), generateNarrative(), buildSectionTemplate()
5. Add mapping in `src/components/print/PrintReport.tsx` REPORT_MAP if new report type
6. Add route parameter support in ReportCenter if needed

**New Validation Profile:**
1. Create profile in `src/validation/profiles_p1.ts`, `profiles_p2.ts`, or `profiles_p3.ts`
2. Implement ToolValidationProfile interface: id, validate(data) → ValidationIssue[]
3. Register in `src/validation/index.ts` via registerProfile()
4. Link tool to profile via ToolDefinition.validationProfileId

**New Utility:**
- Place in `src/utils/` if reused across multiple components
- Place in `src/lib/` if a library configuration export
- Follow existing import patterns and use path alias @/ where applicable

**Shared Component:**
- Place in `src/components/` if reused across tools or pages
- Create subdirectory if component has sub-files or variations
- Follow naming: PascalCase files for React components

## Special Directories

**src/scripts/:**
- Purpose: Standalone scripts excluded from TypeScript compilation (set in tsconfig.app.json)
- Generated: No
- Committed: Yes
- Note: These run outside normal build and are not type-checked by TS compiler

**src/engine/llm/:**
- Purpose: Gemini LLM integration (optional, requires VITE_GEMINI_API_KEY env var)
- Generated: No
- Committed: Yes
- Currently: Types defined; cloud.ts provides API client

**test-results/, test-outputs/:**
- Purpose: E2E test output and Playwright screenshots
- Generated: Yes (on test runs)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (npm run build)
- Committed: No (in .gitignore)
- Deployed to Firebase Hosting from dist/

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-14*
