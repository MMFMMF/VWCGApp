# Codebase Structure

**Analysis Date:** 2025-02-15

## Directory Layout

```
VWCGApp/
├── .agent/                      # GSD agent workflow definitions (local, not committed)
├── .firebase/                   # Firebase deployment config (local)
├── .git/                        # Git repository metadata
├── .planning/                   # GSD planning artifacts
│   ├── codebase/               # Codebase analysis docs (ARCHITECTURE.md, STRUCTURE.md, etc.)
│   ├── quick/                  # Quick fix planning documents by phase
│   └── config.json             # GSD configuration
├── dist/                        # Production build output (generated, not committed)
│   └── assets/                 # Bundled JS, CSS, images
├── docs/                        # Project documentation
├── node_modules/               # Dependencies (local, not committed)
├── playwright-report/          # E2E test reports (generated)
├── public/                      # Static assets served as-is
├── scripts/                     # Build/utility scripts (Node.js)
│   ├── generate-pdf.cjs        # PDF generation for testing
│   ├── screenshot-pdf.cjs      # Screenshot-based PDF creation
│   └── audit-pdf.cjs           # PDF audit utilities
├── src/                         # Source code (TypeScript + React)
│   ├── App.tsx                 # Root router and layout
│   ├── App.css                 # Global styles
│   ├── main.tsx                # Entry point with initialization
│   ├── index.css               # Tailwind imports
│   ├── assets/                 # Images, icons, media
│   ├── components/             # Reusable React components
│   │   ├── ErrorBoundary.tsx   # Error boundary wrapper
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   └── StrategicHealthWidget.tsx  # Health status display
│   │   ├── layout/             # Layout components
│   │   │   ├── AppShell.tsx    # Main shell: sidebar + topbar + outlet
│   │   │   └── SafeModeBanner.tsx         # Safe mode overlay
│   │   ├── print/              # Print-only components
│   │   │   └── PrintReport.tsx # Report printer (no AppShell)
│   │   └── ui/                 # UI primitives
│   │       ├── Button.tsx      # Styled button component
│   │       └── ExportButton.tsx # Export functionality
│   ├── engine/                 # Synthesis engine and rules
│   │   ├── index.ts            # Public API barrel export
│   │   ├── types.ts            # Insight, SynthesisRule interfaces
│   │   ├── synthesis.ts        # Rule executor, registerRule()
│   │   ├── rules-v2.ts         # 8 cross-tool v2 rules (active)
│   │   ├── rules.ts            # Old v1 rules E1-E5 (legacy, not imported)
│   │   ├── derived-metrics.ts  # 6 derived metrics (archetype, risk, coherence)
│   │   ├── swot-keywords.ts    # SWOT text scanning and keyword analysis
│   │   ├── cloud.ts            # Optional Gemini API integration
│   │   ├── prompts.ts          # LLM prompt templates
│   │   └── llm/                # LLM-related utilities
│   ├── lib/                    # Utilities and initialization
│   │   └── charts.ts           # Chart.js plugin registration
│   ├── registry/               # Tool registry system
│   │   ├── ToolRegistry.ts     # Registry interface and functions
│   │   └── registry.ts         # Tool registration (all 12 tools)
│   ├── report/                 # Report generation system
│   │   ├── design.ts           # Design constants (colors, spacing)
│   │   ├── charts/             # Reusable chart components
│   │   │   ├── HorizontalBar.tsx
│   │   │   ├── DotPlot.tsx
│   │   │   ├── Gauge.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── components/         # Report typography and layout
│   │   ├── individual/         # Per-tool report components
│   │   │   ├── AIReadinessReport.tsx
│   │   │   ├── LeadershipDNAReport.tsx
│   │   │   ├── SwotReport.tsx
│   │   │   ├── VisionCanvasReport.tsx
│   │   │   ├── RoadmapReport.tsx
│   │   │   ├── AdvisorReadinessReport.tsx
│   │   │   └── index.ts
│   │   ├── narrative/          # Text generation system
│   │   │   ├── types.ts        # Voice and template types
│   │   │   ├── voice.ts        # Voice profiles (professional, conversational, strategic)
│   │   │   ├── templates.ts    # Section text templates
│   │   │   ├── generator.ts    # Template renderer with voice interpolation
│   │   │   └── index.ts
│   │   ├── unified/            # Cross-tool briefings
│   │   │   ├── UnifiedStrategicBriefing.tsx
│   │   │   ├── LLMStrategicBriefing.tsx
│   │   │   └── index.ts
│   │   ├── quality/            # Content quality checks
│   │   │   └── {Detectors}.ts  # VagueEntryDetector, EdgeCaseDetector
│   │   ├── pdf/                # PDF generation
│   │   │   ├── PdfGenerator.ts # html2canvas + jsPDF (300 DPI, 3x scale)
│   │   │   ├── PrintPdfService.ts # Browser print dialog wrapper
│   │   │   └── index.ts
│   ├── scripts/                # Standalone scripts (excluded from TypeScript)
│   │   └── {verification-scripts}.ts  # Run outside normal build
│   ├── store/                  # State management
│   │   └── workspaceStore.ts   # Zustand store with persist middleware
│   ├── tools/                  # Tool implementations (12 registered tools)
│   │   ├── ai-readiness/       # AI Readiness Assessment
│   │   │   ├── index.ts        # ToolDefinition export
│   │   │   └── AiReadinessTool.tsx
│   │   ├── leadership-dna/     # Leadership DNA Assessment
│   │   ├── emotional-intelligence/  # Behavioral/EI Assessment (BEI)
│   │   ├── vision-canvas/      # Strategic Vision Canvas
│   │   ├── swot/               # SWOT Analysis
│   │   │   ├── index.tsx       # ToolDefinition export
│   │   │   ├── SwotTool.tsx    # Main component
│   │   │   └── SwotMatrix.tsx  # Matrix visualization
│   │   ├── sop/                # Standard Operating Procedures (3 sub-tools)
│   │   │   ├── sop-taxonomy/   # SOP Taxonomy
│   │   │   ├── sop-create/     # SOP Creation
│   │   │   └── sop-management/ # SOP Management
│   │   ├── roadmap/            # 90-Day Roadmap
│   │   ├── advisor-readiness/  # Advisor Readiness Assessment
│   │   ├── report/             # Report Center / Report Tool
│   │   ├── business-context/   # Business Context Tool
│   │   ├── dashboard/          # Dashboard (not in registry, home page)
│   │   └── authority/          # Authority Tracker (not in registry)
│   ├── utils/                  # Utility functions
│   │   ├── cn.ts              # Classname composition (clsx + tailwind-merge)
│   │   └── fileSystem.ts      # Save/load workspace to .vwcg files
│   └── validation/             # Validation system
│       ├── index.ts            # Initialization and profile registration
│       ├── types.ts            # ValidationResult, ValidationRule types
│       ├── validator.ts        # Workspace validator orchestrator
│       ├── profiles_p1.ts      # Validation profiles (part 1)
│       ├── profiles_p2.ts      # Validation profiles (part 2)
│       └── profiles_p3.ts      # Validation profiles (part 3)
├── tests/                      # E2E and integration tests (Playwright)
│   ├── helpers/                # Test utilities
│   │   ├── forms.ts            # Form filling helpers
│   │   ├── navigation.ts       # Navigation helpers
│   │   ├── workspace.ts        # Workspace manipulation
│   │   └── pdf.ts              # PDF generation helpers
│   ├── journeys/               # User journey E2E tests
│   │   ├── alex.spec.ts        # Alex persona journey
│   │   ├── sarah.spec.ts       # Sarah persona journey
│   │   ├── mike.spec.ts        # Mike persona journey
│   │   ├── pdf-generation.spec.ts      # PDF export tests
│   │   ├── pdf-generation-extended.spec.ts
│   │   └── quality-audit.spec.ts       # Content quality checks
│   ├── personas/               # Test data / personas
│   │   ├── alex.ts
│   │   ├── sarah.ts
│   │   ├── mike.ts
│   │   ├── carmen.ts
│   │   ├── david.ts
│   │   ├── diana.ts
│   │   ├── keisha.ts
│   │   ├── lin.ts
│   │   ├── raj.ts
│   │   └── tom.ts
│   └── smoke/                  # Smoke tests (if present)
├── test-results/               # Test output directory (generated)
├── test-outputs/               # Playwright report outputs (generated)
│
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── tsconfig.json               # TypeScript references config
├── tsconfig.app.json           # App TypeScript config (strict mode, path aliases)
├── tsconfig.node.json          # Node scripts TypeScript config
├── vite.config.ts              # Vite build and dev server config
├── playwright.config.ts        # E2E test runner configuration
├── eslint.config.js            # ESLint rules and plugins
├── postcss.config.js           # PostCSS config (Tailwind processor)
├── firebase.json               # Firebase Hosting config
├── .firebaserc                  # Firebase project config (local)
├── .nvmrc                       # Node version hint
│
├── CLAUDE.md                   # Project-specific Claude Code instructions
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # Project license
├── README.md                   # Project overview
└── CHANGELOG.md                # Version and change history
```

