# External Integrations

**Analysis Date:** 2026-02-14

## APIs & External Services

**AI & LLM Services:**
- Google Gemini 1.5 Flash - AI consultation for workspace analysis
  - SDK/Client: Browser-native `fetch` (no SDK)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - Auth: `VITE_GEMINI_API_KEY` env var, passed as query parameter
  - Implementation: `src/engine/cloud.ts` - `consultAi()` function sends full workspace JSON to Gemini, expects JSON output with `Insight[]` array
  - Usage: Optional "AI Consultation" feature invoked from dashboard/tools, available only when API key is set

- OpenAI (ChatGPT) - Strategic narrative generation and QA validation
  - SDK/Client: Browser-native `fetch` (no SDK)
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Auth: `VITE_OPENAI_API_KEY` env var, passed in `Authorization: Bearer` header
  - Models used:
    - `chatgpt-4o-latest` - Generation (8000 tokens max, temperature 0.7)
    - `gpt-4o-mini` - QA validation (2000 tokens max, temperature 0.0)
  - Implementation: `src/engine/llm/openai-service.ts` - Two-stage pipeline with `generateBriefingNarrative()` and `validateBriefingNarrative()`
  - Error handling: Rate limit (429), auth failure (401), server errors (500+) with user-friendly messages
  - Timeouts: Generation 120s, QA validation 30s
  - Usage: LLM Strategic Briefing generation in Report Center (`src/tools/report/ReportCenter.tsx`), QA feedback on narrative structure, retry logic up to 2 attempts with exponential backoff

## Data Storage

**Databases:**
- None - Application is fully client-side

**File Storage:**
- Local filesystem only - Browser-based export via `download` link or Firebase Hosting static delivery

**Browser Storage:**
- localStorage (via Zustand persist middleware)
  - Storage key: `vwcg-workspace`
  - Contents: Persisted workspace state including metadata, tool data, provenance, logic version
  - Schema: JSON with `version`, `metadata`, `tools`, `provenance` top-level keys
  - Rehydration: Automatic on app load with `onRehydrateStorage` callback that recomputes insights

**Caching:**
- Browser HTTP cache via Firebase Hosting (immutable assets)
- No explicit caching layer (static SPA)

## Authentication & Identity

**Auth Provider:**
- None - Application is unauthenticated
- No user login or session management
- Workspace identified by locally-generated UUID (`metadata.id`)

## Monitoring & Observability

**Error Tracking:**
- None - No external error reporting service configured

**Logs:**
- Browser console only (accessed via DevTools)
- Key debug outputs:
  - `[workspaceStore]` - Synthesis engine execution and insights
  - `Cloud Synthesis Failed` - Gemini API errors
  - Attempt logs from OpenAI retry pipeline

**Performance:**
- No external APM (Application Performance Monitoring)
- Vite dev server provides HMR feedback in browser console

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting
  - Project ID: `vwcgapp`
  - Domain: `vwcgapp.web.app`
  - Config: `firebase.json` with SPA rewrites to `index.html`
  - Deployment: CLI command `firebase deploy` (requires Firebase credentials)
  - Source: Builds from `dist/` folder

**Build Pipeline:**
- Local only - No automated CI/CD configured
- Manual workflow: `npm run build` → `firebase deploy`
- Build checks: TypeScript type checking via `tsc -b` (runs before Vite build)

**Version Control:**
- Git repository (local, no remote origin configured)
- Git config: User "AnotherGuy" (anotherguy@users.noreply.github.com)

## Environment Configuration

**Required env vars:**
- Optional:
  - `VITE_GEMINI_API_KEY` - For AI Consultation (graceful fallback if missing)
  - `VITE_OPENAI_API_KEY` - For LLM Strategic Briefing (UI disabled if missing)

**Secrets location:**
- `.env` file at project root (not committed)
- Template: `.env.example` (committed, shows structure and key names)
- No secrets in code; all API keys passed via environment at runtime

**Build env:**
- Vite automatically prefixes `VITE_` variables into `import.meta.env` at build time
- Non-Vite prefixed vars are NOT exposed to client code (security measure)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Flow

**Workspace Lifecycle:**

1. **Initialization** - `main.tsx` → `initializeRegistry()` → `initializeValidation()` → `registerCharts()`
2. **Startup** - `App.tsx` checks `metadata.id` in persisted store; if missing, calls `resetWorkspace()` to create fresh workspace with new UUID
3. **User edits** - Tool UI → `updateToolData(toolId, data)` in `workspaceStore.ts`
4. **Synthesis** - `updateToolData` triggers `runSynthesis()` synchronously, updates `state.insights`
5. **Persistence** - Zustand `persist` middleware auto-saves `{version, metadata, tools, provenance}` to localStorage key `vwcg-workspace`
6. **Rehydration** - On browser reload, localStorage restores persisted data, `onRehydrateStorage` recomputes insights via `queueMicrotask`

**AI Consultation Flow:**
- User invokes AI consultation from dashboard
- Workspace state serialized to JSON and sent to Gemini API via `consultAi()`
- Gemini returns structured `Insight[]` JSON
- Insights merged into `state.insights`
- Display updated in UI

**Report Generation Flow:**
- User selects report type in Report Center
- If LLM generation enabled (key present):
  - Payload assembled via `assemblePayload()` from `src/engine/llm/payload-assembler.ts`
  - `generateWithRetry()` calls OpenAI `chatgpt-4o-latest` for narrative
  - Validates structure, then calls `gpt-4o-mini` for QA
  - On QA fail, retries generation with feedback (max 2 attempts)
  - Returns `GenerationResult` with narrative, QA validation, usage metrics
- Report rendered to DOM
- `PdfGenerator.ts` captures HTML with html2canvas at 3x scale, embeds in jsPDF with metadata
- PDF blob downloaded with branded filename: `{clientName}-Strategic-Briefing-{date}.pdf`

## Integration Security

**API Key Management:**
- Keys loaded from environment variables only
- Never hardcoded or committed to repository
- Passed directly to external APIs (Gemini, OpenAI) at request time
- Error messages sanitize details (e.g., "Invalid API key. Please check your VITE_OPENAI_API_KEY")

**Data Privacy:**
- OpenAI/Gemini calls send full workspace JSON; user explicitly provides API key (consent)
- No backend intermediary; direct client → API communication
- localStorage used only locally; not synced to cloud
- Workspace export uses canonical JSON serialization (sorted keys) for stability

**CORS:**
- All external API calls use Vite `import.meta.env` for origin-agnostic requests
- Firebase Hosting allows all requests (public domain)
- External APIs (Gemini, OpenAI) handle CORS via their own headers

---

*Integration audit: 2026-02-14*
