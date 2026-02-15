# External Integrations

**Analysis Date:** 2025-02-15

## APIs & External Services

**AI & LLM Services:**
- **Google Gemini 1.5 Flash** - AI Consultation feature
  - SDK/Client: Browser-native `fetch()` to Google's API
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - Auth: Environment variable `VITE_GEMINI_API_KEY`
  - Implementation: `src/engine/cloud.ts::consultAi()`
  - Payload: Full workspace JSON + system prompt
  - Response format: JSON (forced via `responseMimeType: "application/json"`)
  - Temperature: 0.7 (creativity allowed for strategy)
  - Max tokens: 2000
  - Optional: App works fully without this key

- **OpenAI GPT-4o / GPT-4o-mini** - Strategic Briefing narrative generation
  - SDK/Client: Browser-native `fetch()` to OpenAI's API
  - Endpoints:
    - Generation: `https://api.openai.com/v1/chat/completions` (model: `chatgpt-4o-latest`)
    - Validation: `https://api.openai.com/v1/chat/completions` (model: `gpt-4o-mini`)
  - Auth: Environment variable `VITE_OPENAI_API_KEY` (Bearer token)
  - Implementation: `src/engine/llm/openai-service.ts` with functions:
    - `generateBriefingNarrative()` - 120s timeout, 8000 max_tokens, temperature 0.7
    - `validateBriefingNarrative()` - 30s timeout, 2000 max_tokens, temperature 0.0
    - `generateWithRetry()` - 2-model pipeline with exponential backoff on failure
  - Response format: JSON with `response_format: { type: 'json_object' }`
  - Error handling: Retry with QA feedback, timeout protection, rate limit detection
  - Optional: App works fully without this key

## Data Storage

**State Persistence:**
- **Browser localStorage** (key: `vwcg-workspace`)
  - Store: Zustand `useWorkspaceStore` at `src/store/workspaceStore.ts`
  - Persisted fields: `version`, `metadata`, `tools`, `provenance`
  - Schema version: `v1`
  - Logic version: `v1.1.0` (bumped when synthesis rules or validation logic changes)
  - Size: Unbounded (workspace data + 12 tool datasets)
  - Rehydration: Synced via `onRehydrateStorage` with automatic insight recomputation

**Ephemeral State (not persisted):**
- In-memory: `isSafeMode`, `previewData`, `validationResults`, `insights`, `lastExportTime`

**File Storage:**
- **Local filesystem only** (client-side)
  - Workspace exports: `.vwcg` files (JSON format, user downloads)
  - PDF exports: User's Downloads folder via browser download API
  - No cloud storage configured

**Caching:**
- None - Real-time synthesis via Zustand subscribe

## Authentication & Identity

**Auth Provider:**
- **Custom (in-memory)** - No external auth service
- **Workspace UUID:** Generated at `src/store/workspaceStore.ts::resetWorkspace()` when metadata.id is empty
- **Metadata:** Workspace created/modified timestamps, name, logic version recorded
- **No user login:** Single-user per browser session

## Monitoring & Observability

**Error Tracking:**
- None configured - Errors logged to browser console only

**Logs:**
- **Browser console:**
  - `[workspaceStore]` prefixed logs in `src/store/workspaceStore.ts`
  - Synthesis engine logs: `src/engine/synthesis.ts`
  - API error details (Gemini, OpenAI) with messages and status codes
  - No log aggregation service

## CI/CD & Deployment

**Hosting:**
- **Firebase Hosting** at vwcgapp.web.app
  - Config: `firebase.json`
  - Public dir: `dist/` (Vite build output)
  - SPA rewrite: All routes → `/index.html`
  - HTTPS: Automatic via Firebase

**CI Pipeline:**
- None configured - Manual Firebase CLI deployment required (`firebase deploy`)

**Build Process:**
```bash
npm run build  # Runs: tsc -b && vite build
```
- TypeScript type check (`tsc -b`)
- Vite production build with minification
- Output: `dist/` directory
- Tree-shaking: Enabled by Vite

## Environment Configuration

**Required env vars:**
- `VITE_GEMINI_API_KEY` (optional) - AI Consultation feature
- `VITE_OPENAI_API_KEY` (optional) - Strategic Briefing generation

**Example `.env` file:**
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_OPENAI_API_KEY=your_api_key_here
```

**Defaults if missing:**
- Both APIs: Graceful degradation - Features disabled but app fully functional
- OpenAI: LLMStrategicBriefing component shows "API key not configured"
- Gemini: Cloud Synthesis button hidden in AI Consultation UI

**Secrets location:**
- `.env` file (not committed to git, listed in `.gitignore`)
- Credentials never logged or sent to third parties except explicitly to their APIs

## Webhooks & Callbacks

**Incoming Webhooks:**
- None - App is stateless SPA

**Outgoing Webhooks:**
- None - No server-to-server callbacks configured

**Browser APIs Used:**
- `localStorage` - Workspace persistence
- `fetch()` - API calls to Gemini and OpenAI
- `Blob` - PDF generation
- `FileReader` - Workspace import from `.vwcg` files
- `HTMLCanvasElement` - html2canvas DOM capture

## Data Privacy & Security

**User Data Flow:**
1. All data stays in browser localStorage by default
2. When user provides API key + requests AI Consultation:
   - Full workspace JSON sent to Google Gemini API
   - User must consent (key entry = consent)
3. When user requests LLM Strategic Briefing:
   - Assessment payload + workspace data sent to OpenAI API
   - Uses QA validation loop with feedback mechanism

**Data Retention:**
- Browser: Indefinite (localStorage persistence)
- Gemini API: Google's standard retention policy
- OpenAI API: OpenAI's standard retention policy (conversation history not stored)
- No local backups created

**HTTPS:** Enforced via Firebase Hosting SSL/TLS

## Third-Party Service Status

| Service | Optional | Graceful Degradation | Status Check |
|---------|----------|---------------------|--------------|
| Gemini 1.5 Flash | Yes | AI Consultation disabled | Check VITE_GEMINI_API_KEY |
| OpenAI GPT-4o | Yes | Strategic Briefing generation disabled | Check VITE_OPENAI_API_KEY |
| Firebase Hosting | No | Required for deployment | firebase.json + vwcgapp.web.app |
| Chart.js | Yes | Charts not rendered | Always loaded |

---

*Integration audit: 2025-02-15*
