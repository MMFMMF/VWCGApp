# Codebase Concerns

**Analysis Date:** 2026-02-13

## Tech Debt

**Untyped Tool Data Storage:**
- Issue: `tools: Record<string, any>` in `src/store/workspaceStore.ts` line 32 allows arbitrary data without type safety across the entire tool system.
- Files: `src/store/workspaceStore.ts:32`, all tool implementations in `src/tools/`
- Impact: Cannot catch data mismatches at compile time. Cross-tool synthesis rules rely on assumptions about data shape (e.g., `dna.current_Execution`, `vision.pillars`). A tool schema change breaks consumers silently at runtime.
- Fix approach: Create discriminated union types for each tool's data shape (e.g., `type ToolData = LeadershipDnaData | VisionCanvasData | ...`). Update `updateToolData` to accept typed payloads and validate before storage.

**Synchronous Synthesis on Every Update (No Debouncing):**
- Issue: `updateToolData` in `src/store/workspaceStore.ts:86-111` runs `runSynthesis()` synchronously on every keystroke or state change.
- Files: `src/store/workspaceStore.ts:86-96`, `src/engine/synthesis.ts:23-46`
- Impact: 5 synthesis rules execute on every tool update. At scale (when rules add AI calls), this will become a performance bottleneck. In MVP, causes excessive logging (lines 95-97: console.logs on every update).
- Fix approach: Implement a debounce/throttle wrapper around synthesis (300ms default). Only run after user stops editing. Or queue synthesis calls on a requestAnimationFrame schedule.

**Generic API Key Storage in localStorage:**
- Issue: Gemini API key stored plaintext in `localStorage.getItem('VWCG_GEMINI_KEY')` in `src/components/dashboard/StrategicHealthWidget.tsx:23` and `src/tools/report/ReportCenter.tsx`.
- Files: `src/components/dashboard/StrategicHealthWidget.tsx:23,42,65`, `src/tools/report/ReportCenter.tsx` (referenced in CLAUDE.md)
- Impact: API key exposed to XSS attacks. Any malicious script with DOM access can read the key and make unauthorized API calls. No encryption or session-based alternative.
- Fix approach: Use sessionStorage instead (cleared on browser close). Better: Proxy API calls through a backend endpoint that holds the key server-side. Immediate: Add a warning banner when key is stored.

**Workspace State Exposed to Full AI Serialization:**
- Issue: `consultAi()` in `src/engine/cloud.ts:31` sends entire workspace as JSON to Gemini API without sanitization.
- Files: `src/engine/cloud.ts:16-48`
- Impact: Sends all tool data, metadata, and user context to external API. No filtering of sensitive business information. GDPR/privacy risk if workspace contains proprietary data.
- Fix approach: Sanitize payload before send—remove non-essential metadata, hash/truncate long text, allow user opt-in for full data. Add data classification prompt to user ("This data will be sent to Google...").

**Fuzzy Keyword Matching in Synthesis Rules:**
- Issue: `unmitigatedThreatRule` in `src/engine/rules.ts:76-81` uses naive substring matching (`taskText.includes(searchPhrase)`) to detect if roadmap tasks address SWOT threats.
- Files: `src/engine/rules.ts:53-95`
- Impact: False positives/negatives. "Customer" threat matched to "customer service" task. "Competitive" threat missed if phrased as "rival". Users ignore insights due to low precision.
- Fix approach: Use semantic similarity scoring (e.g., fuzzy match library like `fuse.js`) or LLM-based matching. Or require explicit threat→task linking in UI.

**Validation Profiles Partially Registered:**
- Issue: Only some tools have `validationProfileId` set. Validator in `src/validation/validator.ts:40-42` warns if profile missing but doesn't enforce.
- Files: `src/validation/validator.ts`, tool definitions in `src/registry/registry.ts`
- Impact: Tools without profiles skip validation entirely. New tools can be added without validation. Inconsistent data quality across tools.
- Fix approach: Require every tool to have a validation profile. In CI/CD, fail build if tool registered without profile. Add test that all tools have profiles.

**Export Cooldown May Frustrate Users:**
- Issue: 5-second export cooldown in `src/store/workspaceStore.ts:212-215` throws error on rapid export attempts with no retry UI.
- Files: `src/store/workspaceStore.ts:208-245`
- Impact: User clicks "Export" twice by accident → error alert. No queuing or debounce—just failure. UX feels broken.
- Fix approach: Implement a queue (batch rapid exports into one) or show countdown timer on disabled button. Or reduce cooldown to 1 second with better reasoning.

## Known Bugs

