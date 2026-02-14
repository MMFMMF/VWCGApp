# Technology Stack

**Analysis Date:** 2026-02-14

## Languages

**Primary:**
- TypeScript 5.9 - Full application codebase with strict mode enabled
- TSX - React component files with embedded JSX

**Build Target:**
- ES2022 - Compiled target for all TypeScript

## Runtime

**Environment:**
- Node.js - Development and build environments

**Package Manager:**
- npm - Listed in `package.json` and `package-lock.json`
- Lockfile: Present and committed

## Frameworks

**Core:**
- React 19.2.0 - UI framework and component model
- React Router 7.11.0 - Client-side routing, BrowserRouter with dynamic route generation in `src/App.tsx`

**State Management:**
- Zustand 5.0.9 - Global state with persist middleware for localStorage (key: `vwcg-workspace`)
  - Configured in `src/store/workspaceStore.ts` with partialize for selective persistence
  - Ephemeral state (isSafeMode, previewData, validationResults, insights, lastExportTime) excluded from storage
  - Core persisted data: version, metadata, tools, provenance

**Styling:**
- TailwindCSS 3.4.17 - Utility-first CSS framework
- Tailwind Merge 3.4.0 - Class composition utilities
- PostCSS 8.5.6 - CSS processing with Autoprefixer 10.4.23

**Build Tool:**
- Vite 7.2.4 - Fast development server and production bundler
- @vitejs/plugin-react 5.1.1 - React Fast Refresh support
- Path alias configured: `@/` maps to `src/` (vite.config.ts and tsconfig.app.json)

**Testing & E2E:**
- Playwright 1.58.2 - Browser automation and E2E testing
  - Config: `playwright.config.ts`
  - Chromium only (no Firefox/WebKit)
  - Auto-starts dev server via webServer config
  - Base URL: http://localhost:5173
  - Screenshots on failure, trace on first retry

## Key Dependencies

**Critical:**
- Chart.js 4.5.1 - Chart visualization library
- react-chartjs-2 5.3.1 - React wrapper for Chart.js
- D3 7.9.0 - Data visualization and charting utilities
- html2canvas 1.4.1 - DOM-to-canvas rendering for PDF generation
- jsPDF 3.0.4 - PDF generation and document creation (produces branded `.pdf` files)
- lucide-react 0.562.0 - SVG icon library for UI components

**Utilities:**
- clsx 2.1.1 - Conditional className helper
- React Router DOM 7.11.0 - Routing and navigation

**Development:**
- ESLint 9.39.1 - Linting with @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh
- TypeScript ESLint 8.46.4 - TypeScript-aware linting
- Puppeteer 24.36.0 - Headless browser (dev dependency, used for PDF screenshot utilities)
- pdf-parse 2.4.5 - PDF text extraction (dev dependency)
- @types/node 24.10.1, @types/react 19.2.5, @types/react-dom 19.2.3 - TypeScript definitions
- globals 16.5.0 - Global variable definitions for ESLint

## Configuration

**Environment:**
- Optional `VITE_GEMINI_API_KEY` env var - Enables Google Gemini AI Consultation
- Optional `VITE_OPENAI_API_KEY` env var - Enables OpenAI LLM-powered Strategic Briefing generation
- Both optional: app functions fully without them
- `.env.example` file present with template

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and path alias
- `tsconfig.json` - Root TS configuration with project references
- `tsconfig.app.json` - App compilation target ES2022, strict mode enabled
  - noUnusedLocals, noUnusedParameters, erasableSyntaxOnly, noFallthroughCasesInSwitch, noUncheckedSideEffectImports
  - verbatimModuleSyntax enforced (type-only imports required)
  - src/scripts excluded from compilation
- `tsconfig.node.json` - Build tool configuration
- `postcss.config.js` - PostCSS plugins (tailwindcss, autoprefixer)
- `eslint.config.js` - Flat config format with React Hooks and Refresh rules
- `.firebaserc` - Firebase project configuration (present but content not examined)
- `firebase.json` - Firebase Hosting config with SPA rewrite rule

## Platform Requirements

**Development:**
- Node.js (version not pinned, uses npm 10+ implicitly)
- npm 10+ for modern package resolution
- Modern browser with ES2022 support for development
- Port 5173 required for Vite dev server

**Production:**
- Firebase Hosting - Primary deployment platform
- Static assets served from `dist/` directory
- SPA routing configured with rewrite rule to `/index.html`
- Custom domain: vwcgapp.web.app

## Application State Management

**Workspace Schema (persisted to localStorage):**
```typescript
version: string                    // '1.0'
metadata: {
  id: string                       // UUID generated on first load
  createdAt: string                // ISO timestamp
  lastModified: string             // ISO timestamp
  name: string                     // Workspace name ('My Business Strategy')
  schema_version: 'v1'             // Fixed version
  computed_under_logic_version: string  // LOGIC_VERSION (v1.1.0)
}
tools: Record<toolId, any>         // Dynamic tool data storage
provenance: Record<toolId, { timestamp, logicVersion }>  // Audit trail
```

**Ephemeral State (in-memory only):**
- isSafeMode: boolean - Protected import workflow state
- previewData: Partial state preview during Safe Mode
- validationResults: Validation errors/warnings from import
- insights: Insight[] - Synthesis engine output, recomputed on tool updates
- lastExportTime: number - Cooldown tracking for export operations

---

*Stack analysis: 2026-02-14*
