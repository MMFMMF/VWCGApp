# Codebase Structure

**Analysis Date:** 2026-02-14

## Directory Layout

```
VWCGApp/
├── src/                          # Application source code
│   ├── main.tsx                  # Entry point: initializers + React render
│   ├── App.tsx                   # Root component: router setup + workspace init
│   ├── index.css                 # Global Tailwind styles
│   │
│   ├── tools/                    # 12 registered tools (each = self-contained module)
│   │   ├── ai-readiness/         # AI Readiness assessment
│   │   ├── leadership-dna/       # Leadership DNA evaluation
│   │   ├── emotional-intelligence/  # BEI (Behavioral-Emotional Intelligence)
│   │   ├── vision-canvas/        # Vision Canvas definition
│   │   ├── swot/                 # SWOT analysis matrix
│   │   ├── sop/                  # SOP Taxonomy, Creation, Management (3 sub-tools)
│   │   ├── roadmap/              # 90-Day Roadmap planner
│   │   ├── advisor-readiness/    # Advisor Readiness assessment
│   │   ├── report/               # Report Center (aggregator, not analysis tool)
│   │   ├── business-context/     # Business Context baseline
│   │   ├── authority/            # Authority Tracker (not in registry, side tool)
│   │   └── dashboard/            # Dashboard (special tool, rendered at /)
│   │
│   ├── report/                   # Report generation + narrative system
│   │   ├── charts/               # Gauge, HorizontalBar, DotPlot, ProgressBar
│   │   ├── components/           # ReportPage, ReportTypography, layout wrappers
│   │   ├── individual/           # Per-tool report pages (AIReadinessReport, etc.)
│   │   ├── narrative/            # Narrative generation (generator.ts, templates.ts, voice.ts)
│   │   ├── unified/              # Unified strategic briefing + LLM briefing
│   │   ├── pdf/                  # PdfGenerator.ts, PrintPdfService.ts (exports)
│   │   ├── quality/              # EdgeCaseDetector, VagueEntryDetector
│   │   └── design.ts             # Report design constants (spacing, colors, fonts)
│   │
│   ├── store/                    # State management
│   │   └── workspaceStore.ts     # Zustand store with persist + synthesis integration
│   │
│   ├── engine/                   # Synthesis + cross-tool logic
│   │   ├── synthesis.ts          # runSynthesis() orchestrator
│   │   ├── rules-v2.ts           # 8 advanced synthesis rules (current active)
│   │   ├── rules.ts              # Legacy E1-E5 rules (deprecated)
│   │   ├── derived-metrics.ts    # Metric computations (competency scores, gaps, etc.)
│   │   ├── swot-keywords.ts      # Keyword scanning for SWOT text analysis
│   │   ├── types.ts              # Insight, SynthesisRule types
│   │   ├── cloud.ts              # Optional Gemini API integration (AI consultation)
│   │   ├── prompts.ts            # LLM prompt templates
│   │   └── llm/                  # (Directory exists, purpose TBD)
│   │
│   ├── validation/               # Data validation + import safety
│   │   ├── types.ts              # ValidationResult, ValidationProfile, ValidationIssue types
│   │   ├── index.ts              # initializeValidation() registration
│   │   ├── profiles_p1.ts        # Profiles: AI Readiness, Leadership DNA, BEI
│   │   ├── profiles_p2.ts        # Profiles: Vision Canvas, SWOT, SOP (all 3)
│   │   ├── profiles_p3.ts        # Profiles: 90-Day Roadmap, Advisor Readiness
│   │   └── validator.ts          # validateWorkspace() entry point
│   │
│   ├── registry/                 # Tool registration + discovery
│   │   ├── ToolRegistry.ts       # ToolDefinition interface + registerTool/getTools
│   │   └── registry.ts           # initializeRegistry() + all tool imports
│   │
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # AppShell (sidebar + topbar + outlet)
│   │   │   ├── AppShell.tsx      # Main layout wrapper
│   │   │   └── SafeModeBanner.tsx # Validation results display
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx        # Button variants: primary, secondary, outline, ghost, destruct
│   │   │   └── ExportButton.tsx  # Workspace export convenience wrapper
│   │   ├── dashboard/            # Dashboard-specific
│   │   │   └── StrategicHealthWidget.tsx  # Insights display
│   │   ├── ErrorBoundary.tsx     # Error boundary component
│   │   └── [other shared components if any]
│   │
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class merging: clsx + tailwind-merge
│   │   └── fileSystem.ts         # Workspace file I/O: save/load JSON
│   │
│   ├── lib/                      # Shared libraries
│   │   └── charts.ts             # Chart.js plugin registration
│   │
│   ├── validation/               # (See above)
│   │
│   ├── assets/                   # Static assets (images, icons, etc.)
│   └── scripts/                  # Standalone verification scripts (excluded from TypeScript)
│
├── tests/                        # Playwright E2E tests
│   ├── journeys/                 # End-to-end persona journeys (alex.spec.ts, mike.spec.ts, sarah.spec.ts)
│   ├── smoke/                    # Quick smoke tests
│   ├── personas/                 # Test data for personas (alex.ts, mike.ts, sarah.ts)
│   └── helpers/                  # Test utilities (navigation.ts, forms.ts, workspace.ts)
│
├── public/                       # Static files served at root
├── dist/                         # Production build output (generated)
│
├── vite.config.ts                # Vite build config + @ path alias
├── tsconfig.json                 # Root TypeScript config (references app + node configs)
├── tsconfig.app.json             # App TypeScript config (strict mode, path aliases, exclusions)
├── tsconfig.node.json            # Node TypeScript config (build scripts)
├── playwright.config.ts          # Playwright E2E config (base URL, timeouts)
│
├── package.json                  # Dependencies, scripts
└── .env (not tracked)            # Optional: VITE_GEMINI_API_KEY for AI features
```

