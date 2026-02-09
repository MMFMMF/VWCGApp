# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VWCGApp is a multi-tool business assessment platform for analyzing organizational readiness across strategy, operations, and execution dimensions. Built with Astro 5 + React 19, deployed on Netlify.

**Site:** https://vwcgapp.com

## Commands

```bash
npm run dev        # Dev server at localhost:4321
npm run build      # Production build to ./dist/
npm run preview    # Preview production build locally
npm run analyze    # Build + generate bundle report at dist/stats.html
```

No test runner or linter is configured. Utility scripts at the root:

```bash
node test-registry.js      # Verify tool/rule registration
node verify-synthesis.js   # Evaluate synthesis rules against workspace data
```

## Architecture

### Dual Rendering Strategy

- **Marketing pages** (`src/pages/index.astro`, blog): Astro static HTML with selective React islands for interactivity (`src/components/islands/`)
- **App** (`src/pages/app/[...tool].astro`): Full React SPA using `react-router-dom` with `basename="/app"`. The Astro catch-all page renders `AssessmentApp.tsx`, which dynamically generates routes from the tool registry. SPA routes: `/app/` (dashboard), `/app/tools/:toolId` (individual tool). `AssessmentApp` waits 100ms for Zustand store hydration before rendering.

Netlify rewrites `/app/*` to `/app/index.html` for SPA routing.

### Component Directory Structure

| Directory | Purpose |
|-----------|---------|
| `components/tools/` | Assessment tool React components (registered via tool registry) |
| `components/islands/` | React islands hydrated on marketing pages (`client:load`) |
| `components/marketing/` | Astro components for the landing page sections |
| `components/AssessmentApp.tsx` | Root React SPA component |
| `components/ToolWrapper.tsx` | Connects tool components to Zustand store |

### Layouts

Three Astro layouts with inheritance: `BaseLayout.astro` (shared head, fonts, global CSS) → `MarketingLayout.astro` (SEO, nav, marketing chrome) and `AppLayout.astro` (minimal shell for the React SPA).

### Blog

Astro content collections in `src/content/blog/`. Schema defined in `src/content/config.ts` (title, description, pubDate, author, tags, draft flag). Pages at `/blog` (list) and `/blog/[slug]` (individual posts).

### Tool Registry System

Tools self-register on import via a singleton `toolRegistry` (`src/lib/tools/toolRegistry.ts`). Importing a tool file triggers registration — no hardcoded tool list exists. The barrel file `src/lib/tools/index.ts` imports all tools to ensure registration.

Each tool implements `ToolDefinition` with metadata, a React component receiving `ToolProps` (`data`, `onUpdate`, `readonly`), and optional `validate`/`exportToPDF`/`getDefaultData` methods. `ToolWrapper` connects tools to the Zustand store.

To add a tool: create a component following `ExampleTool.tsx`, define its `ToolDefinition`, call `toolRegistry.register()`, and add the import to `src/lib/tools/index.ts`.

Current registered tools (in order): `example`, `ai-readiness`, `leadership-dna`, `business-eq`, `vision-canvas`, `swot-analysis`, `advisor-readiness`, `financial-readiness`, `sop-maturity`, `roadmap`, `insights-dashboard`, `report-center`.

### Synthesis Rule Engine

Cross-tool analysis rules self-register via `synthesisRuleRegistry` (`src/lib/synthesis/ruleRegistry.ts`) using the same import-triggered pattern. Rules evaluate cross-tool data and produce prioritized `Insight[]` objects (severity 1-5, types: gap/warning/opportunity/strength).

Synthesis runs automatically 500ms after any tool data update. Rules are in `src/lib/synthesis/rules/` with naming convention `E{N}-{description}.ts` where N is the severity/priority number (1 = highest). Use `_template.ts` for new rules. Add imports to `src/lib/synthesis/rules/index.ts`.

### State Management (Zustand)

Two stores with strict separation:

- **`workspaceStore.ts`** — Persisted to localStorage (`vwcg-workspace`). Holds workspace metadata, all tool data, insights, and synthesis results. Versioned for future migrations.
- **`uiStore.ts`** — NOT persisted. Holds ephemeral UI state (current tool, modals, sidebar, theme).

