# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**AI Consultation (Google Gemini):**
- Service: Google Generative AI - Gemini 1.5 Flash
- What it's used for: AI-powered strategic consultation and insight generation via the Strategic Health Widget and Dashboard analysis
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - SDK/Client: Native `fetch` API (no SDK, direct HTTP)
  - Auth: API key passed as query parameter (`?key={apiKey}`)
  - Env var: `VITE_GEMINI_API_KEY` (optional - feature works without it)
  - Storage: API key stored in localStorage under key `VWCG_GEMINI_KEY` (user-provided at runtime)
  - Request format: JSON with `contents`, `parts`, `generationConfig` (temperature: 0.7, maxOutputTokens: 2000, responseMimeType: "application/json")
  - Response: Parsed JSON array of `Insight` objects
  - Implementation: `src/engine/cloud.ts` exports `consultAi(workspace, apiKey)`
  - Usage: `src/components/dashboard/StrategicHealthWidget.tsx` handles user input and calls `consultAi()`

## Data Storage

**Databases:**
- None - Application uses client-side only storage

**Local Storage:**
- Browser localStorage (key: `vwcg-workspace`)
  - Client: Zustand with `persist` middleware
  - Persisted data: `version`, `metadata`, `tools`, `provenance`
  - Ephemeral data (not persisted): `isSafeMode`, `previewData`, `validationResults`, `insights`, `lastExportTime`
  - Implementation: `src/store/workspaceStore.ts`

**File Storage:**
- Local browser downloads via jsPDF/html2canvas
- No cloud file storage integration

**Caching:**
- Browser memory via Zustand state
- No server-side caching

## Authentication & Identity

**Auth Provider:**
- None - No user authentication system

**Workspace Identity:**
- Generated client-side: `metadata.id` (UUID) created on first workspace initialization via `resetWorkspace()`
- Schema version: `v1`
- Provenance tracking: Each tool update records `{ timestamp, logicVersion }` in `state.provenance[toolId]`
- Logic version: `v1.1.0` (defined in `src/store/workspaceStore.ts` as `LOGIC_VERSION`)

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service integrated

**Logs:**
- Browser console only (`console.log`, `console.error`)
- No log aggregation service
- Example logs: Synthesis engine execution (`[workspaceStore] Running synthesis...`)

**Debugging:**
- Playwright test tracing: `trace: 'on-first-retry'` in test config
- Screenshot capture: `screenshot: 'only-on-failure'` in test config
- HTML reporter: `reporter: 'html'` generates test reports to `test-results/`

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting (project: `vwcgapp`)
- Base URL: `vwcgapp.web.app`
- Deploy command: `firebase deploy`
- Deploy source: Static files from `dist/` directory
- SPA rewrite rule: All routes rewritten to `/index.html` for client-side routing

**Build Pipeline:**
- Local only (no CI service configured)
- Build command: `npm run build` (TypeScript check + Vite production build)
- Build output: `dist/` directory with optimized bundles

**CI/CD Service:**
- None configured - Manual deployment

## Environment Configuration

**Required env vars:**
- None - App works fully without environment variables

**Optional env vars:**
- `VITE_GEMINI_API_KEY` - Google Gemini API key for AI Consultation feature
  - Get key at: https://makersuite.google.com/app/apikey
  - If not provided: AI Consultation feature is disabled

**Secrets location:**
- `.env` file (not committed, use `.env.example` as template)
- Runtime: API key can be provided via UI input field in Strategic Health Widget (stored in localStorage)

## Webhooks & Callbacks

**Incoming:**
- None - Application is request-only, no webhook receivers

**Outgoing:**
- Gemini API calls with workspace data payload
  - Payload: Entire workspace state as JSON (tools data, metadata, provenance)
  - Format: `contents[0].parts[0].text` containing system prompt + workspace JSON
  - Response callback: Processes `candidates[0].content.parts[0].text` as JSON array of insights

## Data Export & Import

**Export Format:**
- JSON (`.vwcg` files)
- Serialization: Canonical JSON with sorted keys
- Includes: `version`, `metadata`, `tools`, `provenance`
- Export cooldown: 5 seconds between consecutive exports
- Implementation: `src/store/workspaceStore.ts` `exportState()` method

**Import Workflow:**
- Safe Mode workflow: `stageWorkspace()` → validation → `commitWorkspace()`
- Validation runs during import using L0-L3 validation profiles
- Profiles registered in `src/validation/` (profiles_p1.ts, profiles_p2.ts, profiles_p3.ts)
- Per-tool validation via `validationProfileId` field

## Third-Party Dependencies with External Calls

**jsPDF (3.0.4):**
- Used for: PDF document creation and page management
- No external calls - generates documents client-side
- Implementation: `src/tools/report/PdfService.ts`, `src/report/pdf/PdfGenerator.ts`

**html2canvas (1.4.1):**
- Used for: HTML element to canvas rendering for PDF embedding
- No external calls - renders DOM client-side
- Scale factor: 3x (yields ~288-312 DPI for A4 print)
- Implementation: `src/tools/report/PdfService.ts`, `src/report/pdf/PdfGenerator.ts`

**Chart.js (4.5.1):**
- Used for: Data visualization and charting
- No external calls - renders client-side
- Registration: Charts registered at app startup via `registerCharts()` in `src/lib/charts.ts`
- Components: `src/report/charts/` (DotPlot, Gauge, HorizontalBar, ProgressBar)

**D3 (7.9.0):**
- Used for: Advanced data visualization and manipulation
- No external calls - operates on data structures client-side
- Not yet actively used in current implementation

---

*Integration audit: 2026-02-13*