**Synthesis Rule May Return on First Match:**
- Issue: `unmitigatedThreatRule` returns after finding first unmitigated threat (line 82-90). If multiple threats exist, only reports one.
- Files: `src/engine/rules.ts:75-92`
- Trigger: SWOT with 3+ high-confidence threats, some unaddressed in roadmap.
- Workaround: None. User must export/re-import to see next insight.
- Fix: Modify to collect all unmitigated threats and return array of insights, or return insight per threat and let synthesis dedup.

**ReportPreview Hard-Coded Tool References:**
- Issue: `ReportPreview.tsx` line 281 checks for `tools['sop']` but tool is registered as `sop-creation`, `sop-taxonomy`, `sop-management`. Tool ID mismatch.
- Files: `src/tools/report/ReportPreview.tsx:281,305`
- Trigger: Any user exports a report with SOP sections enabled.
- Symptoms: Report shows "No SOPs created yet" even if SOPs exist.
- Fix: Map tool IDs correctly in report. Or standardize SOP tool IDs.

**BEI Trend Calculation Assumes 2+ Entries:**
- Issue: `ReportPreview.tsx` line 181-187 checks `entries.length > 1` but doesn't handle edge case of `entries[0].dimensions` being undefined.
- Files: `src/tools/report/ReportPreview.tsx:181-191`
- Trigger: BEI tool has 1 entry, user exports report.
- Symptoms: Runtime error if `entries[0].dimensions[0]` doesn't exist (undefined).
- Fix: Add safe navigation: `entries[0]?.dimensions?.[0]?.score` and default comparison to 0.

**Advisor Score Calculation in Report Uses Different Keys:**
- Issue: `ReportPreview.tsx:63` reads `data.answers` but synthesis rules in `rules.ts:124` read `responses`.
- Files: `src/tools/report/ReportPreview.tsx:55-67`, `src/engine/rules.ts:103-154`
- Impact: Reports show zero scores if Advisor tool uses `responses` key. Synthesis logic uses different key, causing inconsistency.
- Fix: Standardize to single key name across codebase. Add types to enforce.

## Security Considerations

**Unvalidated Workspace Import May Corrupt State:**
- Risk: `commitWorkspace()` in `src/store/workspaceStore.ts:149-180` merges external data directly into store even if validation warnings exist.
- Files: `src/store/workspaceStore.ts:149-180`, `src/validation/validator.ts`
- Current mitigation: Safe Mode sets `isSafeMode: true` and shows `SafeModeBanner.tsx`. User can review before commit.
- Recommendations:
  1. Require explicit user acknowledgment of validation errors (not just warnings) before commit.
  2. Add rollback mechanism (store pre-load checkpoint).
  3. Log all imports with timestamp/source for audit trail.

**API Key Leaking in Network Logs:**
- Risk: `consultAi()` includes API key in fetch URL (`src/engine/cloud.ts:43`), visible in browser DevTools Network tab and server logs if proxied.
- Files: `src/engine/cloud.ts:43`
- Current mitigation: None.
- Recommendations:
  1. Move API key to POST body instead of query param.
  2. Add Content-Security-Policy headers to prevent exfiltration.
  3. Rotate API key periodically.

**Synthesis Rules Assume Trusted Data:**
- Risk: Rules like `executionGapRule` read scores without bounds checking (e.g., `dna.current_Execution ?? 10` defaults to 10 if missing).
- Files: `src/engine/rules.ts:9-45`
- Current mitigation: Validation profiles should catch invalid scores, but no hard constraint.
- Recommendations:
  1. Enforce min/max bounds in validation (e.g., score must be 0-10).
  2. In rules, clamp values: `Math.max(0, Math.min(10, score))`.
  3. Add unit tests for rule behavior with edge-case inputs.

## Performance Bottlenecks

**PDF Generation Blocks on Large Workspaces:**
- Problem: `generatePdf()` in `src/tools/report/PdfService.ts:5-42` uses `html2canvas` to render entire report as image, then converts to PDF. At scale (many tools + many insights), canvas rendering is CPU-intensive.
- Files: `src/tools/report/PdfService.ts`
- Cause: No chunking. Single `html2canvas()` call on entire DOM.
- Improvement path:
  1. Use streaming PDF library (e.g., `pdfkit`) to avoid full canvas render.
  2. Generate PDF in Web Worker to avoid blocking UI.
  3. Paginate report generation (one section at a time).

**Synthesis Runs All Rules Even If Data Missing:**
- Problem: `runSynthesis()` in `src/engine/synthesis.ts:23-46` iterates through all 5 rules even if only 2 tools are populated. Rules return `null` and waste CPU.
- Files: `src/engine/synthesis.ts:23-46`
- Cause: No early exit or rule dependency graph.
- Improvement path: Track which tools are populated and skip rules that require missing tools. Cache rule dependencies at registration time.

