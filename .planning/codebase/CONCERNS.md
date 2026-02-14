# Codebase Concerns

**Analysis Date:** 2026-02-14

## Tech Debt

**Unused Old Rules Engine (v1 Rules):**
- Issue: `src/engine/rules.ts` contains 5 legacy synthesis rules (E1-E5) that have been completely replaced by v2 rules but remain in the codebase.
- Files: `src/engine/rules.ts` (230 lines)
- Current status: Not imported by `src/engine/synthesis.ts` (which exclusively uses `rules-v2.ts`), but legacy scripts still reference it (`src/scripts/verify_joe.ts`, `src/scripts/e2e_test_audit_fixes.ts`)
- Impact: Increases codebase maintenance burden, creates confusion about which rules are active, and makes rule audits harder since the legacy rules are not executed but still present.
- Fix approach: Remove `rules.ts` and update the two legacy scripts (`verify_joe.ts`, `e2e_test_audit_fixes.ts`) to import from `rules-v2.ts` or be refactored if they're only for testing.

**Inconsistent Type Safety with `any` Types:**
- Issue: 141 instances of `any` type across the codebase, particularly in critical paths like workspace store, payload assembly, and LLM integration.
- Files:
  - `src/store/workspaceStore.ts` - 5 instances (workspace data, canonicalize function)
  - `src/engine/rules-v2.ts` - 4 instances (SWOT text analysis)
  - `src/engine/derived-metrics.ts` - 17 instances (workspace manipulation)
  - `src/engine/llm/payload-assembler.ts` - 17 instances (cross-tool data access)
  - `src/report/narrative/templates.ts` - 2 instances
  - Multiple report files with `any` types for tool data
- Impact: Loss of TypeScript type checking in critical areas, potential runtime crashes when tool data shapes are unexpected, harder to refactor or add new tools.
- Fix approach: Create a proper `ToolData` discriminated union type or base interface, export specific interfaces for each tool (AIReadinessData, VisionCanvasData, etc.), and gradually replace `any` with typed equivalents. Prioritize files that access multiple tools' data.

**Debouncing Not Implemented for Synthesis:**
- Issue: `src/store/workspaceStore.ts` (line 92-96) acknowledges this via comment: "Debouncing recommended for prod, direct for MVP". Every tool data update runs the entire synthesis engine (8 v2 rules + derivation of 6 metrics) synchronously.
- Files: `src/store/workspaceStore.ts:updateToolData` (lines 86-111)
- Current data: workspace is small (12 tools max), but as workspace grows or rules become more complex, this could cause observable UI lag.
- Impact: Performance degradation on rapid edits (e.g., fast typing in SWOT item text fields). Potential jank in dashboard updates.
- Fix approach: Implement debounced synthesis in the store using `setTimeout` with a 300-500ms delay, or use a library like `debounce-promise`. Store pending synthesis state to prevent stale insights.

**Direct `localStorage` Dependency:**
- Issue: Zustand persist middleware writes directly to `localStorage` with key `'vwcg-workspace'`. No encryption or compression of stored data.
- Files: `src/store/workspaceStore.ts` (line 248, middleware config)
- Impact: Full workspace data (including sensitive business context like founder hours, revenue, growth goals) persists unencrypted in browser storage. Vulnerable if user's device is compromised or if a malicious actor gains file-system access.
- Fix approach: Optional encryption layer for sensitive fields using `TweetNaCl.js` or `libsodium.js` before persist middleware, or migrate to IndexedDB with encryption. Make encryption opt-in via environment flag.

## Known Issues

**JSON Parsing Without Error Boundaries:**
- Symptom: Crashes if corrupt JSON is imported or if API responses are malformed
- Files:
  - `src/engine/cloud.ts` (line 66) - Parses Gemini response directly without try-catch
  - `src/engine/llm/openai-service.ts` (lines 117-126) - Manual JSON.parse on narrative structure
  - Multiple tool import handlers parse JSON without validation wrappers
- Trigger: User attempts to load a corrupted `.vwcg` file, or API response is truncated/malformed
- Workaround: None currently; user must reload the page to recover
- Fix approach: Add JSON parsing wrapper with `try-catch`, return `ValidationResult` with specific parse errors, and display user-friendly error message in Safe Mode.

