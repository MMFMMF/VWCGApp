# Codebase Concerns

**Analysis Date:** 2026-02-13

## Tech Debt

**Widespread Use of `any` Type:**
- Issue: 91 instances of `any` type across codebase bypass TypeScript's strict type checking. Particularly in `src/engine/derived-metrics.ts`, `src/engine/rules-v2.ts`, `src/tools/report/ReportCenter.tsx`, and `src/store/workspaceStore.ts`.
- Files: `src/store/workspaceStore.ts`, `src/engine/derived-metrics.ts`, `src/engine/rules-v2.ts`, `src/validation/validator.ts`, `src/tools/report/ReportCenter.tsx`
- Impact: Type safety gaps prevent compile-time error detection, especially in workspace data transformations and rule execution pipelines. This becomes critical as the codebase scales to more tools.
- Fix approach: Incrementally replace `any` with proper interfaces. Start with workspace-level types: create strict interfaces for workspace state, tool data structures, and insight objects. Use discriminated unions for tool data variants.

**Two Report Systems Co-Exist:**
- Issue: Old PDF system (`src/tools/report/PdfService.ts`) and new system (`src/report/pdf/PdfGenerator.ts`) both active. Legacy system untouched but no longer used by ReportCenter.
- Files: `src/tools/report/PdfService.ts` (legacy, 283 lines), `src/report/pdf/PdfGenerator.ts` (new, 283 lines)
- Impact: Maintenance burden; confusion about which system to use; potential for bugs if code reverts to legacy implementation; wastes ~560 lines of duplicated logic.
- Fix approach: Verify all reporting paths use new system, then remove `src/tools/report/PdfService.ts` in the next major version. Document the migration in CHANGELOG.

**Old Synthesis Rules Never Removed:**
- Issue: `src/engine/rules.ts` (E1-E5 rules) exists but is no longer imported. `src/engine/synthesis.ts` imports only `rules-v2.ts`. Creates confusion about which rules are active.
- Files: `src/engine/rules.ts` (not imported), `src/engine/synthesis.ts` (uses only rulesV2)
- Impact: Developer confusion during maintenance; potential for bugs if someone re-enables old rules; increases bundle size minimally but adds cognitive load.
- Fix approach: Remove `src/engine/rules.ts` entirely. Document that it was replaced by rules-v2 in CHANGELOG. Ensure no other files import from it.

**Untyped Workspace Transformations in Store:**
- Issue: `updateToolData()` in `src/store/workspaceStore.ts` merges arbitrary data without validation. Tool data shapes are inferred at runtime rather than declared.
- Files: `src/store/workspaceStore.ts` lines 86-111
- Impact: Silent data corruption possible; synthesis rules may fail with cryptic errors if malformed data reaches them; hard to debug.
- Fix approach: Create tool-specific data schemas. Before merge, validate incoming data against the schema. Use runtime validators (Zod or simple discriminated unions) for critical tool paths.

## Known Bugs

**Synthesis Rule Error Handling Too Silent:**
- Symptoms: If a synthesis rule throws an error, it's logged to console but execution continues. Users see no warning, insights silently disappear.
- Files: `src/engine/synthesis.ts` lines 24-26
- Trigger: Any invalid data in workspace (e.g., malformed SWOT array) causes rules to throw during execution.
- Workaround: Check browser console for `Rule {id} failed execution` warnings. Inspect workspace data manually.

**Founder Dependency Index Score Calculation Has Edge Case:**
- Symptoms: If roadmap has 0 tasks, `computeFounderDependencyIndex()` skips the delegation check entirely (lines 116-134 in `src/engine/derived-metrics.ts`). Workspaces with no roadmap appear to have lower FDI than they should.
- Files: `src/engine/derived-metrics.ts` lines 114-134
- Trigger: User hasn't filled out roadmap yet; FDI is calculated and underestimates founder dependency.
- Workaround: The check is defensible (missing data = no evidence of delegation), but misleading. Should flag this as "insufficient data" rather than "delegation OK."

**Type Coercion in Leadership Archetype Detection:**
- Symptoms: `computeLeadershipArchetype()` initializes all scores to 5 if DNA tool is missing (line 394-400), then proceeds to classify leader. Results in "Generalist Leader" for any workspace without Leadership DNA data, which may not be meaningful.
- Files: `src/engine/derived-metrics.ts` lines 382-400
- Trigger: User loads workspace without having completed Leadership DNA assessment.
- Workaround: Check metadata to confirm Leadership DNA was completed before displaying archetype.