## Directory Purposes

**src/tools/**
- Purpose: Each tool is a self-contained module with its own UI, data schema, and component
- Contains: 12 tool modules + 1 dashboard + 1 authority tracker
- Pattern: Each tool exports a `ToolDefinition` from `index.ts`, a React component, and optional supporting files (types, utils, sub-components)
- Key files: `{ToolName}.tsx` (main component), `index.ts` (definition export), optional `types.ts` (data schema)

**src/report/**
- Purpose: Multi-page narrative report generation and PDF export
- Contains: 6 subdirectories for organization: charts (visualizations), components (layout), individual (per-tool report pages), narrative (text generation), unified (cross-tool briefing), pdf (export service), quality (validation)
- Key files: `PdfGenerator.ts` (jsPDF + html2canvas export), `generator.ts` (narrative templates), individual report pages (AIReadinessReport.tsx, etc.)

**src/store/**
- Purpose: Central state management and persistence
- Contains: Single Zustand store with localStorage persistence
- Key files: `workspaceStore.ts` (store definition, actions, state shape)

**src/engine/**
- Purpose: Cross-tool synthesis logic and insight generation
- Contains: 8 synthesis rules, derived metrics, SWOT keyword analysis, optional LLM integration
- Key files: `synthesis.ts` (orchestrator), `rules-v2.ts` (active rules), `derived-metrics.ts` (metric computations), `swot-keywords.ts` (text analysis)

**src/validation/**
- Purpose: Data integrity checks for workspace imports and tool updates
- Contains: Per-tool validation profiles (L0-L3), validation orchestrator
- Key files: `validator.ts` (entry point), `profiles_p*.ts` (profile definitions)

**src/registry/**
- Purpose: Tool discovery and dynamic route generation
- Contains: Tool registration system
- Key files: `ToolRegistry.ts` (interface), `registry.ts` (registration + imports)

**src/components/**
- Purpose: Reusable UI primitives and layout
- Contains: AppShell layout, Button component, error boundary, dashboard widget
- Key files: `AppShell.tsx` (main layout), `Button.tsx` (design system), `ErrorBoundary.tsx` (error handling)

**tests/**
- Purpose: End-to-end testing with Playwright
- Contains: Persona journey tests, smoke tests, test helpers, test data
- Key files: `journeys/*.spec.ts` (end-to-end tests), `helpers/*.ts` (reusable test utilities), `personas/*.ts` (test data)

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Application bootstrap; initializes registry, validation, charts
- `src/App.tsx`: Root component; sets up router and workspace initialization
- `src/components/layout/AppShell.tsx`: Main layout wrapper; sidebar + topbar + content outlet

**Configuration:**
- `vite.config.ts`: Build config, path alias (`@` → `src`)
- `tsconfig.app.json`: TypeScript strict mode, path aliases, exclusions
- `playwright.config.ts`: E2E test config (base URL, timeouts, browsers)

**Core Logic:**
- `src/store/workspaceStore.ts`: Central state, persistence, synthesis trigger
- `src/engine/synthesis.ts`: Insight computation orchestrator
- `src/engine/rules-v2.ts`: 8 cross-tool synthesis rules (active)
- `src/validation/validator.ts`: Workspace validation entry point

**Tool Registration:**
- `src/registry/registry.ts`: All tool imports and registration calls
- `src/registry/ToolRegistry.ts`: Tool interface and registry functions

**Testing:**
- `tests/journeys/*.spec.ts`: Full user journey tests (Alex, Mike, Sarah personas)
- `tests/helpers/*.ts`: Navigation, form filling, workspace utilities

## Naming Conventions

**Files:**
- **Tool components:** PascalCase (e.g., `SwotTool.tsx`, `AiReadinessTool.tsx`)
- **Utility functions:** camelCase (e.g., `cn.ts`, `fileSystem.ts`, `runSynthesis()`)
- **Types/Interfaces:** PascalCase (e.g., `ToolDefinition`, `Insight`, `ValidationResult`)
- **Configuration:** kebab-case (e.g., `vite.config.ts`, `playwright.config.ts`)
- **Tool directories:** kebab-case (e.g., `ai-readiness`, `leadership-dna`, `vision-canvas`)

**Directories:**
- **Tool modules:** `src/tools/{tool-id}/` (kebab-case)
- **Feature areas:** lowercase (e.g., `components/`, `store/`, `engine/`)
- **Grouping subdirs:** descriptive (e.g., `report/charts/`, `components/ui/`, `tests/helpers/`)

**Functions & Variables:**
- **Tool IDs:** kebab-case (e.g., `'ai-readiness'`, `'leadership-dna'`)
- **Synthesis rule IDs:** SCREAMING_SNAKE_CASE with prefix (e.g., `'V2_vision_execution_mismatch'`)
- **Component hooks:** camelCase with `use` prefix (e.g., `useWorkspaceStore()`)
- **Local state:** camelCase (e.g., `activeQuadrant`, `textInput`, `confidence`)

**Route Paths:**
- Pattern: `/tools/{tool-id}` (e.g., `/tools/ai-readiness`, `/tools/swot`)
- Root: `/` (Dashboard)

## Where to Add New Code

**New Tool:**
1. Create `src/tools/{tool-id}/` directory
2. Create `{ToolName}.tsx` with main component (reads/writes via `useWorkspaceStore`)
3. Create `index.ts` exporting `ToolDefinition` with id, name, description, path (`/tools/{tool-id}`), icon (from lucide-react), component, optional validationProfileId
4. Create `types.ts` (optional) for tool-specific data types
5. Add import and `registerTool()` call in `src/registry/registry.ts`
6. (Optional) Create validation profile in `src/validation/profiles_p*.ts` and register in `src/validation/index.ts`

**New Synthesis Rule:**
1. Create rule in `src/engine/rules-v2.ts` as a `SynthesisRule` object
2. Implement `execute(workspace)` function that accesses `workspace.tools[toolId]` and returns `Insight | null`
3. Add rule to `rulesV2` array in `src/engine/rules-v2.ts`
4. Test by updating relevant tool data and checking `state.insights` via dashboard

**New Validation Profile:**
1. Create profile in appropriate `src/validation/profiles_p*.ts` file (p1 = basic tools, p2 = SWOT/Vision/SOP, p3 = advanced tools)
2. Implement profile: `{ id: 'toolname_v1', validate(data) { return ValidationIssue[] } }`
3. Register in `src/validation/index.ts` via `registerProfile(profile)`
4. Reference in tool's `ToolDefinition` via `validationProfileId: 'toolname_v1'`

**Shared UI Component:**
1. Create in `src/components/ui/` (for primitives) or `src/components/{feature}/` (for feature-specific)
2. Export from component file
3. Import and use in tools/reports/layout

**Report Page:**
1. Create in `src/report/individual/` as `{ToolName}Report.tsx`
2. Read tool data via `useWorkspaceStore(state => state.tools[toolId])`
3. Render charts + narrative using `ReportPage`, `ReportTypography`, chart components from `src/report/charts/`
4. Export from `src/report/individual/index.ts`
5. Import and render in ReportCenter tool

**Test:**
1. Create `.spec.ts` file in `tests/journeys/`, `tests/smoke/`, or `tests/personas/` as appropriate
2. Use Playwright test API (`test()`, `expect()`)
3. Use helpers from `tests/helpers/*.ts` for navigation, form filling, workspace operations
4. Run with `npm run test:e2e`

## Special Directories

**src/scripts/**
- Purpose: Standalone verification scripts (run outside normal build)
- Generated: No (user-created as needed)
- Committed: Yes
- Note: Excluded from TypeScript compilation via `tsconfig.app.json` → `exclude: ["src/scripts"]`

**dist/**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (.gitignore)
- Contents: Optimized JavaScript, CSS, and assets for Firebase deployment

**test-outputs/**
- Purpose: Playwright test output files (screenshots, videos, PDFs)
- Generated: Yes (by `npm run test:e2e`)
- Committed: No (.gitignore)

**.planning/**
- Purpose: GSD workflow documentation (ROADMAP, REQUIREMENTS, STATE, PROJECT, codebase analysis)
- Generated: Yes (by GSD orchestrator)
- Committed: Yes

---

*Structure analysis: 2026-02-14*