**Rule Execution Swallows Errors Silently:**
- Symptom: If a synthesis rule throws an exception, it logs a warning but doesn't surface the issue to users
- Files: `src/engine/synthesis.ts` (lines 19-26)
- Current behavior: `console.warn` on rule failure, but insights still generated from remaining rules (partial synthesis)
- Impact: Silent data quality degradation (missing insights) without user awareness
- Fix approach: Collect failed rules into synthesis result metadata, display a banner in Dashboard if any rules failed, and log error details with rule ID for debugging.

**Console Logging in Production:**
- Symptom: 90+ console.log statements across codebase (including sensitive debug info in workspaceStore and LLM services)
- Files: `src/store/workspaceStore.ts` (95-97), `src/engine/cloud.ts` (71), `src/engine/llm/openai-service.ts` (3 instances), and 15 other files
- Impact: Workspace data and API request/response bodies logged to dev console, potentially visible in production error monitoring if console output is captured
- Fix approach: Replace console.log with conditional debug logging (use debug module or environment-gated logging), keep console.error/warn only for actual errors.

## Security Considerations

**API Key Exposure in Client-Side Calls:**
- Risk: VITE_OPENAI_API_KEY and VITE_GEMINI_API_KEY are embedded in client-side code and sent directly from the browser to third-party APIs
- Files:
  - `src/tools/report/ReportCenter.tsx` (line 85) - reads VITE_OPENAI_API_KEY
  - `src/engine/cloud.ts` (line 43) - constructs Gemini API URL with key in query param
  - `src/engine/llm/openai-service.ts` (line 73) - Authorization header with raw key
- Current mitigation: Env vars are prefixed with VITE_ (public), users must provide their own keys
- Recommendations:
  1. Migrate to backend proxy: create a `/api/openai-proxy` endpoint that accepts sanitized requests and forwards to OpenAI/Gemini with server-side keys
  2. Implement request signing and rate limiting at the proxy layer
  3. Add telemetry to detect key abuse or unusual patterns
  4. Document in onboarding that keys should be treated as secrets and rotated if exposed

**Workspace Data Contains Sensitive Business Information:**
- Risk: Founder hours, revenue range, employee count, growth goals, advisor relationships, and strategic intent are all stored in localStorage without encryption
- Files: `src/store/workspaceStore.ts`, all tool data structures
- Current mitigation: Private browser storage only (same-origin policy applies)
- Recommendations:
  1. Add explicit data classification in tool definitions (e.g., `isSensitive: true` flag)
  2. Implement workspace export encryption (user-provided passphrase)
  3. Add data deletion warnings when exporting or sharing workspaces
  4. Consider server-side backup option with enterprise encryption (future phase)

**Validation Profiles Missing Error Handling:**
- Risk: Profile validation failures in `src/validation/validator.ts` (line 50) are only warned, not enforced
- Files: `src/validation/validator.ts:validateWorkspace` (lines 40-52)
- Current behavior: Missing profile is logged but workspace is still imported
- Impact: Invalid data can slip through Safe Mode if a profile is missing from registry
- Fix approach: Throw validation error if a tool's profile is missing, or provide sensible defaults per tool

**No Rate Limiting on LLM Calls:**
- Risk: User can spam "Generate with AI" button, incurring unexpected API costs and potentially hitting rate limits
- Files: `src/tools/report/ReportCenter.tsx` (LLM generation handlers), `src/engine/llm/openai-service.ts`
- Current mitigation: Retry logic with exponential backoff (lines 115-130 in openai-service.ts)
- Recommendations: Add client-side debounce/cooldown (e.g., 30-second minimum between generation requests), display remaining tokens or cost estimates, add event logging for AI generation usage.

## Performance Bottlenecks

**Large Report Components (1000+ lines):**
- Problem: Three report components exceed 1000 lines, making them slow to render and hard to maintain
- Files:
  - `src/report/unified/UnifiedStrategicBriefing.tsx` (1021 lines)
  - `src/report/narrative/templates.ts` (799 lines)
  - `src/report/individual/VisionCanvasReport.tsx` (740 lines)