## Security Considerations

**Gemini API Key Embedded in Fetch URL:**
- Risk: API key is passed in query string of fetch request (`src/engine/cloud.ts` line 43). If request is logged by proxy/CDN, key may be exposed in logs. HTTP headers are preferred.
- Files: `src/engine/cloud.ts` line 43
- Current mitigation: API key is optional (from env var only); feature disabled if no key provided. No logging currently captures full URL.
- Recommendations: Move API key from query param to `Authorization: Bearer` header. Add request logging with key redaction if debug logging is added.

**Workspace Data Sent Unencrypted to Gemini:**
- Risk: If AI Consultation feature is used, full workspace (including potentially sensitive business data) is sent to Gemini API over HTTPS. User data is stored on Google servers temporarily.
- Files: `src/engine/cloud.ts` lines 24-40
- Current mitigation: Feature is opt-in (requires API key); no data is persisted locally after request.
- Recommendations: Display explicit consent dialog before first use. Provide data preview showing what will be sent. Allow users to exclude specific fields (e.g., financial data, personal names).

**No CSRF Protection on Export:**
- Risk: Export button saves workspace JSON with no CSRF token validation. Malicious page could trigger export without user consent (low-risk for SPA but still worth noting).
- Files: `src/components/ui/ExportButton.tsx`
- Current mitigation: Export is client-side only; no server requests made. Worst case: triggers download dialog (UX nuisance).
- Recommendations: SPA architecture already mitigates this; no action needed unless backend is added.

**localStorage Lacks Encryption:**
- Risk: Workspace data stored in plain localStorage. If machine is compromised, attacker has access to all business strategy data, scores, and roadmaps.
- Files: `src/store/workspaceStore.ts` (uses Zustand persist with localStorage key `vwcg-workspace`)
- Current mitigation: Data is stored client-side only; no sensitive credentials in workspace.
- Recommendations: For production, consider Web Crypto API encryption of localStorage. Alternatively, encourage users to export and store offline. Document that localStorage is unencrypted.

## Performance Bottlenecks

**Synthesis Runs Synchronously on Every Tool Update:**
- Problem: `updateToolData()` in `src/store/workspaceStore.ts` calls `runSynthesis()` synchronously every time any tool data changes. For complex workspaces, this blocks UI updates.
- Files: `src/store/workspaceStore.ts` lines 86-111
- Cause: No debouncing or batching; synthesis runs eagerly on every keystroke in tool UI.
- Improvement path: Add 500ms debounce to synthesis runs using `useEffect` in consuming components OR batch updates to store before triggering synthesis. Measure baseline with Chrome DevTools (Performance tab) to confirm impact.

**Edge Case Detector Runs on Every Render:**
- Problem: `detectEdgeCases()` in `src/tools/report/ReportCenter.tsx` is called in `useMemo` with `[tools]` dependency, causing full re-scan on any tool change.
- Files: `src/tools/report/ReportCenter.tsx` lines 76-78
- Cause: Full scan of all SWOT entries, AI scores, and assessment data. EdgeCaseDetector.ts has 701 lines of analysis logic.
- Improvement path: Cache edge case detection results in store state. Invalidate only when specific tool data changes (not metadata). Memoize internal calculations.

**UnifiedStrategicBriefing Renders All Report Sections:**
- Problem: 1001-line component renders all 6 individual reports + unified narrative even when user is in individual report view.
- Files: `src/report/unified/UnifiedStrategicBriefing.tsx` (1001 lines)
- Cause: Single component doesn't lazy-load individual sections; all DOM nodes are created at once.
- Improvement path: Split into lazy-loaded sections. Use `React.lazy()` for individual report sections. Hide offscreen sections with CSS `display: none` only as temp fix; prefer code-splitting.

**PDF Generation Captures at 3x Scale:**
- Problem: `html2canvas` with `scale: 3` (CAPTURE_SCALE in PdfGenerator.ts line 68) requires 3x memory for rendering large reports.
- Files: `src/report/pdf/PdfGenerator.ts` line 68
- Cause: 300 DPI requirement drives 3x scale factor. For large workspaces with many roadmap items, this can cause memory pressure.
- Improvement path: Test if scale 2 is acceptable for target printers. If 3x is mandatory, add progress indicator for long captures and implement chunked rendering for multi-page PDFs.

