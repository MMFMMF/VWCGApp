# Codebase Structure

**Analysis Date:** 2026-02-13

## Directory Layout

```
C:\Users\Kamyar\Documents\VWCGApp/
├── src/
│   ├── main.tsx                # React app bootstrap (initializes registry, validation, charts)
│   ├── App.tsx                 # Router setup, workspace initialization, dynamic tool routes
│   ├── index.css               # Global Tailwind + custom styles
│   ├── App.css                 # App-level style overrides
│   ├── registry/               # Tool registration system
│   │   ├── ToolRegistry.ts     # Core: registerTool, getTools, getTool functions + ToolDefinition interface
│   │   └── registry.ts         # Registers all 12 tools (called from main.tsx)
│   ├── store/
│   │   └── workspaceStore.ts   # Zustand store: all workspace state, synthesis triggers, Safe Mode logic
│   ├── engine/                 # Synthesis engine for cross-tool insights
│   │   ├── synthesis.ts        # runSynthesis, rule registry (v2 rules only)
│   │   ├── types.ts            # Insight, SynthesisRule interfaces
│   │   ├── rules-v2.ts         # 8 advanced cross-tool synthesis rules
│   │   ├── rules.ts            # [DEPRECATED] Old E1-E5 rules (not imported)
│   │   ├── derived-metrics.ts  # Metric computation for rules
│   │   ├── swot-keywords.ts    # SWOT text analysis (keyword frequency)
│   │   ├── cloud.ts            # Optional Gemini API integration for AI consultation
│   │   ├── prompts.ts          # Prompt templates for cloud.ts
│   │   └── index.ts            # Exports
│   ├── validation/             # L0-L3 workspace validation system
│   │   ├── types.ts            # ValidationProfile, ValidationResult, ValidationIssue interfaces
│   │   ├── index.ts            # Exports, initializeValidation() (registers all profiles)
│   │   ├── validator.ts        # validateWorkspace() entry point (checks L0 + per-tool profiles)
│   │   ├── profiles_p1.ts      # AI Readiness, Leadership DNA, BEI validation profiles
│   │   ├── profiles_p2.ts      # Vision Canvas, SWOT, SOP Taxonomy/Creation/Management profiles
│   │   └── profiles_p3.ts      # Roadmap, Advisor Readiness profiles
│   ├── tools/                  # 12 registered assessment tools
│   │   ├── ai-readiness/       # AI maturity (6 dimensions)
│   │   │   ├── index.ts        # Exports ToolDefinition
│   │   │   └── AiReadinessTool.tsx
│   │   ├── leadership-dna/     # Leadership gap analysis (11 competencies)
│   │   │   ├── index.ts        # Exports ToolDefinition
│   │   │   └── LeadershipDnaTool.tsx
│   │   ├── emotional-intelligence/  # BEI (Behavioral Event Interview)
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── BeiTool.tsx
│   │   ├── vision-canvas/      # Strategic pillars, mission, values
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── VisionCanvasTool.tsx
│   │   ├── swot/               # Strengths, Weaknesses, Opportunities, Threats
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── SwotTool.tsx
│   │   ├── sop/                # Standard Operating Procedures (3 sub-tools: Taxonomy, Creation, Management)
│   │   │   ├── index.tsx       # Exports 3 ToolDefinitions
│   │   │   ├── SopTaxonomyTool.tsx
│   │   │   ├── SopCreationTool.tsx
│   │   │   ├── SopManagementTool.tsx
│   │   │   ├── SopTool.tsx
│   │   │   ├── SopWizard.tsx
│   │   │   ├── SopLibrary.tsx
│   │   │   └── SopManagerTool.tsx
│   │   ├── roadmap/            # 90-Day actionable roadmap
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── RoadmapTool.tsx
│   │   ├── advisor-readiness/  # Advisor fit & readiness assessment
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── AdvisorReadinessTool.tsx
│   │   ├── report/             # Report Center (UI for PDF generation)
│   │   │   ├── index.tsx       # Exports ToolDefinition for Report Center
│   │   │   ├── ReportCenter.tsx
│   │   ├── business-context/   # Business metadata (founder hours, employees, etc.)
│   │   │   ├── index.tsx       # Exports ToolDefinition
│   │   │   └── BusinessContextTool.tsx
│   │   ├── dashboard/          # Special: workspace overview (not in registry)
│   │   │   └── DashboardTool.tsx
│   │   └── authority/          # Authority matrix (non-registered tool)
│   │       └── AuthorityMatrix.tsx
│   ├── report/                 # Report generation system (independent from tools/report/)
│   │   ├── design.ts           # Design tokens (colors, fonts, spacing)
│   │   ├── charts/             # Reusable chart components
│   │   │   ├── DotPlot.tsx
│   │   │   ├── Gauge.tsx
│   │   │   ├── HorizontalBar.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── index.ts
│   │   ├── components/         # Report layout components
│   │   │   ├── ReportPage.tsx  # Wrapper for single PDF page with borders/headers
│   │   │   ├── ReportTypography.tsx
│   │   │   └── index.ts
│   │   ├── narrative/          # Text generation for reports
│   │   │   ├── generator.ts    # Main narrative composition
│   │   │   ├── templates.ts    # Text templates per tool
│   │   │   ├── types.ts        # Narrative interfaces
│   │   │   └── index.ts
│   │   ├── pdf/                # PDF creation (new system)
│   │   │   └── PdfGenerator.ts # High-quality PDF generation (jsPDF + html2canvas)
│   │   ├── individual/         # Individual tool reports
│   │   │   ├── AIReadinessReport.tsx
│   │   │   ├── LeadershipDNAReport.tsx
│   │   │   ├── SwotReport.tsx
│   │   │   ├── VisionCanvasReport.tsx
│   │   │   ├── RoadmapReport.tsx
│   │   │   ├── AdvisorReadinessReport.tsx
│   │   │   └── index.ts
│   │   ├── unified/            # Strategic Briefing (unified report across tools)
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   └── quality/            # Report quality checks
│   │       ├── checks.ts
│   │       └── index.ts
│   ├── components/             # Shared React components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Main layout (sidebar, topbar, content area)
│   │   │   └── SafeModeBanner.tsx
│   │   ├── dashboard/
│   │   │   └── StrategicHealthWidget.tsx
│   │   ├── ui/                 # Reusable UI elements
│   │   │   ├── Button.tsx
│   │   │   └── ExportButton.tsx
│   │   └── ErrorBoundary.tsx   # React error boundary
│   ├── utils/
│   │   ├── cn.ts               # Utility: className merging (clsx + tailwind-merge)
│   │   └── fileSystem.ts       # Utility: save/load .vwcg workspace files
│   ├── lib/
│   │   └── charts.ts           # Chart.js registration (idempotent)
│   ├── assets/                 # Images, logos, static files
│   ├── scripts/                # Excluded from TypeScript compilation
│   │   └── [standalone verification scripts]
│
├── tests/                      # E2E tests (Playwright)
│   ├── smoke/                  # Basic smoke tests
│   ├── journeys/               # User journey tests
│   ├── personas/               # Persona-based workflows
│   └── helpers/                # Test utilities
│
├── public/                     # Static assets (served from root)
│   └── [favicon, etc.]
│
├── docs/                       # Project documentation
├── .planning/                  # GSD planning artifacts
│   ├── codebase/               # Codebase analysis documents (THIS FILE)
│   └── quick/                  # Quick-execution phase plans
│
├── vite.config.ts             # Vite build config (@ alias to src/)
├── tsconfig.json              # Root TypeScript config
├── tsconfig.app.json          # App-specific TypeScript config (strict mode)
├── tsconfig.node.json         # Build-tool TypeScript config
├── eslint.config.js           # ESLint configuration
├── postcss.config.js          # Tailwind PostCSS pipeline
├── playwright.config.ts       # E2E test configuration (base URL, headless, timeout)
├── package.json               # npm dependencies, scripts
├── package-lock.json          # Dependency lock file
├── firebase.json              # Firebase Hosting config
├── .firebaserc                # Firebase project config
└── index.html                 # HTML entry point (Vite)
```