- Cause: Monolithic template rendering with conditional sections and narrative generation inlined
- Impact: Slow initial report render, high memory usage during PDF generation, hard to optimize specific sections
- Improvement path:
  1. Break UnifiedStrategicBriefing into sub-components (CoverPage, ExecutiveSnapshot, StrengthsSection, etc.) — each as a separate file
  2. Move template logic to `src/report/narrative/` as pure functions returning JSX
  3. Implement lazy rendering for below-the-fold sections in preview mode
  4. Add React.memo on report section components to prevent unnecessary re-renders

**Synchronous PDF Generation with html2canvas:**
- Problem: PDF generation on large reports (12+ pages) blocks the main thread during html2canvas capture and jsPDF writing
- Files: `src/report/pdf/PdfGenerator.ts` (lines 190-230), `src/report/pdf/PrintPdfService.ts`
- Scale factor: 3x (300 DPI) captures high-quality but memory-intensive canvases
- Impact: UI freezes for 2-5 seconds on report generation, poor UX on slower devices
- Improvement path:
  1. Move PDF generation to a Web Worker to avoid main thread blocking
  2. Implement chunked rendering (render page-by-page, reduce memory footprint)
  3. Add progress indicator + estimated time remaining
  4. Consider server-side PDF generation for unified briefing (defer to backend if performance is critical)

**No Memoization on Derived Metrics:**
- Problem: `computeDerivedMetrics()` recomputes all 6 metrics on every synthesis run, even if input data hasn't changed
- Files: `src/engine/derived-metrics.ts`, called from `src/engine/synthesis.ts` indirectly via `assemblePayload`
- Current trigger: Every `updateToolData()` call
- Impact: Wasteful recomputation, especially for metrics that scan SWOT text or iterate over roadmap tasks
- Improvement path: Add result caching with input hash (tool data fingerprint), or use `useMemo` in components that call `computeDerivedMetrics()`.

**Random Array Shuffling in Narrative Templates:**
- Problem: `sample()` function in `src/report/narrative/templates.ts` (line 30) uses `Math.random()` for Fisher-Yates shuffle, called during every narrative generation
- Impact: O(n log n) re-sort on every template evaluation, unnecessary for deterministic narrative generation
- Improvement path: Replace with `crypto.getRandomValues()` for cryptographic-grade randomness if seeding is required, or use a fixed seed based on workspace ID for reproducible narratives (better for QA and audits).

## Fragile Areas

**Synthesis Engine Rules with Hard-coded Field Assumptions:**
- Files: `src/engine/rules-v2.ts` (all 9 rules), `src/engine/derived-metrics.ts`
- Why fragile: Rules assume specific field names (e.g., `dna.current_Execution`, `vision.pillars`, `swot.weaknesses`) without defensive checks. If a tool schema changes, rules break silently.
- Example fragility: Line 19-25 in visionExecutionMismatch assumes `vision.pillars` is an array; if it's undefined or null, the rule returns null instead of warning
- Safe modification:
  1. Add field existence guards with explicit fallback defaults
  2. Create tool schema types and validate before rule execution
  3. Add integration tests for each rule with missing/malformed data
  4. Document the exact field contracts each rule depends on

**SWOT Text Analysis with Regex Patterns:**
- Files: `src/engine/rules-v2.ts`, `src/engine/swot-keywords.ts` (keyword scanning)
- Why fragile: Keyword matching uses case-insensitive regex (e.g., line 70: `/\b(balance|wellbeing|people|...)\b/`). User typos, abbreviations, or domain-specific terminology (e.g., "work-balance" vs "balance") can cause false negatives.
- Example: Founder enters "staff burn-out" vs "burnout" — keyword scanner might miss it depending on regex
- Safe modification:
  1. Build a proper keyword taxonomy with synonyms (use a JSON lookup table or trie)
  2. Implement phonetic matching (Soundex) for typo tolerance
  3. Add logging to SWOT scanning so users can see what keywords were matched
  4. Make keyword lists configurable (allow domain experts to tune patterns)
  5. Add integration tests with edge cases (contractions, misspellings, domain jargon)

