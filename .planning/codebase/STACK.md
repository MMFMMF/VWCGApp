# Technology Stack

**Analysis Date:** 2025-02-15

## Languages

**Primary:**
- TypeScript 5.9 - Entire codebase (`src/**/*.ts`, `src/**/*.tsx`)
- JavaScript - Node.js scripts for PDF generation and CLI tools (`scripts/`, `src/scripts/`)
- CSS - PostCSS + Tailwind utilities (`src/**/*.tsx` component styling)

**Secondary:**
- CommonJS - Legacy PDF generation scripts (`scripts/generate-print-pdf.cjs`, `scripts/audit-pdf.cjs`)

## Runtime

**Environment:**
- Node.js 22.19.0+ (confirmed running)
- Browser (React 19 SPA) - ES2022 target
- Chromium for E2E testing (Playwright)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- Module system: ES Modules (type: "module" in `package.json`)

## Frameworks

**Core:**
- React 19.2.0 - UI framework, all components in `src/components/`, `src/tools/`
- TypeScript 5.9 - Strict mode enabled with `verbatimModuleSyntax`, `noUnusedLocals`, `erasableSyntaxOnly`

**Routing:**
- React Router 7.11.0 - Dynamic route generation via tool registry in `src/App.tsx`

**State Management:**
- Zustand 5.0.9 - Workspace store at `src/store/workspaceStore.ts` with localStorage persistence (key: `vwcg-workspace`)

**UI & Styling:**
- TailwindCSS 3.4.17 - Theme extended in `tailwind.config.js` with custom report colors (navy, charcoal, warm, blue, amber, red, green)
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.23 - Vendor prefixes
- tailwind-merge 3.4.0 - Utility conflict resolution
- lucide-react 0.562.0 - Icon library for all UI elements

**Visualization:**
- Chart.js 4.5.1 - Charts in `src/report/charts/`
- react-chartjs-2 5.3.1 - Chart.js React wrapper
- D3 7.9.0 - Advanced data visualization (optional, registered in `src/lib/charts`)

**PDF Generation:**
- jsPDF 3.0.4 - PDF creation engine in `src/report/pdf/PdfGenerator.ts` (A4 dimensions, metadata, 300 DPI via 3x scale)
- html2canvas 1.4.1 - DOM-to-image capture for PDF content at `src/report/pdf/PdfGenerator.ts`
- Puppeteer 24.36.0 - Headless Chrome PDF generation via `scripts/generate-print-pdf.cjs`
- pdf-parse 2.4.5 - PDF content extraction (dev dependency for tests)

## Key Dependencies

**Critical:**
- zustand 5.0.9 - Workspace state persistence. If corrupted, workspace data loss. Middleware: `persist` with localStorage
- react 19.2.0 - Core UI rendering. 12 tool components depend on React lifecycle
- react-router-dom 7.11.0 - Dynamic tool routing. Tool registry (`src/registry/registry.ts`) generates routes at startup
- typescript-eslint 8.46.4 - Type safety. Strict mode enforces `erasableSyntaxOnly`, no enums allowed

**Infrastructure:**
- vite 7.2.4 - Build tool with React plugin, path alias `@/` → `src/`
- @vitejs/plugin-react 5.1.1 - JSX transformation
- @types/react 19.2.5, @types/react-dom 19.2.3 - TypeScript definitions
- @types/node 24.10.1 - Node.js type definitions for scripts

**Development:**
- @playwright/test 1.58.2 - E2E testing framework (`tests/` subdirs: `smoke/`, `journeys/`, `helpers/`)
- eslint 9.39.1 - Linting (config: `eslint.config.js`)
- @eslint/js 9.39.1 - Core ESLint rules
- eslint-plugin-react-hooks 7.0.1 - React Hooks linting rules
- eslint-plugin-react-refresh 0.4.24 - Fast refresh validation

## Configuration

**Environment:**
- Optional `VITE_GEMINI_API_KEY` - Enables AI Consultation with Gemini 1.5 Flash (see `.env.example`)
- Optional `VITE_OPENAI_API_KEY` - Enables LLM Strategic Briefing generation with GPT-4o and GPT-4o-mini (see `.env.example`)
- `.env` file present (contents not read per security policy) - Contains API keys and secrets
- Vite auto-loads env vars prefixed with `VITE_`

**Build:**
- `vite.config.ts` - Path alias configuration (`@/` → `src/`)
- `tsconfig.json` - References `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` - Strict TypeScript compilation:
  - Target: ES2022
  - JSX: react-jsx
  - Module: ESNext
  - Path alias: `@/*` → `src/*`
  - Strict mode: true
  - Special: `verbatimModuleSyntax` (requires `import type` for type-only imports)
  - Special: `erasableSyntaxOnly` (no enums, use string unions)
  - Special: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `tsconfig.node.json` - Node.js tooling configuration (build scripts, Vite config)
- `eslint.config.js` - Flat config with recommended rules, React Hooks, React Refresh plugins
- `postcss.config.js` - TailwindCSS + Autoprefixer processing

**Testing:**
- `playwright.config.ts` - E2E test configuration:
  - Test dir: `tests/`
  - Base URL: `http://localhost:5173` (Vite dev server)
  - Browsers: Chromium only
  - Auto-starts dev server via `webServer` config
  - Reporters: HTML
  - Screenshot: on-failure only
  - Downloads: `test-outputs/downloads/`

**Deployment:**
- `firebase.json` - Firebase Hosting configuration:
  - Public dir: `dist/` (Vite build output)
  - SPA rewrites: All routes → `/index.html`
  - Deployed to: vwcgapp.web.app

## Platform Requirements

**Development:**
- Node.js 22.19.0+ (checked at runtime)
- npm 10+ (for lockfile support)
- Chrome/Chromium (for Playwright E2E tests)
- 4GB+ RAM (Puppeteer, html2canvas scaling)

**Production:**
- Firebase Hosting (Node.js not required at runtime)
- Modern browser (ES2022 compatible)
- Internet connection for optional AI services (Gemini, OpenAI APIs)

---

*Stack analysis: 2025-02-15*
