# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**
- TypeScript 5.9 - Core application language with strict mode (ES2022 target)
- JSX/TSX - React component markup in `src/components/` and `src/tools/`

**Secondary:**
- JavaScript - Configuration files (vite, tailwind, eslint, postcss)

## Runtime

**Environment:**
- Node.js (no specific version locked, `.nvmrc` absent)

**Package Manager:**
- npm 9+ (inferred from package.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI rendering (React 19 with JSX runtime)
- Vite 7.2.4 - Build tool and dev server
- React Router 7.11.0 - Client-side routing (routes at `/tools/<tool-id>`)
- Zustand 5.0.9 - State management with persist middleware

**UI & Styling:**
- TailwindCSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS transformation pipeline
- Autoprefixer 10.4.23 - Vendor prefix injection
- lucide-react 0.562.0 - SVG icon library

**Charting & Visualization:**
- Chart.js 4.5.1 - Bar/line/pie chart rendering
- react-chartjs-2 5.3.1 - React wrapper for Chart.js
- D3 7.9.0 - Advanced data visualization (for specialized diagrams)

**PDF & Document Export:**
- jsPDF 3.0.4 - PDF generation
- html2canvas 1.4.1 - HTML to canvas rendering (for PDF screenshots)
- pdf-parse 2.4.5 - PDF text extraction (dev/testing use)

**Testing:**
- Playwright 1.58.2 - E2E testing framework
  - Config: `playwright.config.ts`
  - Browser: Chromium only
  - Test location: `tests/` directory
  - Commands: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:generate-pdfs`
- Puppeteer 24.36.0 - Alternative headless browser automation (dev dependency)

**Build/Dev:**
- @vitejs/plugin-react 5.1.1 - React Fast Refresh plugin
- TypeScript 5.9.3 - Strict type checking with `tsc -b`
- ESLint 9.39.1 - Linting with React hooks plugin
- typescript-eslint 8.46.4 - TypeScript ESLint support
- eslint-plugin-react-hooks 7.0.1 - React hooks rules
- eslint-plugin-react-refresh 0.4.24 - Fast Refresh compliance

## Key Dependencies

**Critical:**
- zustand 5.0.9 - Single source of truth for all tool data; integrates with localStorage via persist middleware (key: `vwcg-workspace`)
- react-router-dom 7.11.0 - Navigation between tools and pages

**Infrastructure:**
- clsx 2.1.1 - Conditional class composition utility
- tailwind-merge 3.4.0 - Merges TailwindCSS classes (used with cn() utility in `src/utils/cn.ts`)

## Configuration

**Environment:**
- `.env.example` provides template with `VITE_GEMINI_API_KEY` (optional, for AI Consultation)
- Env vars prefixed `VITE_` are exposed to frontend via Vite's `import.meta.env`
- **Storage:** No backend service; uses browser localStorage only (key: `vwcg-workspace`)

**Build:**
- `vite.config.ts` - Vite build config with React Fast Refresh and path alias `@/` → `src/`
- `tsconfig.app.json` - TypeScript compiler options (ES2022, bundler resolution, path aliases)
- `tsconfig.node.json` - Node-specific config for build files
- `tsconfig.json` - Root config extending app and node configs
- `eslint.config.js` - Flat ESLint config with React, React Hooks, React Refresh, and TypeScript rules
- `tailwind.config.js` - Custom TailwindCSS theme (slate-based colors, custom primary/secondary/accent/destruct)
- `postcss.config.js` - PostCSS plugin pipeline (tailwindcss, autoprefixer)
- `playwright.config.ts` - E2E test config with Chromium, baseURL: http://localhost:5173, auto-server start

## Platform Requirements

**Development:**
- Node.js (no version pinned; recommend 18+)
- npm or yarn
- Modern browser (Chrome/Chromium for Playwright tests)

**Production:**
- Deployment target: Firebase Hosting (`vwcgapp.web.app`)
- Build output: `dist/` directory (served via `firebase.json` rewrites)
- No server-side runtime required; static SPA
- Entrypoint: `main.tsx` → `App.tsx` (React Router app)

---

*Stack analysis: 2026-02-13*