**Validation Profile Registry Without Fallbacks:**
- Files: `src/validation/validator.ts` (lines 40-52), `src/validation/types.ts` (ValidationProfiles)
- Why fragile: If a tool is added to the registry but no validation profile is defined, the validator logs a warning and continues. Data can import without validation.
- Example: New tool added to `src/registry/registry.ts` but developer forgets to add a profile in `src/validation/` → unsafe data passes Safe Mode
- Safe modification:
  1. Make validation profile required at tool registration time (enforce in `registerTool()`)
  2. Create a "default" profile that at minimum checks for empty data structures
  3. Add pre-deployment checks (jest test) that verify every registered tool has a profile
  4. Add type-safety: update `ToolDefinition` to require `validationProfileId` (no `?` optional)

**ReportCenter State Machine (Multiple Async Operations):**
- Files: `src/tools/report/ReportCenter.tsx` (lines 71-200)
- Why fragile:
  - Multiple boolean flags (`llmGenerating`, `isGenerating`, `llmNeedsReview`) manage complex state
  - Race conditions: user can click "Generate" multiple times before async LLM call completes
  - No cleanup if user navigates away during generation
- Example failure: User clicks "Generate with AI", then immediately clicks "Save" → old request may overwrite newer data
- Safe modification:
  1. Consolidate state into single enum (`status: 'idle' | 'generating' | 'reviewing' | 'error'`)
  2. Use AbortController to cancel in-flight requests on unmount or state reset
  3. Add request deduplication (track request ID, ignore duplicate results)
  4. Add timeout handling (show timeout error if generation exceeds 2 minutes)

## Scaling Limits

**Workspace Store Persists Entire State to localStorage:**
- Current capacity: Typical business context (10-50 SWOT items, 3-10 vision pillars, 20-50 roadmap tasks) = 50-100 KB JSON
- Limit: Most browsers limit localStorage to 5-10 MB per origin. At 50 KB per workspace, this allows ~100-200 workspaces before hitting quota.
- Problem: No archival, no cleanup, no quota monitoring
- Scaling path:
  1. Implement archive mechanism (move old workspaces to IndexedDB with compressed storage)
  2. Add quota monitoring with user warnings at 80% capacity
  3. Move large blobs (PDF previews, exported reports) to separate storage (IndexedDB or server)
  4. Implement workspace versioning (keep only last 3 versions by default)

**PDF Generation Memory Usage:**
- Current: html2canvas at 3x scale on 12-16 page report creates canvas ~7200×19000 pixels at 24-bit color = ~400-500 MB in-memory canvas
- Limit: Devices with <2 GB RAM will struggle; mobile devices especially affected
- Scaling path:
  1. Implement page-by-page PDF generation (render, capture, add to PDF, release memory, repeat)
  2. Add quality tier selector (draft: 2x scale, final: 3x scale)
  3. Offer server-side PDF generation option for enterprise deployments
  4. Add progress tracking + estimated time on large reports

**Number of Active Synthesis Rules:**
- Current: 9 v2 rules execute on every tool update
- Limit: Execution time is negligible now, but at 20-30 rules, this becomes observable
- Scaling path: Implement rule pre-filtering (certain rules only run if specific tools are modified), or move to lazy evaluation (compute insights on-demand in dashboard).

## Dependencies at Risk

**html2canvas for PDF Generation:**
- Risk: html2canvas is a complex browser-to-canvas rendering library with known issues around SVG rendering, CSS transforms, and web fonts. Project has lower maintenance frequency.
- Impact: PDF quality degrades with complex layouts or unsupported CSS. If library stops accepting fixes, custom solutions are expensive.
- Migration plan: Evaluate alternatives:
  1. Puppeteer (headless Chromium) — more reliable but requires server-side rendering
  2. TCPDF (PHP-based server backend) — if moving to backend
  3. ReportLab (Python) — for server-side generation
  Recommend Puppeteer for phase upgrade if PDF reliability becomes critical.

**Zustand Persist Middleware:**
- Risk: Zustand is maintained but smaller community than Redux. Persist middleware is an optional plugin, less battle-tested than core store.
- Impact: Browser storage behavior edge cases (quota exceeded, private browsing mode, iOS Safari limitations) may cause unexpected issues.
- Mitigation: Already implemented — store has explicit recovery logic in `commitWorkspace()` (line 154-169 in workspaceStore.ts) and `onRehydrateStorage` callback.
- Action: No change needed currently, but document localStorage edge cases in troubleshooting guide.