## Fragile Areas

**Leadership DNA Gap Calculations Assume Numeric Scores:**
- Files: `src/engine/derived-metrics.ts` lines 40-71, `src/engine/rules-v2.ts` lines 160-198
- Why fragile: If Leadership DNA tool ever changes to store strings or objects instead of numbers, derived metrics will silently produce NaN. No type guard before arithmetic operations.
- Safe modification: Add explicit type guards: `if (typeof executionScore !== 'number') return null;` at start of metric functions. Create `LeadershipDnaData` interface with required `current_*` and `target_*` fields.
- Test coverage: No unit tests for edge cases (missing scores, all-zero scores, negative values from future data corruption).

**SWOT Keyword Analysis Depends on Text Structure:**
- Files: `src/engine/swot-keywords.ts`, used throughout `src/engine/rules-v2.ts`
- Why fragile: Rules trigger based on presence of keywords ('bottleneck', 'burnout', 'capacity') in SWOT weaknesses. If user data format changes or keyword list becomes stale, rules silently don't fire.
- Safe modification: Add explicit keyword configuration per rule. Create e2e tests with realistic SWOT data. Add logging when keyword matches occur (for debugging).
- Test coverage: No tests for keyword matching; no tests for false positives.

**Validation Profile Registration Happens at Startup:**
- Files: `src/validation/index.ts`, called from `src/main.tsx` line 12
- Why fragile: If `initializeValidation()` throws, entire app fails to boot. If a profile is invalid, error is silent.
- Safe modification: Wrap initialization in try/catch. Log validation profile registration results. Add a status check in App.tsx to verify profiles are loaded before allowing imports.
- Test coverage: No tests for validation initialization; no tests for missing profiles.

**Tool Registry Depends on Barrel Exports:**
- Files: `src/tools/*/index.ts` (barrel files), imported in `src/registry/registry.ts`
- Why fragile: If a tool's barrel export is broken (e.g., incorrect import path), entire registry fails to load. Build will catch this, but development experience is poor (no fast feedback).
- Safe modification: Add explicit registry entry validation in `initializeRegistry()`. Log each tool as it registers. Test registry with missing/broken tool entries.
- Test coverage: No tests for registry resilience.

## Scaling Limits

**Zustand Store Persistence Uses Full State Serialization:**
- Current capacity: localStorage typically allows 5-10MB per domain. Full workspace JSON with all tools is currently ~200KB, leaving room for ~25-50 workspaces of similar size.
- Limit: If app adds more tools or collects more detailed data, store could hit 50MB+ per workspace (e.g., if roadmap expands to 500+ tasks with detailed comments).
- Scaling path: Implement selective persistence (persist only changed tools, not full state). Add data pruning (archive old roadmaps). Consider IndexedDB instead of localStorage for larger data. Add UI warning when workspace approaches size limits.

**Synthesis Rules Are O(n) Per Tool:**
- Current capacity: 8 rules x 12 tools = 96 rule executions per update. Each rule scans arrays (SWOT, roadmap, vision pillars).
- Limit: Adding more rules or larger data arrays (e.g., 100+ roadmap tasks) could push synthesis runtime to >1s, blocking UI.
- Scaling path: Index workspace data once at store level. Pass indexed data to rules instead of raw state. Cache rule results per tool. Add rule execution timeout (bail out if >500ms).

**Report System Renders All Sections at Once:**
- Current capacity: Unified Strategic Briefing component is 1001 lines; 6 individual reports each 400-700 lines. Total reportable state: ~5000 lines of JSX.
- Limit: If more reports are added or existing reports expand (e.g., per-person breakdowns in Advisor Readiness), render time could exceed 5s. PDF generation would stall.
- Scaling path: Implement virtual scrolling for report sections. Use React.lazy() for individual reports. Paginate large data tables (e.g., roadmap tasks) within reports.

## Dependencies at Risk

