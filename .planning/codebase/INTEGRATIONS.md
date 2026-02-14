# External Integrations

**Analysis Date:** 2026-02-14

## APIs & External Services

**AI/LLM Services:**
- Google Gemini 1.5 Flash API - AI consultation features
  - SDK/Client: Browser-native fetch (`src/engine/cloud.ts`)
  - Auth: `VITE_GEMINI_API_KEY` environment variable
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - Payload: Workspace data + system prompt as JSON
  - Response format: JSON with candidates[0].content.parts[0].text
  - Config: temperature 0.7, maxOutputTokens 2000
  - Usage: Strategic insights generation via `consultAi()` in `src/engine/cloud.ts`

- OpenAI API (ChatGPT 4o) - LLM-powered Strategic Briefing narrative generation
  - SDK/Client: Browser-native fetch (`src/engine/llm/openai-service.ts`)
  - Auth: `VITE_OPENAI_API_KEY` environment variable
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `chatgpt-4o-latest`
  - Config: temperature 0.7, max_tokens 8000
  - Response format: JSON object
  - Timeouts: 120s for generation, 30s for QA validation
  - Functions:
    - `generateBriefingNarrative()` - Creates strategic briefing narrative with structure validation
    - `qaValidateNarrative()` - Quality assurance validation with retry loop
  - Error handling: Throws on invalid API key or network failures

## Data Storage

**Databases:**
- None - Application is entirely client-side

**File Storage:**
- Local filesystem only - No cloud storage integration
- Workspace files use `.vwcg` extension (JSON format)
- PDFs generated locally in browser memory and triggered for download

**Caching:**
- Browser localStorage - Default and only persistence mechanism
  - Key: `vwcg-workspace`
  - Middleware: Zustand persist with partialize for selective storage
  - Persistence: Automatic on every `updateToolData()` and import operations
  - Rehydration: On app startup via `onRehydrateStorage` hook

**Session Storage:**
- localStorage for API keys (security consideration)
  - `VITE_GEMINI_API_KEY` stored in localStorage (`src/components/dashboard/StrategicHealthWidget.tsx` line 23)
  - `VITE_OPENAI_API_KEY` - loaded from env vars, may be stored temporarily by components
  - Note: User-provided API keys via UI modal, persisted for session convenience

## Authentication & Identity

**Auth Provider:**
- None - Application requires no user authentication
- Public SPA with no backend login
- API key management: User-provided at runtime in UI modal (Strategic Health Widget)

## Monitoring & Observability

**Error Tracking:**
- None - No centralized error tracking service

**Logs:**
- Browser console only
  - `console.log()` for initialization and synthesis updates
  - `console.error()` for API failures and validation errors
  - Examples: '[workspaceStore] Running synthesis', 'Cloud Synthesis Failed'

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting
  - Project configured in `.firebaserc` and `firebase.json`
  - Static deployment from `dist/` directory
  - SPA rewrite rule: all URLs rewrite to `/index.html`
  - Domain: vwcgapp.web.app
  - Deployment command: `firebase deploy`

**CI Pipeline:**
- None detected - Manual deployment via Firebase CLI
- Build command: `npm run build` (TypeScript check + Vite production build)

## Environment Configuration

**Required env vars:**
- None - Application runs fully without environment variables

**Optional env vars:**
- `VITE_GEMINI_API_KEY` - Google Gemini API key (user must provide or generate at https://makersuite.google.com/app/apikey)
- `VITE_OPENAI_API_KEY` - OpenAI API key (user must provide or generate at https://platform.openai.com/api-keys)

**Secrets location:**
- `.env` file (git-ignored) for development
- `.env.example` provided as template
- Runtime: User inputs API keys via UI modal in Strategic Health Widget component
- Storage: Stored in localStorage for session persistence

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Privacy & Security Considerations

**API Data Transmission:**
- Workspace data sent to Gemini API: Full workspace state passed as JSON in request body
  - User must consent by providing API key
  - Data includes tool assessment responses, metadata, provenance
  - Note in code: "For privacy, we might strip exact timestamps or unrelated metadata, but for strategy, context is key"

- Workspace data sent to OpenAI API: Assessment payload with optional QA feedback
  - Structure validated before sending
  - Retry mechanism includes previous feedback for iterative generation

**Local Storage:**
- All persistent data stored in browser localStorage (not encrypted)
- API keys stored in localStorage (localStorage-abc123 pattern security consideration)
- No server-side backup or sync

**Network Security:**
- All API calls over HTTPS (googleapis.com, openai.com)
- No certificate pinning detected
- Standard browser CORS and security policies apply

## Optional Features Status

**Gemini AI Consultation:**
- Status: Fully optional
- Enabled when `VITE_GEMINI_API_KEY` provided
- UI: Modal in Strategic Health Widget (`src/components/dashboard/StrategicHealthWidget.tsx`)
- Output: Generates additional `Insight[]` for dashboard display

**OpenAI Strategic Briefing:**
- Status: Fully optional
- Enabled when `VITE_OPENAI_API_KEY` provided
- Uses Gemini key OR OpenAI key depending on flow
- Output: Structured narrative with headline, strengths, exposures, recommendations
- Quality assurance loop with automatic retry on validation failure

---

*Integration audit: 2026-02-14*
