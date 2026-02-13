# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**Google Gemini AI (Optional):**
- Service: Google Generative AI (Gemini 1.5 Flash)
- What it's used for: AI Consultation feature — analyzes workspace data and generates strategic insights via synthesis rules
- SDK/Client: Native `fetch` API (no SDK package)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- Auth: API key via `VITE_GEMINI_API_KEY` environment variable
- Implementation: `src/engine/cloud.ts` → `consultAi()` function
  - Sends full workspace state as JSON to Gemini
  - Requests JSON response (temperature: 0.7, max tokens: 2000)
  - Parses returned `Insight[]` objects
- UI Integration: `src/components/dashboard/StrategicHealthWidget.tsx`
  - User can input API key at runtime
  - Key stored in `localStorage` as `VWCG_GEMINI_KEY`
- Status: Optional — app functions without it; no fallback inference engine

## Data Storage

**Databases:**
- None — fully client-side SPA
- No backend API server required

**File Storage:**
- Local filesystem only (user exports workspace as `.vwcg` JSON file)
- Workspace export format: `.vwcg` files (JSON with canonical key ordering)
- Export location: Browser download via `exportState()` in `src/store/workspaceStore.ts`
- Export cooldown: 5-second minimum between exports (anti-spam)

**Persistence Layer:**
- Browser localStorage
  - Key: `vwcg-workspace`
  - Content: Persisted workspace state (version, metadata, tools, provenance)
  - Middleware: Zustand `persist` with `partialize` config in `src/store/workspaceStore.ts`
- Session-ephemeral data: Validation results, insights, Safe Mode state (not persisted)

**Caching:**
- No external cache service (Redis, Memcached, etc.)
- In-memory Zustand store acts as runtime cache

## Authentication & Identity

**Auth Provider:**
- Custom (none required)
- No login/user system — workspace is local to browser
- Optional API key management for Gemini integration (manual entry, localStorage storage)

## Monitoring & Observability

**Error Tracking:**
- None configured
- Errors logged to browser console via `console.error()`

**Logs:**
- Browser console only
- Key logs: Registry initialization, validation setup, synthesis execution
- Example locations: `src/main.tsx`, `src/store/workspaceStore.ts`

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting
  - Project ID: `vwcgapp` (from `.firebaserc`)
  - Domain: `vwcgapp.web.app`
  - Public dir: `dist/`
  - Rewrites: All routes → `/index.html` (SPA routing)

**CI Pipeline:**
- None detected (`CI` env var check exists in Playwright config but no GitHub Actions/GitLab CI detected)

**Build & Deploy:**
```bash
npm run build          # TypeScript check + Vite production build
firebase deploy        # Deploy dist/ to Firebase Hosting
```

## Environment Configuration

**Required env vars:**
- None mandatory

**Optional env vars:**
- `VITE_GEMINI_API_KEY` - Google Gemini API key for AI Consultation (can be provided at runtime via UI)

**Secrets location:**
- `.env` file (local development, never committed)
- Template: `.env.example`
- Runtime: `VITE_GEMINI_API_KEY` can also be input via UI and stored in localStorage as `VWCG_GEMINI_KEY`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Cross-Tool Data Synchronization

**Workspace Import (Safe Mode):**
- Staged load: `stageWorkspace(data)` validates incoming `.vwcg` JSON
- Validation profiles: L0-L3 severity checks (registered at startup in `src/validation/`)
- Commit: `commitWorkspace()` applies validated data and exits Safe Mode
- Convenience wrapper: `loadWorkspace(data)` auto-stages and auto-commits

**Synthesis Engine Integration:**
- Triggered synchronously on every tool data update via `updateToolData()`
- Runs 5 cross-tool rules (E1-E5) in `src/engine/rules.ts`
- Generates `Insight[]` sorted by severity (high → low)
- Results stored in ephemeral `state.insights`
- Optional AI consultation adds cloud-generated insights via Gemini API

## Data Format & Interchange

**Workspace Export Format (.vwcg):**
- JSON with canonical key ordering (sorted keys)
- Fields: version, metadata, tools, provenance
- Metadata includes: id (UUID), createdAt, lastModified, name, schema_version (v1), computed_under_logic_version
- Provenance tracks: timestamp and LOGIC_VERSION for each tool update

---

*Integration audit: 2026-02-13*