## Directory Purposes

**src/registry/:**
- Purpose: Dynamic tool catalog and routing
- Contains: Tool registration functions, tool definitions, routes
- Key files: `ToolRegistry.ts` (interfaces/functions), `registry.ts` (initialization)

**src/store/:**
- Purpose: Global workspace state and mutations
- Contains: Zustand store, persistence, synthesis triggers
- Key files: `workspaceStore.ts` (entire store implementation)

**src/engine/:**
- Purpose: Cross-tool analytics and insights
- Contains: Synthesis rules, derived metrics, SWOT keyword analysis
- Key files: `synthesis.ts` (entry point), `rules-v2.ts` (8 rules), `derived-metrics.ts` (metric computation)

**src/validation/:**
- Purpose: Data integrity enforcement
- Contains: L0-L3 validation profiles per tool
- Key files: `validator.ts` (runs checks), `profiles_p*.ts` (per-tool rules), `types.ts` (interfaces)

**src/tools/:**
- Purpose: User-facing assessment tools
- Contains: 12 tools + dashboard + authority matrix
- Key files: Each tool has `index.ts` (ToolDefinition) + `*Tool.tsx` (component)

**src/report/:**
- Purpose: Report generation (PDF, narratives, charts)
- Contains: 7 subdirectories for different report concerns
- Key files: `pdf/PdfGenerator.ts` (PDF creation), `narrative/generator.ts` (text), `individual/` (single-tool reports)