**OpenAI API Dependency for LLM Narrative:**
- Risk: OpenAI API costs, rate limits, and potential service degradation
- Impact: AI Briefing generation may fail or incur unexpected costs if user does repeated generations
- Mitigation: No current rate limiting or cost controls
- Recommendations:
  1. Add OpenAI token counter before generation (warn user of estimated cost)
  2. Implement per-session generation limit (e.g., 3 generations max per workspace)
  3. Add cost tracking in metadata (`totalTokensUsed`, `estimatedCost`)
  4. Document in UI that AI features incur costs

**TypeScript `verbatimModuleSyntax` Strictness:**
- Risk: This newer TS setting prevents type-only imports without explicit `type` keyword. Not all third-party packages expose proper type-only exports, causing build failures on upgrades.
- Impact: Version bumps for dependencies may fail type checking if they don't export types correctly.
- Mitigation: Already in use (see tsconfig.app.json), but fragile across ecosystem
- Action: Monitor for build failures after dependency upgrades, be prepared to loosen strictness if needed.

## Test Coverage Gaps

**Synthesis Rules Have No Unit Tests:**
- What's not tested: Each of the 9 v2 rules in `src/engine/rules-v2.ts` executes live in app, but no isolated unit tests verify correct behavior with edge cases.
- Files: `src/engine/rules-v2.ts`, no test file found
- Risk:
  - Rules silently fail to fire if assumptions are violated
  - Regex patterns for keyword matching are untested (e.g., typo sensitivity, edge cases)
  - Rule conflicts or overlaps go unnoticed
- Test plan: Create `src/engine/rules-v2.test.ts` with:
  - One test per rule with minimal passing data
  - One test per rule with missing/malformed data (defensive testing)
  - Cross-rule conflict tests (e.g., do two rules fire on the same data?)
  - Keyword matching tests for SWOT analysis (typos, abbreviations, synonyms)
  - Priority: High — rules are the core business logic

**Validation Profiles Have No Unit Tests:**
- What's not tested: Tool-specific validation profiles in `src/validation/profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts`
- Files: 3 profile files, no test file found
- Risk: Invalid data can import in Safe Mode if profile logic is broken
- Test plan: Create `src/validation/profiles.test.ts` with:
  - One test per profile with valid data (should pass)
  - One test per profile with minimal data (required fields only)
  - One test per profile with invalid data (should fail with specific error code)
  - Cross-profile consistency (are severity codes consistent across profiles?)
  - Priority: High — validation is the safety gate for imports

**LLM Integration Has No Tests:**
- What's not tested: `src/engine/llm/openai-service.ts` and related payload assembly
- Files: No test file found
- Risk:
  - API response parsing failures go unnoticed
  - Retry logic and timeout handling are untested
  - Payload assembly may include invalid field references if tool data changes
- Test plan: Create `src/engine/llm/openai-service.test.ts` with:
  - Mock OpenAI API responses (success, rate-limit, timeout, malformed response)
  - Narrative structure validation (isValidNarrativeStructure tests)
  - QA validation tests with edge-case narratives
  - Retry logic tests (verify exponential backoff, max retries)
  - Priority: Medium — LLM is optional feature, but errors should be graceful

**Report Components Have No Snapshot Tests:**
- What's not tested: Large report components like UnifiedStrategicBriefing and individual report components
- Files: `src/report/unified/`, `src/report/individual/`
- Risk:
  - Rendering errors go unnoticed in report generation
  - Layout changes break PDF output visually
  - Narrative text generation regressions are hard to catch
- Test plan: Create snapshot tests for each report component with mock workspace data, use Playwright visual regression tests for PDF output, test with diverse workspace states (empty data, max data, edge cases).
  - Priority: Medium-High — reports are user-facing output

**Safe Mode Workflow Has No E2E Tests:**
- What's not tested: Import workflows in Safe Mode (`stageWorkspace` → `commitWorkspace`)
- Files: E2E test for import flow not found
- Risk: Workspace import can silently corrupt data if validation is bypassed
- Test plan: Create Playwright test in `tests/journeys/` that:
  1. Exports a complete workspace
  2. Intentionally corrupts JSON (remove required fields, inject invalid data)
  3. Attempts to import → verify Safe Mode warning
  4. Selectively reimports tools → verify data integrity
  - Priority: High — data integrity is critical

---

*Concerns audit: 2026-02-14*