## Directory Purposes

**src/components:**
- Purpose: Reusable and layout React components
- Contains: Error boundary, layout shell, print routes, UI primitives (Button, etc.), dashboard widgets
- Key files: `AppShell.tsx` (main layout), `ErrorBoundary.tsx` (error handling), `PrintReport.tsx` (PDF-ready rendering)

**src/engine:**
- Purpose: Cross-tool synthesis logic, rule execution, and derived metrics
- Contains: Active v2 rules (8 rules), derived metrics (6 metrics), SWOT keyword analysis, rule registry
- Key files: `synthesis.ts` (executor), `rules-v2.ts` (active rules), `derived-metrics.ts` (computed values)
- **Note:** Old `rules.ts` (v1 rules E1-E5) exists but is **not imported** by synthesis.ts — kept for reference only

**src/registry:**
- Purpose: Tool definition interface and dynamic registration system
- Contains: `ToolRegistry.ts` (interface, functions), `registry.ts` (registration of all 12 tools)
- Key files: `ToolRegistry.ts` defines contract; `registry.ts` registers each tool via `registerTool()`

**src/report:**
- Purpose: Comprehensive report generation system with per-tool + unified reports, narrative templates, and PDF export
- Contains: 6 subdirectories for charts, narrative, individual reports, unified briefings, PDF generation, quality checks
- Key subdirectories:
  - `charts/`: HorizontalBar, DotPlot, Gauge, ProgressBar components
  - `individual/`: Per-tool reports (AIReadiness, LeadershipDNA, SWOT, VisionCanvas, Roadmap, AdvisorReadiness)
  - `narrative/`: Text generation with voice/tone (professional, conversational, strategic)
  - `unified/`: UnifiedStrategicBriefing, LLMStrategicBriefing
  - `pdf/`: PdfGenerator (html2canvas + jsPDF), PrintPdfService (browser print)
  - `quality/`: Detectors for vague entries and edge cases

