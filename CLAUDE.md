# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

VWCGApp (Value-Weighted Capability Gap Application) is an Astro SSG site with a React SPA island for strategic business assessment. The marketing landing page (`/`), blog (`/blog/*`), and invite page (`/invite`) are static Astro pages. The React SPA mounts at `/app/*` via `client:only="react"` and provides 12 integrated tools (AI Readiness, Leadership DNA, BEI, Vision Canvas, SWOT, SOP Taxonomy/Creation/Management, 90-Day Roadmap, Advisor Readiness, Report Center, Business Context). Deployed to Netlify at https://sparkly-speculoos-87b564.netlify.app/.

## Commands

```bash
npm run dev                  # Astro dev server at localhost:4321
npm run build                # TypeScript check + Astro production build (tsc -b && astro build)
npm run lint                 # ESLint across all .ts/.tsx files
npm run preview              # Preview production build locally (Astro preview)
npm run test:e2e             # Playwright E2E tests (auto-starts dev server)
npm run test:e2e:ui          # Playwright with interactive UI mode
npm run test:e2e:headed      # Playwright in headed browser
npm run test:e2e:generate-pdfs  # Run PDF generation journey test
npm run pdf:print            # Generate print-ready PDF via Puppeteer

# Run a single test file
npx playwright test tests/journeys/alex.spec.ts

# Run tests matching a grep pattern
npx playwright test -g "pattern"
```

**E2E Tests:** Playwright (Chromium only) with tests in `tests/` — subdirs: `smoke/`, `journeys/`, `helpers/`. Config in `playwright.config.ts`, base URL `http://localhost:5173`. Test outputs go to `test-outputs/`. The dev server auto-starts for test runs. The `src/scripts/` directory contains standalone verification scripts that run outside the normal build and are excluded from TypeScript compilation.

## Architecture

**Stack:** Astro 5 + React 19 + TypeScript 5.9 + TailwindCSS 3.4 (PostCSS) + Zustand 5.0 + Chart.js/D3 + React Router 7 + lucide-react icons

**Path alias:** `@/` maps to `src/` (configured in both vite.config.ts and tsconfig.app.json)

### Startup Sequence

`main.tsx` runs three initializers before rendering: `initializeRegistry()` → `initializeValidation()` → `registerCharts()`. Then `App.tsx` checks if `metadata.id` exists in the persisted store; if not, calls `resetWorkspace()` to create a fresh workspace with a new UUID.

### Core Systems

**Tool Registry** (`src/registry/`): Two files — `ToolRegistry.ts` defines the `ToolDefinition` interface and the `registerTool`/`getTools`/`getTool` functions; `registry.ts` imports all 12 tool definitions and calls `registerTool()` for each. Routes are generated dynamically in `App.tsx` by mapping over `getTools()`.

**Workspace Store** (`src/store/workspaceStore.ts`): Single Zustand store with `persist` middleware (localStorage key: `vwcg-workspace`). All tool data lives under `state.tools[toolId]`. The store has two state categories:
- **Persisted:** `version`, `metadata`, `tools`, `provenance` (via `partialize`)
- **Ephemeral:** `isSafeMode`, `previewData`, `validationResults`, `insights`, `lastExportTime`

Every call to `updateToolData()` triggers the Synthesis Engine synchronously and updates provenance with `LOGIC_VERSION`. On rehydration from localStorage, insights are recomputed via `queueMicrotask` in `onRehydrateStorage`.

**Synthesis Engine** (`src/engine/`): 8 cross-tool v2 rules in `rules-v2.ts` that generate `Insight[]` on every tool data update. The engine also provides `computeDerivedMetrics()` (6 derived metrics including leadership archetype and revenue risk), `scanSwotText()` for SWOT keyword analysis, and optional AI consultation via Gemini 1.5 Flash (`cloud.ts`). `runSynthesis()` executes all registered rules and sorts results by severity (high → low). The barrel export `src/engine/index.ts` is the public API — import from `@/engine` rather than individual files. The old v1 rules (`rules.ts`, E1-E5) still exist in the codebase but are no longer imported by `synthesis.ts`.

**Report System** (`src/report/`): Comprehensive reporting layer with 6 subdirectories:
- `charts/` — Reusable chart components (HorizontalBar, DotPlot, Gauge, ProgressBar)
- `components/` — Report typography and page layout primitives
- `narrative/` — Template-driven narrative text generation with voice/tone system
- `individual/` — Per-tool report components (AIReadiness, LeadershipDNA, SWOT, VisionCanvas, Roadmap, AdvisorReadiness)
- `unified/` — UnifiedStrategicBriefing and LLMStrategicBriefing (cross-tool executive summary)
- `pdf/` — PdfGenerator (jsPDF + html2canvas at 300 DPI/3x scale) and PrintPdfService (browser print dialog)
- `quality/` — VagueEntryDetector and EdgeCaseDetector for report content quality