**src/components/:**
- Purpose: Shared React components
- Contains: Layout shells, dashboards, UI primitives, error boundaries
- Key files: `layout/AppShell.tsx` (main shell), `dashboard/StrategicHealthWidget.tsx`

**src/utils/:**
- Purpose: Cross-cutting utilities
- Contains: Helper functions for styling, file I/O
- Key files: `cn.ts` (className merging), `fileSystem.ts` (workspace save/load)

**tests/:**
- Purpose: End-to-end test suite (Playwright)
- Contains: Smoke tests, user journeys, persona flows, test helpers
- Entry point: `playwright.config.ts` (config), subdirectories by test type

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React app bootstrap, registry/validation/charts initialization
- `src/App.tsx`: Router setup, dynamic tool route generation, workspace init check
- `index.html`: HTML shell (served by Vite)

**Configuration:**
- `vite.config.ts`: Build config (@ alias), React plugin
- `tsconfig.app.json`: TypeScript strict settings (noUnusedLocals, noUnusedParameters, verbatimModuleSyntax)
- `playwright.config.ts`: E2E test config (base URL, headless, timeouts)
- `firebase.json`: Firebase Hosting config (serves from dist/)

**Core Logic:**
- `src/store/workspaceStore.ts`: Single source of truth for all state
- `src/engine/synthesis.ts`: Insight generation orchestration
- `src/engine/rules-v2.ts`: 8 cross-tool analysis rules
- `src/validation/validator.ts`: Safe Mode validation entry point

**Layout:**
- `src/components/layout/AppShell.tsx`: Sidebar + topbar + content area
- `src/components/layout/SafeModeBanner.tsx`: Safe Mode overlay during import
- `src/components/dashboard/StrategicHealthWidget.tsx`: Insights summary widget

**Report System:**
- `src/report/pdf/PdfGenerator.ts`: PDF generation (jsPDF, html2canvas)
- `src/report/narrative/generator.ts`: Report text composition
- `src/report/individual/`: Single-tool report templates
- `src/tools/report/ReportCenter.tsx`: Report generation UI (separate from src/report/)

**Testing:**
- `tests/smoke/`: Basic functionality tests
- `tests/journeys/`: Complex user workflows
- `tests/personas/`: Role-based scenarios
- `tests/helpers/`: Shared test utilities

## Naming Conventions

**Files:**
- `.tsx` for React components (always have JSX)
- `.ts` for TypeScript modules (no JSX)
- `index.ts` / `index.tsx` for directory exports
- `*.test.ts` / `*.spec.ts` for tests (co-located with source)
- Tool components: `*Tool.tsx` (e.g., `LeadershipDnaTool.tsx`, `AiReadinessTool.tsx`)

