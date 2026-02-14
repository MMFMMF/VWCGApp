# Technology Stack

**Analysis Date:** 2026-02-14

## Languages

**Primary:**
- TypeScript 5.9 - All source code in `src/` with strict mode enabled
- TSX/JSX - React components with inline XML syntax

**Secondary:**
- JavaScript (CommonJS) - Build scripts in `scripts/` directory (`.cjs` files)

## Runtime

**Environment:**
- Node.js (version unspecified - no `.nvmrc` file)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI framework at `src/components/` and `src/tools/`
- React Router DOM 7.11.0 - Client-side routing in `src/App.tsx`
- Vite 7.2.4 - Build tool and dev server (configured in `vite.config.ts`)

**Styling:**
- TailwindCSS 3.4.17 - Utility-first CSS (config in `tailwind.config.js`)
- PostCSS 8.5.6 - CSS processing pipeline
- Autoprefixer 10.4.23 - CSS vendor prefixes

**State Management:**
- Zustand 5.0.9 - Lightweight store with persistence middleware (`src/store/workspaceStore.ts`)

**Charting & Visualization:**
- Chart.js 4.5.1 - Static chart rendering
- react-chartjs-2 5.3.1 - React wrapper for Chart.js
- D3 7.9.0 - Advanced data visualization helpers (`src/lib/charts.ts`)

**UI Components:**
- lucide-react 0.562.0 - Icon library (all icons sourced from here)

**Testing:**
- Playwright 1.58.2 - E2E test framework (config in `playwright.config.ts`, tests in `tests/`)
- Tests run with Chromium only, auto-starts dev server at `http://localhost:5173`

**PDF Generation:**
- jsPDF 3.0.4 - PDF document creation (`src/report/pdf/PdfGenerator.ts`)
- html2canvas 1.4.1 - HTML to canvas rendering at 3x scale (300 DPI equivalent)
- Puppeteer 24.36.0 - Headless browser for print PDF generation (`scripts/generate-print-pdf.cjs`)
- pdf-parse 2.4.5 - PDF content parsing (dev dependency for testing)

**Utilities:**
- clsx 2.1.1 - Conditional className composition
- tailwind-merge 3.4.0 - Merge conflicting Tailwind classes with `cn()` utility (`src/utils/cn.ts`)

**Code Quality:**
- ESLint 9.39.1 - Linting (flat config in `eslint.config.js`)
- @eslint/js 9.39.1 - ESLint base configuration
- typescript-eslint 8.46.4 - TypeScript-aware ESLint rules
- eslint-plugin-react-hooks 7.0.1 - React Hooks ESLint rules
- eslint-plugin-react-refresh 0.4.24 - React Fast Refresh support

## Key Dependencies

**Critical:**
- react 19.2.0 - Core rendering engine
- zustand 5.0.9 - State persistence via localStorage (key: `vwcg-workspace`)
- jspdf 3.0.4 + html2canvas 1.4.1 - PDF generation (combined used in `src/report/pdf/PdfGenerator.ts`)

**Infrastructure:**
- vite 7.2.4 - Fast HMR dev server and production bundler
- typescript 5.9.3 - Type checking and compilation (strict mode with `verbatimModuleSyntax`)

## Configuration

**Environment:**
- Optional env vars read via `import.meta.env` (Vite syntax):
  - `VITE_GEMINI_API_KEY` - Google Gemini 1.5 Flash API key (optional, enables AI Consultation)
  - `VITE_OPENAI_API_KEY` - OpenAI API key (optional, enables LLM Strategic Briefing generation)
- `.env` and `.env.example` at project root document available variables
- No secrets stored in code; API keys passed via environment at runtime

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and `@/` path alias
- `tsconfig.json` - Root TypeScript configuration referencing `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` - Strict app compilation targeting ES2022, JSX support, path alias `@/` → `src/`
- `tsconfig.node.json` - Node/build script compilation (referenced by Vite)
- `postcss.config.js` - PostCSS pipeline for TailwindCSS + Autoprefixer
- `tailwind.config.js` - TailwindCSS theme customization (extends colors, custom primary/secondary/accent)
- `eslint.config.js` - ESLint flat config covering all `.ts` and `.tsx` files

## Platform Requirements

**Development:**
- Node.js (version not pinned)
- npm (version from package-lock.json)
- Supports Windows/macOS/Linux (Bash shell used)

**Production:**
- Static hosting (Firebase Hosting at `vwcgapp.web.app`)
- Deployment: `npm run build` produces `dist/` folder, deployed via `firebase deploy`
- Firebase rewrites all routes to `index.html` (SPA support in `firebase.json`)
- No backend required; all computation client-side

---

*Stack analysis: 2026-02-14*