**src/store:**
- Purpose: Single global state container with persistence
- Contains: Zustand store with `persist` middleware to localStorage
- Key file: `workspaceStore.ts` (state, actions, selectors, LOGIC_VERSION constant)

**src/tools:**
- Purpose: Individual tool implementations (12 registered + 2 non-registered)
- Contains: One subdirectory per tool, each with `index.ts` exporting `ToolDefinition`
- Registered tools (12): ai-readiness, leadership-dna, emotional-intelligence, vision-canvas, swot, sop-taxonomy, sop-create, sop-management, roadmap, advisor-readiness, report, business-context
- Non-registered: dashboard (home page), authority (tracker)

**src/utils:**
- Purpose: Reusable utility functions
- Contains: ClassNames composition (`cn.ts`), file I/O for workspace save/load (`fileSystem.ts`)

**src/validation:**
- Purpose: Multi-level workspace validation (L0-L3)
- Contains: Validator orchestrator, per-tool validation profiles split across 3 files
- Key files: `validator.ts` (runner), `profiles_p*.ts` (per-tool rules)

**tests/:**
- Purpose: E2E and journey tests (Playwright)
- Contains: User journey tests, persona data, helper utilities
- Key files: `tests/journeys/*.spec.ts` (test cases), `tests/personas/*.ts` (test data)

## Key File Locations

**Entry Points:**
- `src/main.tsx`: App initialization with registry/validation/charts setup
- `src/App.tsx`: Router configuration and workspace initialization
- `src/components/print/PrintReport.tsx`: Clean report rendering for PDF (route `/report/print/:reportType`)

**Configuration:**
- `vite.config.ts`: Build config with `@` alias to `src/`
- `tsconfig.app.json`: TypeScript strict mode, path alias, compiler options
- `playwright.config.ts`: E2E test runner (Chromium, base URL `http://localhost:5173`)
- `eslint.config.js`: Linting rules
- `firebase.json`: Firebase Hosting config (serves from `dist/`)

**Core Logic:**
- `src/store/workspaceStore.ts`: All workspace state, LOGIC_VERSION, actions (updateToolData, stageWorkspace, commitWorkspace, exportState)
- `src/engine/synthesis.ts`: Rule executor and registry
- `src/engine/rules-v2.ts`: 8 active synthesis rules (vision-execution, values-reality, priorities-alignment, etc.)
- `src/registry/registry.ts`: Tool registration (all 12 tool definitions imported here)

**Testing:**
- `tests/journeys/`: User journey E2E tests (alex, sarah, mike personas)
- `tests/personas/`: Test data (10 personas with pre-filled assessments)
- `tests/helpers/`: Reusable test utilities (forms, navigation, workspace, pdf)

## Naming Conventions