**Directories:**
- `src/tools/{tool-id}/` using kebab-case (e.g., `leadership-dna`, `ai-readiness`)
- `src/components/{feature}/` grouped by feature (e.g., `layout`, `dashboard`, `ui`)
- Feature directories nest one level only (avoid deeply nested structures)

**Constants/Types/Functions:**
- Tool IDs: kebab-case strings (e.g., `'leadership-dna'`, `'sop-taxonomy'`)
- React components: PascalCase (e.g., `DashboardTool`, `AppShell`)
- Functions: camelCase (e.g., `updateToolData`, `runSynthesis`)
- Types/Interfaces: PascalCase (e.g., `ToolDefinition`, `Insight`, `ValidationResult`)
- Constants: UPPER_SNAKE_CASE (e.g., `LOGIC_VERSION`, `STORAGE_KEY`, `A4_WIDTH_MM`)

**Routing:**
- Tool routes: `/tools/{tool-id}` (e.g., `/tools/leadership-dna`, `/tools/vision-canvas`)
- Dashboard: `/`
- Catch-all: `*` → redirect to `/`

## Where to Add New Code

**New Tool (assessment or feature):**
1. Create directory: `src/tools/{new-tool-id}/`
2. Create component file: `src/tools/{new-tool-id}/NewToolName.tsx` (implements UI, calls updateToolData)
3. Create definition: `src/tools/{new-tool-id}/index.ts` (exports ToolDefinition with id, name, description, path, icon, component, validationProfileId)
4. Register in `src/registry/registry.ts`: add import and `registerTool(newToolDefinition)`
5. Add validation profile in `src/validation/profiles_p*.ts` (new profile or extend existing)
6. Register profile in `src/validation/index.ts`: add import and `registerProfile(newProfile)`

**New Synthesis Rule:**
1. Add rule to `src/engine/rules-v2.ts` as a `SynthesisRule` constant with id, name, description, execute function
2. Rule's execute() reads workspace.tools[toolId] and returns `Insight | null`
3. Export rule and add to `rulesV2` array in synthesis.ts (imports are dynamic)

**New Report Type:**
1. Create component in `src/report/individual/{NewReport.tsx}` (uses ReportPage wrapper, ReportTypography)
2. Add narrative template in `src/report/narrative/templates.ts`
3. Add type definition in `src/report/narrative/types.ts`
4. Update generator.ts to handle new type
5. Export from `src/report/individual/index.ts`

**New UI Component:**
- Shared components: `src/components/ui/` for reusable primitives (Button, Input, etc.)
- Feature-specific: `src/components/{feature}/` for domain-specific components (DashboardWidget, etc.)
- Always: Use `cn()` utility for className composition instead of direct string concatenation

**Utilities:**
- File I/O: `src/utils/fileSystem.ts`
- Styling: `src/utils/cn.ts`
- New utilities: Add to `src/utils/` as needed, export from `index.ts` if multiple files

**Validation Profiles:**
- Profiles split by phase: `profiles_p1.ts` (tools 1-3), `profiles_p2.ts` (tools 4-8), `profiles_p3.ts` (tools 9-11)
- Each profile: `{ id: string, validate: (data) => ValidationIssue[] }`
- Register in `src/validation/index.ts` via `registerProfile()`

## Special Directories

**src/scripts/:**
- Purpose: Standalone verification scripts (excluded from TypeScript compilation)
- Generated: No
- Committed: Yes (via .gitignore exception)
- Usage: Run outside normal build pipeline

**src/report/ vs src/tools/report/:**
- `src/report/`: Core report generation system (PDF, charts, narratives)
- `src/tools/report/`: Report Center UI tool (uses src/report/ internally)
- Separation: src/report is library-like; src/tools/report is consumer

**dist/:**
- Purpose: Vite production build output
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)
- Deployment: Firebase serves this directory

**test-outputs/:**
- Purpose: Playwright E2E test artifacts (screenshots, videos)
- Generated: Yes (via `npm run test:e2e`)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)
- Lock file: package-lock.json committed

---

*Structure analysis: 2026-02-13*
