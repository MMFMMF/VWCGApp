# Codebase Concerns

**Analysis Date:** 2025-02-14

## Tech Debt

### Dual Synthesis Rules System
- **Issue:** Old synthesis rules (`src/engine/rules.ts` - E1-E5) coexist with new v2 rules (`src/engine/rules-v2.ts`). Only v2 rules are active in the main app via `synthesis.ts`, but old rules are still referenced in test/utility scripts.
- **Files:**
  - `src/engine/rules.ts` (231 lines, unused by app)
  - `src/engine/rules-v2.ts` (505 lines, active)
  - `src/scripts/e2e_test_audit_fixes.ts` (imports old rules)
  - `src/scripts/verify_joe.ts` (imports old rules)
- **Impact:** Maintenance burden. If rules change, updates must happen in two places. Scripts break if old rules are removed. Dead code bloats bundle.
- **Fix approach:** Deprecate and remove `rules.ts`. Update scripts to use `rules-v2.ts`. Mark scripts as internal-only or document their stability.

### PDF Generation Dual System
- **Issue:** Two PDF generation systems coexist: legacy `src/tools/report/PdfService.ts` (jsPDF + html2canvas, scale 2) and new `src/report/pdf/PdfGenerator.ts` (scale 3, enhanced metadata, DPI calculation).
- **Files:**
  - `src/tools/report/PdfService.ts` (44 lines, simple but lower quality)
  - `src/report/pdf/PdfGenerator.ts` (283+ lines, production-grade)
- **Impact:** Confusion about which system to use. Legacy system may not be called but adds maintenance risk. E2E tests may use different PDF tools causing inconsistency.
- **Fix approach:** Audit all PDF generation calls. Migrate completely to new `PdfGenerator.ts`. Remove legacy `PdfService.ts`. Update E2E tests to use consistent method.

### Unused Type Safety in JSON.parse
- **Issue:** Multiple `JSON.parse()` calls without error wrapping or schema validation:
  - `src/engine/cloud.ts:66` - Gemini API response parsing
  - `src/engine/llm/openai-service.ts:118, 202` - OpenAI response parsing
  - `src/scripts/e2e_test_audit_fixes.ts:65` - Workspace file parsing
- **Files:** All JSON parsing locations lack try-catch blocks around parse operations
- **Impact:** Malformed API responses or corrupted workspace files crash silently or produce cryptic errors. No structured error recovery.
- **Fix approach:** Wrap all `JSON.parse()` calls in try-catch blocks. Use Zod or TypeScript type guards for API response validation. Provide user-friendly error messages.

## Known Bugs

### API Key Storage Security Issue
- **Problem:** Gemini API key stored in plain text in browser localStorage under key `VWCG_GEMINI_KEY`
- **Files:** `src/components/dashboard/StrategicHealthWidget.tsx:23, 42, 65`
- **Trigger:** User pastes API key into dashboard widget. It's persisted to localStorage immediately.
- **Workaround:** Clear browser local storage manually if key is compromised. Use incognito mode for sensitive work.
- **Severity:** High - API key leakage enables third-party API abuse
- **Fix approach:**
  1. Remove localStorage persistence of API key
  2. Require key to be re-entered each session
  3. Or use secure session-only storage (sessionStorage)
  4. Or implement OAuth/backend token exchange

### JSON Parsing in Gemini Response Can Fail Silently
- **Problem:** `src/engine/cloud.ts:65` uses simple regex cleanup and direct `JSON.parse()`. If Gemini returns non-JSON (e.g., error wrapped in HTML), code returns empty array instead of surfacing the error.
- **Files:** `src/engine/cloud.ts:59-72`
- **Trigger:** Gemini API rate limit exceeded, invalid prompt format, or API maintenance
- **Workaround:** Check browser console for "Cloud Synthesis Failed" log. No user feedback in UI.
- **Severity:** Medium - synthesis silently fails, user sees empty insights
- **Fix approach:** Wrap JSON.parse in try-catch. Return structured error type. Propagate to UI error boundary.

## Security Considerations

