# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**
- TypeScript 5.9 - Core application code, strict mode enabled with `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- JSX/TSX - React component templates using `react-jsx` compiler option

**Secondary:**
- JavaScript - Configuration files (vite.config.ts, eslint.config.js, postcss.config.js, playwright.config.ts)

## Runtime

**Environment:**
- Node.js 22.19.0 (project uses ^22.x, as evidenced by environment)

**Package Manager:**
- npm 11.6.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI framework with Strict Mode and new concurrent rendering
- React DOM 19.2.0 - DOM rendering
- React Router 7.11.0 - Client-side routing with dynamic route generation

**UI & Styling:**
- TailwindCSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS preprocessing with autoprefixer plugin
- Autoprefixer 10.4.23 - Vendor prefixing
- tailwind-merge 3.4.0 - Class composition utility for Tailwind

**State Management:**
- Zustand 5.0.9 - Lightweight state management with persist middleware (localStorage key: `vwcg-workspace`)

**Visualization:**
- Chart.js 4.5.1 - Charting library for data visualization
- react-chartjs-2 5.3.1 - React wrapper for Chart.js
- D3 7.9.0 - Advanced data manipulation and visualization
- jsPDF 3.0.4 - PDF generation and manipulation
- html2canvas 1.4.1 - HTML-to-canvas rendering (used for PDF generation with 3x scale for 300 DPI)

**Icons:**
- lucide-react 0.562.0 - Icon library with React components

**Utilities:**
- clsx 2.1.1 - Conditional className builder

**Build & Development:**
- Vite 7.2.4 - Fast build tool and dev server
- @vitejs/plugin-react 5.1.1 - React plugin for Vite with Fast Refresh
- ESLint 9.39.1 - Code linting
- @eslint/js 9.39.1 - ESLint JavaScript configuration
- typescript-eslint 8.46.4 - TypeScript ESLint support
- eslint-plugin-react-hooks 7.0.1 - React hooks linting rules
- eslint-plugin-react-refresh 0.4.24 - React Fast Refresh linting

**Testing:**
- @playwright/test 1.58.2 - End-to-end testing framework (Chromium only)
- puppeteer 24.36.0 - Browser automation (dev dependency)
- pdf-parse 2.4.5 - PDF parsing for test verification

**Type Definitions:**
- @types/react 19.2.5 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.10.1 - Node.js type definitions
- globals 16.5.0 - Global types for ESLint

## Configuration

**Environment:**
- Optional `VITE_GEMINI_API_KEY` environment variable enables AI Consultation features (Gemini 1.5 Flash API)
- Configuration via `.env` file (see `.env.example` for template)
- Vite exposes env vars with `VITE_` prefix for client-side access

**Build:**
- TypeScript compilation checked before Vite build: `tsc -b && vite build`
- Path alias configured: `@/` maps to `src/` (tsconfig.app.json and vite.config.ts)
- Source maps generated during build
- Production output: `dist/` directory

**Vite Configuration:**
- Plugin: `@vitejs/plugin-react` for React JSX and Fast Refresh
- Alias: `@/` → `./src`
- Module format: ESNext (ES2022 target)

## Platform Requirements

**Development:**
- Node.js 22.19.0 or compatible
- npm 11.6.0 or compatible
- Modern browser with ES2022 support for development server

**Production:**
- Deployed to Firebase Hosting (project: `vwcgapp`)
- Base URL: `vwcgapp.web.app`
- Serves static files from `dist/` directory with SPA rewrite rule (all routes → `/index.html`)
- Works with modern browsers (all ES2022 features)

## Type Checking & Linting

**TypeScript:**
- Target: ES2022
- Module format: ESNext
- JSX: react-jsx (new React 17+ transform)
- Strict mode with comprehensive error checking
- Compilation: `tsc -b` for multi-project build

**ESLint:**
- Config: `eslint.config.js` (flat config format)
- Extends: ESLint base, TypeScript ESLint recommended, React Hooks recommended, React Refresh vite preset
- Language options: ES2020, browser globals
- File scope: `**/*.{ts,tsx}` excluding `dist/`

## Additional Tools & Libraries

**Package Specification:**
- Type: `"module"` - ES modules only
- Private package: Not published to npm

---

*Stack analysis: 2026-02-13*