**Large ReportPreview Component (349 lines):**
- Problem: `ReportPreview.tsx` is monolithic JSX. Every render of any tool section re-renders entire report structure.
- Files: `src/tools/report/ReportPreview.tsx:50-349`
- Cause: Conditional rendering of 10 sections all in one component. No memoization.
- Improvement path: Split into sub-components (`<AdvisorSection>`, `<SwotSection>`, etc.) with `React.memo()`. Use virtual scrolling for long reports.

## Fragile Areas

**StrategicHealthWidget (284 lines) - Multiple Responsibilities:**
- Files: `src/components/dashboard/StrategicHealthWidget.tsx`
- Why fragile: Handles state expansion, API key input, AI consultation, cloud insight merging, and localStorage sync. No clear separation of concerns.
- Safe modification: Before adding features, extract:
  1. `useCloudInsights` hook (manage cloud API calls + state merging)
  2. `ApiKeyManager` component (key input + localStorage)
  3. `InsightRenderer` component (display insights by severity/type)
- Test coverage: No tests for API failure recovery, localStorage edge cases (quota exceeded), or cloud insight merging logic.

**Synthesis Rules Logic (230 lines) - Hard-Coded Thresholds:**
- Files: `src/engine/rules.ts`
- Why fragile: Every rule has magic numbers (`score < 6`, `maxPillars = 3`, `taskCount > 12`). No data-driven configuration. If business changes thresholds, code must change.
- Safe modification: Extract thresholds to a config object:
  ```typescript
  const RULE_CONFIG = {
    E1: { executionScoreLow: 6, executionScoreSevere: 4 },
    E3: { maturityLowThreshold: 0.5, maturityHighThreshold: 0.8 }
  };
  ```
- Test coverage: No unit tests for threshold logic. Rules are only tested end-to-end via `e2e_test_audit_fixes.ts`.

**Store Hydration Edge Case:**
- Files: `src/store/workspaceStore.ts:256-269`
- Why fragile: `onRehydrateStorage` callback uses `queueMicrotask()` to defer synthesis recompute. If store rehydration is delayed or interrupted, insights may not regenerate.
- Safe modification: Test store rehydration on slow networks (add artificial delay in dev tools). Consider moving synthesis recompute into a React effect in `App.tsx` instead of store callback.
- Test coverage: No integration tests for store hydration + synthesis together.

**Safe Mode Workflow - Manual Commit Step:**
- Files: `src/store/workspaceStore.ts:136-192`, `src/components/layout/SafeModeBanner.tsx`
- Why fragile: User must call `commitWorkspace()` explicitly. If forgotten, data stays in `previewData` but `isSafeMode: true`. No timeout to auto-cancel safe mode.
- Safe modification: Add 5-minute timeout before auto-canceling safe mode. Or auto-commit on successful validation if user clicks a "Quick Import" button.
- Test coverage: SafeModeBanner not tested. Manual test only.

## Scaling Limits

**Local Storage Capacity (5-10 MB):**
- Current capacity: Single workspace persisted to localStorage. No compression.
- Limit: Workspace with 100+ tools + 1000+ insights will exceed 5MB quota on some browsers.
- Scaling path:
  1. Compress workspace JSON before storing (gzip).
  2. Archive old exports to IndexedDB (larger quota, 50+MB).
  3. Add cloud sync (Firebase Realtime DB / Firestore).

**Insight Array Unbounded:**
- Current capacity: No limit on insight count. Cloud insights appended without dedup.
- Limit: At 1000+ insights, UI rendering slows (ReportPreview renders all). Zustand selector doesn't memoize array.
- Scaling path:
  1. Paginate insights in UI (show top 20, load more on scroll).
  2. Add insight deduplication (merge duplicates by ID prefix: `cloud_` vs rule ID).
  3. Archive old insights (older than 7 days).

**Rule Execution Time (Linear with Rule Count):**
- Current: 5 rules × O(1) per rule = ~5ms per synthesis.
- Limit: Adding 20+ rules will approach 100+ms per keystroke (noticeable lag).
- Scaling path:
  1. Cache rule results by tool (only re-run E1 if Leadership DNA changed).
  2. Use Web Worker for synthesis (offload to background thread).
  3. Memoize rule inputs: `useMemo(() => runSynthesis(workspace), [workspace])` in React.

## Dependencies at Risk