### Sensitive Data in Workspace Files
- **Risk:** Workspace files (`.vwcg` extension) contain all assessment data including strategic secrets, threat analysis, financial estimates. Stored in localStorage and exported as plain JSON.
- **Files:** `src/store/workspaceStore.ts`, `src/utils/fileSystem.ts`
- **Current mitigation:** None. Files are JSON with no encryption. Users must protect workspace export files manually.
- **Recommendations:**
  - Document in CONTRIBUTING.md that workspaces contain sensitive data
  - Add warning banner when exporting
  - Consider optional AES-256 encryption for workspace files (feature for future)
  - Audit Safe Mode validation doesn't leak data via validation error messages

### API Key Exposure in Development
- **Risk:** `VITE_GEMINI_API_KEY` environment variable may be logged or appear in network requests if frontend passes it directly. Currently it is passed directly in `src/engine/cloud.ts:43`.
- **Files:** `src/engine/cloud.ts:43` (passes key directly in query string)
- **Current mitigation:** Key is optional (feature disabled if missing)
- **Recommendations:**
  - Move Gemini API calls to a backend proxy (future auth refactor)
  - Never expose API key in frontend code
  - Document env var as development-only in README

## Performance Bottlenecks

### Synthesis Engine Runs Synchronously on Every Update
- **Problem:** Every tool data update triggers `runSynthesis()` immediately in `updateToolData()`. No debouncing. For complex workspaces with 8+ rules, this blocks UI.
- **Files:** `src/store/workspaceStore.ts:94-96`
- **Cause:** Synchronous architecture. Insights must be ready immediately for dashboard display.
- **Improvement path:**
  1. Short term: Add debounce (300ms) before synthesis trigger
  2. Medium term: Move synthesis to Web Worker
  3. Long term: Consider incremental rule evaluation (only re-run affected rules)

### Large Component Render Trees
- **Problem:** `UnifiedStrategicBriefing.tsx` (1,021 lines) and `ReportCenter.tsx` (654 lines) are monolithic. Any state change re-renders entire report tree.
- **Files:**
  - `src/report/unified/UnifiedStrategicBriefing.tsx` (1,021 lines)
  - `src/tools/report/ReportCenter.tsx` (654 lines)
- **Cause:** React functional component with no memoization. All sub-sections memoized conditionally but top-level always re-renders.
- **Improvement path:**
  1. Break into smaller memoized components per section (USB-01 to USB-12)
  2. Use `useMemo` for narrative generation (expensive computation)
  3. Add `React.memo` wrappers