**html2canvas Version 1.4.1 - Unmaintained Risk:**
- Risk: html2canvas development is slow; no major updates in 6+ months. If browser rendering changes break canvas capture, no timely fix.
- Impact: PDF generation could silently produce low-quality PDFs or fail in newer browsers.
- Migration plan: Monitor for alternatives (e.g., Playwright, Puppeteer on serverless backend). Alternatively, switch to server-side PDF generation (e.g., Headless Chrome) if desktop-local generation fails.

**Chart.js Version 4.5.1 - Migration Path Exists:**
- Risk: Chart.js v5 released; v4 is in maintenance mode. Report charts may not support new browser features.
- Impact: Slow rendering on large datasets; potential accessibility issues with custom chart implementations.
- Migration plan: No urgency, but plan migration to v5 before end of 2026. Test all report charts after upgrade.

**React 19.2.0 - Cutting Edge, Monitor for Stability:**
- Risk: React 19 is very recent; production apps may surface unknown issues over next 6-12 months.
- Impact: Potential incompatibilities with future libraries; may need to downgrade to v18 if critical issues emerge.
- Migration plan: Monitor React security advisories. Pin to v19.2.x for now. Have a rollback plan to v18 if major bugs surface.

## Missing Critical Features

**No Offline Support:**
- Problem: App requires internet connection to load; no service worker or offline cache. User loses access if network drops mid-session.
- Blocks: Use on airplanes, in remote locations, or after network interruption.

**No Data Backup/Version History:**
- Problem: Users can overwrite workspace data with no undo. Single export button provides no history of changes.
- Blocks: Accidental data loss; inability to compare strategy versions over time.

**No Multi-User Collaboration:**
- Problem: App is single-user only. Teams must take turns editing or manually merge VWCG files.
- Blocks: Real-time team assessment; collaborative strategy sessions.

**No Mobile/Responsive UI:**
- Problem: App is desktop-first; limited testing on tablets. Report UI may not render well on mobile.
- Blocks: Using app on mobile devices; on-the-go assessment and reporting.

## Test Coverage Gaps

**Untested Area: Synthesis Rule Execution with Partial Data:**
- What's not tested: Rules handle missing tool data gracefully, but behavior with *partial* data (e.g., Leadership DNA missing `target_` fields) is not validated.
- Files: `src/engine/rules-v2.ts` (all 8 rules), `src/engine/synthesis.ts`
- Risk: Rule execution may fail with cryptic errors if data structure changes or user provides incomplete input.
- Priority: High

**Untested Area: Edge Case Detection with Extreme Values:**
- What's not tested: EdgeCaseDetector doesn't have tests for extreme scores (all 0, all 100, mix of NaN/null). Behavior with malformed SWOT entries untested.
- Files: `src/report/quality/EdgeCaseDetector.ts`
- Risk: Report framing may be incorrect for extreme scenarios; misleading guidance to users.
- Priority: High

**Untested Area: PDF Generation Across All Report Types:**
- What's not tested: PDF generation is tested for individual reports in e2e tests, but edge cases (very long text, missing data, special characters) are not validated. Pagination untested for large datasets.
- Files: `src/report/pdf/PdfGenerator.ts`, `src/report/individual/*`
- Risk: PDFs may be malformed or unreadable for certain workspace configurations.
- Priority: Medium

**Untested Area: Workspace Import/Export Roundtrip:**
- What's not tested: Export to JSON and re-import should preserve all data exactly. No tests validate that exported workspaces can be re-imported without data loss.
- Files: `src/store/workspaceStore.ts` (exportState), `src/validation/validator.ts`
- Risk: Users may lose data during export/import cycle.
- Priority: High

**Untested Area: localStorage Persistence Across Browser Restarts:**
- What's not tested: Zustand persist middleware is tested in isolation, but full app persistence flow is not validated (save → close tab → reopen → verify data loaded).
- Files: `src/store/workspaceStore.ts` (onRehydrateStorage hook), `src/main.tsx`
- Risk: Users may lose work if persistence fails silently.
- Priority: Medium

**Untested Area: Validation Profile Integration:**
- What's not tested: ValidationProfiles are registered at startup, but no tests verify that all registered tools have valid profiles, or that profile validation actually prevents bad data from entering the store.
- Files: `src/validation/index.ts`, `src/validation/validator.ts`
- Risk: Invalid tool data may pass through validation and corrupt downstream synthesis rules.
- Priority: High

---

*Concerns audit: 2026-02-13*