**Validation System** (`src/validation/`): L0-L3 validation with per-tool profiles registered at startup via `initializeValidation()`. Profiles are split across `profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts`. Profile IDs are referenced by each tool's `validationProfileId` field. The validator runs during workspace import (Safe Mode).

**Safe Mode** (`stageWorkspace` → `commitWorkspace`): Protected import workflow that validates workspace files before applying them. Workspace files use `.vwcg` extension (JSON format). `stageWorkspace` runs validation and sets `isSafeMode: true`; `commitWorkspace` applies the data and exits Safe Mode. `loadWorkspace` is a convenience wrapper that stages then auto-commits.

### Data Flow

```
User edits tool UI → updateToolData(toolId, data)
  → merges into state.tools[toolId]
  → updates provenance[toolId] with timestamp + LOGIC_VERSION
  → runs runSynthesis() synchronously → updates state.insights
  → Zustand persist middleware saves {version, metadata, tools, provenance} to localStorage
```

### Adding a New Tool

1. Create `src/tools/<tool-name>/` with the tool component and an `index.ts` exporting a `ToolDefinition` (id, name, description, path, icon from lucide-react, component, optional validationProfileId)
2. Import and register it in `src/registry/registry.ts` via `registerTool()`
3. Optionally create a validation profile in `src/validation/` and register it in `src/validation/index.ts`
4. Tool data is automatically persisted under `state.tools[toolId]` — read via `useWorkspaceStore(state => state.tools[toolId])`, write via `updateToolData(toolId, data)`

### Adding a Synthesis Rule

Add a `SynthesisRule` to the `rulesV2` array in `src/engine/rules-v2.ts`. Each rule has `id`, `name`, `description`, and an `execute(workspace) → Insight | null` function. Rules can use `computeDerivedMetrics()` and `scanSwotText()` helpers from the engine.

### Routing

**Astro routes** (static pages):
- `/` — Marketing homepage (`src/pages/index.astro`)
- `/blog` — Blog listing (`src/pages/blog/index.astro`)
- `/blog/{slug}` — Individual blog posts (`src/pages/blog/[...slug].astro`)
- `/invite` — Invite gate page (`src/pages/invite.astro`) — redirects to `/assessment` after auth
- `/assessment` — React SPA mount point (`src/pages/assessment/[...tool].astro`)

**React SPA routes** (inside `AssessmentApp.tsx` with `basename="/assessment"`):
- `/assessment/` — Dashboard
- `/assessment/tools/{tool-id}` — Dynamic routes from registry
- `/assessment/*` — Catch-all redirects to `/assessment/`

**Netlify redirects:** `/app/*` → `/assessment/` (301), domain redirects for businessadvisors.app and *.vwcg.app

**Blog system:** Astro content collections in `src/content/blog/` (Markdown). Schema in `src/content/config.ts` — required fields: `title`, `description`, `pubDate` (date); optional: `updatedDate`, `heroImage`, `author` (default "World Consulting Group"), `tags` (string[]), `draft` (boolean). Slug is inferred from filename. Blog post template includes JSON-LD, Open Graph, Twitter Cards, reading time.

The Dashboard and the `authority-tracker` tool exist in `src/tools/` but are not part of the 12-tool registry.

### Layout

`AppShell` (`src/components/layout/AppShell.tsx`) provides the sidebar nav + topbar + content area. React Router with `<Outlet/>` renders tool components. The sidebar dynamically lists all registered tools from `getTools()` plus a Dashboard link. The topbar shows workspace name, Save/Load buttons, and a logic version upgrade banner when `LOGIC_VERSION` changes.

### Key Conventions

- Tool IDs are kebab-case strings (e.g., `ai-readiness`, `sop-create`, `leadership-dna`)
- Tool routes follow `/tools/<tool-id>` pattern
- `cn()` utility (`src/utils/cn.ts`) wraps clsx + tailwind-merge for className composition
- All icons come from `lucide-react`
- Provenance tracking: every tool update records `{ timestamp, logicVersion }` under `state.provenance[toolId]`
- Export uses canonical JSON serialization (sorted keys) and has a 5-second cooldown between exports
- Workspace metadata includes `schema_version: 'v1'` and `computed_under_logic_version`
- `LOGIC_VERSION` constant in `workspaceStore.ts` (currently `v1.1.0`) — bump this when changing synthesis rules or validation logic

### TypeScript

Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`, `verbatimModuleSyntax`. Target ES2022. The `src/scripts/` directory is excluded from TypeScript compilation. Uses `type` keyword for type-only imports (required by `verbatimModuleSyntax`). No enums allowed — use string unions instead (`erasableSyntaxOnly`).

### Environment

Optional `VITE_GEMINI_API_KEY` env var enables AI Consultation features (Gemini 1.5 Flash). App works fully without it.