### HTML2Canvas Scale 3 = 3x Memory Usage
- **Problem:** PDF generation in `src/report/pdf/PdfGenerator.ts` uses scale factor 3 (288 DPI). For A4-width content, canvas memory can exceed 50MB for single page.
- **Files:** `src/report/pdf/PdfGenerator.ts:68`
- **Cause:** Higher DPI for print quality. No streaming or chunked processing.
- **Improvement path:**
  1. Chunk pages before converting to canvas (process section-by-section)
  2. Implement incremental PDF generation (don't hold entire report in memory)
  3. Add memory warning if report > 10 pages

### LocalStorage Size Limit Risk
- **Problem:** Workspace persists entire `tools` object to localStorage (key: `vwcg-workspace`). No size checks. localStorage limit is 5-10MB depending on browser.
- **Files:** `src/store/workspaceStore.ts:247-260` (persist config)
- **Cause:** Zustand persist middleware saves all state. Large narrative text, chart data, and roadmaps accumulate.
- **Improvement path:**
  1. Monitor persisted state size, warn at 70% capacity
  2. Implement selective persistence (exclude derived metrics, insights)
  3. Add data compression (gzip narratives)
  4. For power users, offer IndexedDB as fallback

## Fragile Areas

### Type Coercion in Synthesis Rules
- **Files:**
  - `src/engine/rules-v2.ts` (uses `??` and loose comparisons)
  - `src/engine/derived-metrics.ts` (assumes tool data structure)
- **Why fragile:** Rules use optional chaining (`?.`) and nullish coalescing (`??`) with hardcoded defaults. If tool schema changes (e.g., field renamed), rules silently accept default value and produce incorrect insights.
- **Safe modification:**
  1. Add Zod schema validation for tool data before passing to rules
  2. Add type guards: `if (typeof dna.current_Execution !== 'number') throw new Error(...)`
  3. Log warnings when using defaults: `console.warn('Leadership DNA missing Execution score, using default 5')`
- **Test coverage gaps:** No unit tests for individual rules. Only E2E tests exercise full flow.

### Edge Case Detector Relies on Array Assumptions
- **Files:** `src/report/quality/EdgeCaseDetector.ts` (701 lines)
- **Why fragile:** Assumes tool data has specific array fields (e.g., `swot.strengths` always exists as array). If any tool skips a field, detector crashes or produces wrong results.
- **Safe modification:** Add explicit array existence checks before `.length` and `.map()` calls. Use type guards.
- **Example fragile code:** Line 93-96 assumes `swot.weaknesses` is array without verification.

### Validation Profiles Split Across 3 Files
- **Files:**
  - `src/validation/profiles_p1.ts` (102 lines)
  - `src/validation/profiles_p2.ts` (91 lines)
  - `src/validation/profiles_p3.ts` (77 lines)
- **Why fragile:** If you need to add a new tool validation, you must decide which of 3 files to modify. No clear ownership. Adding validation for new tool requires coordinating across files.
- **Safe modification:**
  1. Create one validation profile factory per tool
  2. Use directory structure: `src/validation/profiles/{toolId}.ts`
  3. Import all via barrel export
- **Test coverage gaps:** No unit tests for validation rules. Safe Mode testing only via E2E.

## Scaling Limits

### Workspace Data Unbounded Growth
- **Current capacity:** localStorage limit ~5-10MB. Typical workspace (all 11 tools filled) is ~500KB-2MB.
- **Limit:** At 10+ years of historical roadmap data or 100+ narrative exports in metadata, workspace will hit limits.
- **Scaling path:**
  1. Implement data cleanup (archive old roadmaps)
  2. Move to IndexedDB (1GB+ capacity)
  3. Backend persistence (Firebase Firestore is available - app is Firebase-deployed)

### PDF Generation Memory Cap
- **Current capacity:** Max ~15-20 page unified report before memory pressure. Multi-page reports with embedded charts hit limits.
- **Limit:** For 50+ page reports or parallel PDF generation (multiple users), memory exhaustion crashes browser tab.
- **Scaling path:**
  1. Implement chunked PDF generation (generate + save + clear memory + next section)
  2. Add streaming to ServiceWorker if available
  3. For production load, move PDF generation to backend

### Synthesis Rules O(N) Complexity
- **Current capacity:** 8 rules * 11 tools = 88 cross-tool evaluations per update. Fast on modern hardware (~10ms).
- **Limit:** At 20+ rules or deeper cross-tool analysis, synthesis time could exceed 100ms, causing noticeable UI lag.
- **Scaling path:**
  1. Cache rule results (only re-run affected rules when specific tool changes)
  2. Parallelize using Web Workers
  3. Add rule priority/early exit (skip expensive rules if quick rules already found issues)

## Dependencies at Risk

### jsPDF + html2canvas PDF Generation
- **Risk:** Both libraries are mature but html2canvas is known to have edge cases with modern CSS (CSS Grid, Flexbox layout breaks). jsPDF API is stable but not cutting-edge.
- **Impact:** Some reports may render incorrectly in PDF. Debugging CSS issues requires deep knowledge of both libs.
- **Migration plan:** Consider Playwright's `page.pdf()` (already used in E2E tests) or move to backend PDF service (Node.js Puppeteer + PDF-lib).

### Gemini 1.5 Flash API for AI Consultation
- **Risk:** API key-based, rate-limited, pricing changes. No fallback if API disabled.
- **Impact:** AI Consultation feature completely unavailable if API goes down or quotas exceeded.
- **Migration plan:**
  1. Add feature flag for AI Consultation (enable/disable dynamically)
  2. Implement graceful degradation (show cached insights instead of API call)
  3. Plan OpenAI GPT-4 as secondary provider

### Zustand Store Persistence Middleware
- **Risk:** Zustand persist middleware is simple but doesn't handle corrupted localStorage. If state shape changes, old data breaks.
- **Impact:** User loads corrupted workspace, app crashes. Manual localStorage cleanup required.
- **Migration plan:**
  1. Add schema versioning to persisted state
  2. Implement migration functions for old state shapes
  3. Add recovery: if rehydration fails, fall back to fresh workspace

## Missing Critical Features

### No Offline Capability
- **Problem:** App requires network access for synthesis (Gemini API), PDF generation (html2canvas needs rendering context). No offline mode.
- **Blocks:** Executive using app on flight without WiFi. Offline demo/trial.
- **Fix approach:**
  1. Make AI Consultation optional (synthesis already works offline)
  2. Pre-generate PDF in background before app closes
  3. Implement Service Worker caching + IndexedDB for full offline operation

### No Data Backup/Restore UI
- **Problem:** Only export method is JSON. No import UI in main app (only Safe Mode load). No automated backups.
- **Blocks:** Power users can't schedule backups. No disaster recovery path.
- **Fix approach:**
  1. Add automatic daily backup to localStorage dated key
  2. Implement backup/restore UI in Dashboard
  3. Show list of workspace versions with timestamps

### No Multi-User Collaboration
- **Problem:** App is single-user only. No sharing, real-time sync, or comment threads.
- **Blocks:** Teams can't collaborate on single assessment. No version control of workspace changes.
- **Fix approach:**
  1. Implement Firestore Realtime listener (app already uses Firebase)
  2. Add per-tool locking (prevent concurrent edits)
  3. Add change history UI

### No Audit Trail / History
- **Problem:** Provenance tracks only logic version + timestamp, not who changed what or previous values.
- **Blocks:** Can't see what changed between exports. Can't undo individual changes.
- **Fix approach:**
  1. Extend provenance to include previous value + change description
  2. Implement undo/redo UI using provenance log
  3. Add change diff viewer

## Test Coverage Gaps

### No Unit Tests for Synthesis Rules
- **Untested area:** All synthesis logic in `src/engine/rules-v2.ts` (505 lines, 8 rules) and `src/engine/derived-metrics.ts` (580 lines, 6 metrics). Only tested via E2E journeys.
- **Files:**
  - `src/engine/rules-v2.ts` (0% unit test coverage)
  - `src/engine/derived-metrics.ts` (0% unit test coverage)
- **Risk:** Rule logic bugs undetected until E2E test fails. Changes to rule thresholds have no regression protection.
- **Priority:** High - synthesis is core business logic

### No Unit Tests for Validation System
- **Untested area:** Validation profiles (270 lines across 3 files) and validator logic (62 lines). Only tested via E2E Safe Mode import.
- **Files:** `src/validation/profiles_p*.ts`, `src/validation/validator.ts`
- **Risk:** Invalid data passes validation. New profile changes break existing imports silently.
- **Priority:** High - validation is gatekeeper for data integrity

### No Unit Tests for Report Generation
- **Untested area:** Narrative templates (797 lines), report components (~2000 lines), PDF generation (283+ lines). Only tested via E2E PDF journey.
- **Files:** `src/report/narrative/templates.ts`, `src/report/components/`, `src/report/pdf/PdfGenerator.ts`
- **Risk:** Report text formatting bugs, missing sections, incorrect metrics undetected until manual review. PDF rendering issues are brittle.
- **Priority:** Medium - reports are deliverable to client

### No Unit Tests for Store Actions
- **Untested area:** Workspace store actions (Safe Mode, Import, Export, Reset). Only tested via E2E.
- **Files:** `src/store/workspaceStore.ts` (250+ lines of logic)
- **Risk:** State mutations silent fail. Metadata loss during import. Export produces invalid JSON.
- **Priority:** Medium - data integrity

### Limited E2E Test Coverage by Tool
- **Current coverage:** 4 personas (Alex, Mike, Sarah) + 1 smoke test + 1 PDF generation test = 7 test suites.
- **Missing:** No E2E journey for:
  - SOP Taxonomy tool
  - SOP Management tool
  - Business Context tool (newer addition)
  - Multi-tool synthesis insights
  - Safe Mode import validation flows
  - Logic version upgrade flows
- **Priority:** Medium - gaps in persona coverage

### No Performance/Load Tests
- **Untested area:** How app performs with large workspaces (1000+ roadmap tasks, long narrative texts). No browser memory profiling. No CPU usage benchmarks.
- **Risk:** App may be slow or crash under heavy use. Unknown how many users can be served simultaneously.
- **Priority:** Low - not blocking, but important for production readiness

---

*Concerns audit: 2025-02-14*