Custom hooks in `src/hooks/` provide granular subscriptions (`useWorkspace`, `useToolData(id)`, `useIsToolCompleted(id)`, `useInsights`, `useSynthesis`).

### Teaser Bridge

The landing page mini-assessment stores answers in localStorage (`vwcg-teaser-answers`). On app mount, `loadTeaserAnswers()` bridges this data into the AI Readiness tool if it hasn't been modified yet. Answers expire after 24 hours.

### Browser Storage Keys

| Key | Storage | Owner | Purpose |
|-----|---------|-------|---------|
| `vwcg-workspace` | localStorage | `workspaceStore` | All workspace data, tool responses, insights |
| `vwcg-teaser-answers` | localStorage | `MiniAssessmentIsland` | Landing page mini-assessment answers (24h TTL) |

### Workspace File Format

Workspaces export as `.vwcg` files (JSON with version, timestamp, and full workspace state). Import/export logic lives in `src/lib/workspace/`.

## Path Aliases

Configured in both `astro.config.mjs` and `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@` | `./src` |
| `@components` | `./src/components` |
| `@layouts` | `./src/layouts` |
| `@lib` | `./src/lib` |
| `@stores` | `./src/stores` |
| `@types` | `./src/types` |
| `@hooks` | `./src/hooks` |

## Key Conventions

- **Tool IDs:** kebab-case (e.g., `ai-readiness`)
- **File naming:** PascalCase for React components, kebab-case for utilities
- **Synthesis rule files:** `{level}-{description}.ts` (e.g., `E1-execution-gap.ts`)
- **Commit messages:** Conventional commits with phase prefix — `feat(08-01):`, `fix(09-02):`, `perf(11):`, `docs(v1.1):`

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (not the older `@astrojs/tailwind` integration). Global styles in `src/styles/global.css`. Utility pattern: `clsx` + `tailwind-merge` via `cva` (class-variance-authority) for component variants. Fonts: Inter (body) and Lexend (headings), set in `global.css`.

## UI Dependencies

- **Radix UI** — Dialog, Select, Slider primitives (unstyled, accessible)
- **Lucide React** — Icon library
- **Recharts** + **react-circular-progressbar** — Charts and gauges
- **jsPDF** — Client-side PDF generation (used by tool `exportToPDF` methods and `ReportCenterTool`)

## Build Optimizations

- Manual Rollup chunk splitting: `react-vendor`, `charts` (recharts), `radix-ui`
- CSS inlining for stylesheets < 4KB
- Self-hosted fonts via `@fontsource` (Inter + Lexend) — no CDN
- Aggressive cache headers for `/_astro/*` assets (1 year, immutable)

## Deployment

- **Platform:** Netlify
- **Node:** 22 (set in `netlify.toml`)
- **Build:** `npm run build` → `dist/`
- **Security headers:** X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy

## Gotchas

- **`client:only="react"` required for `AssessmentApp`** — It uses `BrowserRouter` which accesses `window`. Using `client:load` instead will cause SSR errors.
- **Tool registration is import-driven** — If you create a new tool but forget to add its import to `src/lib/tools/index.ts`, it will silently not appear. Same for synthesis rules in `src/lib/synthesis/rules/index.ts`.
- **SSR-safe storage access** — All `localStorage`/`sessionStorage`/`window` usage must be guarded with `typeof window !== 'undefined'` checks. See `workspaceStore.ts` for the pattern.
- **Stale `ToolId` type** — `src/types/workspace.ts` defines `ToolId` as `'vision' | 'workload-capacity-gap' | 'capability-model'`, but the actual registered tools are `ai-readiness`, `leadership-dna`, `business-eq`, etc. `ToolWrapper` uses `as any` casts to work around this. Known tech debt.
- **Tool categories** — `ToolMetadata.category` is typed as `'assessment' | 'planning' | 'sop' | 'synthesis'` in `src/types/tool.ts`. New tools must use one of these.
- **`@hooks` alias mismatch** — `@hooks` is defined in `tsconfig.json` but missing from `astro.config.mjs` Vite aliases. TypeScript resolves it, but Vite build may not. Use relative imports or `@/hooks/` instead until this is fixed.