**html2canvas (PDF Generation):**
- Risk: Unmaintained. Last update 2022. Uses deprecated browser APIs. May break in future Chrome/Firefox versions.
- Impact: PDF export fails silently. Users cannot save reports.
- Migration plan: Migrate to `pdfkit` (Node/browser compatible) or `jsPDF` + direct HTML-to-PDF (requires rewrite of report layout). Or use server-side rendering (headless browser on backend).

**Zustand Persist Middleware (Auto-Sync):**
- Risk: Zustand 5.0 persist is lightweight but experimental. No built-in conflict resolution for multi-tab edits.
- Impact: If user opens two browser tabs, edits both, last write wins (data loss).
- Migration plan: Add client-side conflict detection (compare `lastModified` timestamps). Warn user before overwriting. Or add server-side sync (Firebase).

**Gemini 1.5 Flash API (Optional):**
- Risk: Google may change API, rate limits, or pricing. Key requires internet (works offline otherwise).
- Impact: AI Consultation feature breaks. Non-critical but users expect it.
- Migration plan: Abstract API behind interface. Swap to OpenAI, Anthropic, or local LLM. Fallback to rule-based insights if API unavailable.

## Missing Critical Features

**No Test Framework:**
- Problem: No Jest, Vitest, or similar. `src/scripts/` contains manual E2E tests (`e2e_test_audit_fixes.ts`).
- Blocks: Cannot add features safely. No regression detection. CI/CD has no test gate.
- Impact: High: Bugs will reach production undetected.
- Priority: HIGH - Add vitest + unit tests for rules, synthesis, validation before adding more rules.

**No Undo/Redo System:**
- Problem: User edits a tool, saves. Cannot revert to previous state except by re-importing.
- Blocks: Users cannot experiment (too much friction).
- Impact: Medium - Reduces exploration. Users stick to safe, minimal edits.
- Priority: MEDIUM - Implement undo stack in Zustand (store history of tool data snapshots).

**No Collaboration/Sharing:**
- Problem: Workspace is local to one user's browser. No export/import of shareable links or team editing.
- Blocks: Cannot share work with stakeholders for feedback.
- Impact: Medium - Limits use in team settings.
- Priority: MEDIUM - Add Firebase Auth + Firestore sync for multi-user editing.

**No Data Backup/Version Control:**
- Problem: If localStorage is cleared, all data is lost. No git-like history.
- Blocks: Users are nervous about making changes (no safety net).
- Impact: Medium - Reduces adoption.
- Priority: MEDIUM - Add automatic daily backups to IndexedDB. Export on save.

## Test Coverage Gaps

**Synthesis Rules - No Unit Tests:**
- What's not tested: Each rule's logic in isolation. Edge cases: missing data, malformed arrays, boundary values.
- Files: `src/engine/rules.ts:9-230` (all 5 rules)
- Risk: A rule change breaks silently. Test suite `e2e_test_audit_fixes.ts` only checks happy path.
- Priority: HIGH - Create `src/engine/__tests__/rules.test.ts` with:
  - Test each rule with complete data, missing data, edge values
  - Example: executionGapRule with score=0, 5, 10; pillars=0,1,5,10
  - Test burnout rule with 0% and 100% maturity

**Validation Profiles - No Tests:**
- What's not tested: Each profile's validation logic. Whether profiles correctly reject invalid data.
- Files: `src/validation/profiles_p1.ts`, `profiles_p2.ts`, `profiles_p3.ts`
- Risk: Validator allows bad data through. Safe Mode gives false confidence.
- Priority: HIGH - Create integration test that runs all profiles against known-bad + known-good data sets.

**Store Rehydration - No Tests:**
- What's not tested: onRehydrateStorage callback when localStorage is corrupted, empty, or has schema mismatch.
- Files: `src/store/workspaceStore.ts:256-269`
- Risk: App crashes on hydration error. Error boundary catches it but user sees blank page.
- Priority: MEDIUM - Add test that simulates corrupted localStorage and verifies graceful fallback.

**PDF Generation - No Tests:**
- What's not tested: generatePdf works with large/small reports, handles rendering errors, file downloads correctly.
- Files: `src/tools/report/PdfService.ts`
- Risk: PDF exports fail for some users silently. No error tracking.
- Priority: MEDIUM - Add e2e test using Playwright that exports a report and validates PDF size/content.

**Cloud Consultation Error Cases - No Tests:**
- What's not tested: consultAi when API key invalid, network error, malformed response, rate limit (429), timeout.
- Files: `src/engine/cloud.ts:16-74`
- Risk: Vague error messages. User clicks "Consult AI" and nothing happens.
- Priority: MEDIUM - Mock fetch failures in test. Verify UI shows helpful error + retry option.

---

*Concerns audit: 2026-02-13*