**Files:**
- **React Components**: PascalCase with `.tsx` extension (e.g., `AppShell.tsx`, `SwotTool.tsx`, `AIReadinessReport.tsx`)
- **Types/Interfaces**: `.ts` files, exported as types (e.g., `types.ts`)
- **Utilities**: camelCase with `.ts` extension (e.g., `fileSystem.ts`, `cn.ts`)
- **Configuration**: kebab-case (e.g., `vite.config.ts`, `playwright.config.ts`)
- **Test Files**: `.spec.ts` or `.test.ts` suffix (e.g., `alex.spec.ts`)

**Directories:**
- **Tools**: kebab-case matching tool ID (e.g., `ai-readiness`, `leadership-dna`, `sop-taxonomy`)
- **Report subdirectories**: lowercase (e.g., `charts/`, `narrative/`, `individual/`, `unified/`)
- **Components**: Feature-based grouping (e.g., `components/layout/`, `components/ui/`, `components/dashboard/`)

**Functions/Variables:**
- camelCase for functions, variables, and store selectors
- UPPERCASE_SNAKE_CASE for constants (e.g., `LOGIC_VERSION`, `STORAGE_KEY`, `CAPTURE_SCALE`)

**Types/Interfaces:**
- PascalCase (e.g., `ToolDefinition`, `WorkspaceState`, `Insight`, `SynthesisRule`)
- Type imports use `import type` (required by `verbatimModuleSyntax`)

## Where to Add New Code

**New Tool:**
1. Create `src/tools/{tool-id}/` directory
2. Create `src/tools/{tool-id}/index.ts` exporting `ToolDefinition` with all required fields
3. Create `src/tools/{tool-id}/{ToolName}Tool.tsx` (main component)
4. Import and register in `src/registry/registry.ts` via `registerTool(toolDefinition)`
5. Optionally create validation profile in `src/validation/profiles_p*.ts` and reference via `validationProfileId`

**New Report Component (Per-Tool):**
1. Create `src/report/individual/{Tool}Report.tsx`
2. Export from `src/report/individual/index.ts`
3. Import in report layout/container (usually `UnifiedStrategicBriefing.tsx` or report tool)

**New Synthesis Rule:**
1. Add to `rulesV2` array in `src/engine/rules-v2.ts`
2. Export from barrel export `src/engine/index.ts` if public
3. Bump `LOGIC_VERSION` in `src/store/workspaceStore.ts`

**New Chart Type:**
1. Create `src/report/charts/{ChartType}.tsx` as React component
2. Use Chart.js or D3 for rendering
3. Export from chart components and import in report components

**Shared Utility:**
1. Functions: `src/utils/{utilityName}.ts` (e.g., `dateFormat.ts`)
2. Constants: Define in relevant layer or in `src/lib/constants.ts` (if created)
3. Types: Define in `src/engine/types.ts` or domain-specific `types.ts`

**Validation Profile:**
1. Add to appropriate `src/validation/profiles_p*.ts` file (split evenly)
2. Register in `src/validation/index.ts` via `registerValidationProfile()`
3. Reference tool's `validationProfileId` field

**Test Helper:**
1. Create in `tests/helpers/{utilityName}.ts`
2. Import and use in test files (`tests/journeys/*.spec.ts`)

**Standalone Script:**
1. Create in `src/scripts/{scriptName}.ts`
2. Must be **excluded from TypeScript compilation** (already in `tsconfig.app.json`)
3. Run via `npx ts-node src/scripts/{scriptName}.ts` or custom npm script

## Special Directories

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (listed in `.gitignore`)

**dist/:**
- Purpose: Production build output
- Generated: Yes (via `npm run build`)
- Committed: No
- Contents: Bundled JS, CSS, images optimized for deployment

**src/scripts/:**
- Purpose: Standalone verification/utility scripts excluded from main TypeScript build
- Excluded from: TypeScript compilation (via `tsconfig.app.json` exclude list)
- Run separately: Via Node.js or ts-node

**.planning/:**
- Purpose: GSD orchestrator artifacts and planning documents
- Committed: Yes (except `.agent/` and `.firebase/`)
- Subdirectories: `codebase/` (ARCHITECTURE.md, STRUCTURE.md, etc.), `quick/` (phase plans), `config.json`

**public/:**
- Purpose: Static assets served as-is by Vite dev server and Firebase Hosting
- Committed: Yes
- Contents: Favicons, fonts, static images

**tests/:**
- Purpose: E2E tests via Playwright
- Test config: `playwright.config.ts` (base URL, browser, reporter)
- Auto-start: Dev server started automatically when tests run
- Reports: Generated to `test-results/`, `test-outputs/`, or `playwright-report/`

---

*Structure analysis: 2025-02-15*
