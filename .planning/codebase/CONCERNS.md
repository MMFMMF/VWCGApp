# Codebase Concerns

**Analysis Date:** 2025-02-15

## Tech Debt

**Dead Code: Old Synthesis Rules (v1)**
- Issue: `src/engine/rules.ts` contains 5 deprecated rules (E1-E5) that are no longer imported or executed
- Files: `src/engine/rules.ts` (still exists but unreferenced), `src/engine/synthesis.ts` only imports `rulesV2`
- Impact: Code bloat, maintenance confusion, unused complexity
- Fix approach: Remove `src/engine/rules.ts` entirely. Verify no other files import from it. These rules were replaced by the v2 architecture in `src/engine/rules-v2.ts`

**Type Safety Holes: Excessive `any` Types**
- Issue: 21 files use `any` type annotations, circumventing TypeScript strict mode
- Files: `src/store/workspaceStore.ts`, `src/engine/synthesis.ts`, `src/engine/cloud.ts`, `src/validation/validator.ts`, `src/components/layout/AppShell.tsx`, `src/tools/report/ReportCenter.tsx`, and 15 others
- Impact: Loss of compile-time type checking, increased runtime errors, harder refactoring
- Fix approach: Gradually replace `any` with proper types. Start with high-impact files: `src/store/workspaceStore.ts` (workspace simulation), `src/engine/synthesis.ts` (rule execution), and `src/engine/cloud.ts` (API integration). Create union types for workspace structure

**Missing Null Checks in Data Pipelines**
- Issue: Synthesis rules access nested workspace properties without defensive checks
- Files: `src/engine/rules-v2.ts` (lines 19-33, 67-89, 459-491), `src/engine/derived-metrics.ts` (lines 62-80)
- Impact: Runtime errors if tools are missing or incompletely filled
- Fix approach: Add guards at rule entry: `if (!vision?.pillars) return null;` instead of relying on falsy checks. Create a validation layer that runs before synthesis

## Security Considerations

**API Keys Stored in localStorage**
- Risk: Gemini and OpenAI API keys persisted in browser localStorage (`VWCG_GEMINI_KEY`, derived from `import.meta.env.VITE_OPENAI_API_KEY`)
- Files: `src/components/dashboard/StrategicHealthWidget.tsx` (lines 23, 42, 65), `src/tools/report/ReportCenter.tsx`, `src/engine/llm/openai-service.ts`
- Current mitigation: Keys are user-provided at runtime; VITE_OPENAI_API_KEY is never committed (env var only)
- Recommendations:
  1. Move API key handling to a backend service (serverless function) that acts as a proxy; never expose keys in client
  2. For interim: Use sessionStorage instead of localStorage (cleared on browser close)
  3. Add a "Forget Key" button in UI that clears the stored key
  4. Warn users that refreshing the browser exposes keys in Network tab of DevTools

**JSON Parsing Without Validation**
- Risk: `src/engine/cloud.ts` (line 66) and `src/engine/llm/openai-service.ts` (lines 118, 202) call `JSON.parse()` on API responses without schema validation
- Files: `src/engine/cloud.ts:66`, `src/engine/llm/openai-service.ts:118,202`, `src/utils/fileSystem.ts:21`
- Impact: Malicious or malformed API responses could inject arbitrary objects into the store; file upload could fail silently
- Fix approach: Add schema validation using a library like `zod` or `io-ts` before parsing. Create `parseGeminiResponse()` and `parseOpenAiResponse()` helpers with explicit schema checks

**Workspace File Format Not Validated Strictly**
- Risk: `src/utils/fileSystem.ts:21-25` only checks for `version` and `tools` fields; any malformed file with those keys passes
- Impact: Corrupted .vwcg files could damage workspace state
- Fix approach: Use the existing `validateWorkspace()` function in `src/validation/validator.ts` when loading files. Return validation errors to user instead of silently accepting bad data

## Performance Bottlenecks

**Synthesis Engine Runs Synchronously on Every Tool Update**
- Problem: `src/store/workspaceStore.ts:96` calls `runSynthesis()` in the reducer on every `updateToolData()` call
- Files: `src/store/workspaceStore.ts` (lines 86-111)
- Impact: If a user rapidly edits fields (e.g., typing in a textarea), synthesis runs 8+ times per second, blocking React renders. Visible lag with large workspaces
- Scaling limit: Synthesis is currently O(n) where n = number of rules (9) + number of tools (11); acceptable at current scale but degrades with more rules or larger datasets
- Improvement path:
  1. Add debouncing with 500ms delay before running synthesis (use lodash.debounce or custom hook)
  2. Or use `queueMicrotask` to defer synthesis to next event loop tick
  3. Cache synthesis results and only recompute for affected tools (currently recomputes all 9 rules)

**PDF Generation Memory Spike**
- Problem: `src/report/pdf/PdfGenerator.ts` uses 3x scale (CAPTURE_SCALE = 3) for 300 DPI, which loads full report into canvas memory at 288 DPI before converting to PNG
- Files: `src/report/pdf/PdfGenerator.ts` (lines 68, 199-207)
- Impact: Large reports (12+ pages, many charts) can spike RAM usage to 500MB+; may crash on low-memory devices
- Improvement path:
  1. Add page-by-page rendering: Render each page to canvas, convert to image, then discard canvas
  2. Reduce CAPTURE_SCALE to 2 for non-flagship reports (acceptable quality at 192 DPI for screen viewing)
  3. Add a memory warning for unified strategic briefing if report exceeds 8 pages

**Large Component Files (1000+ LOC)**
- Problem: `src/report/unified/UnifiedStrategicBriefing.tsx` (1020 lines), `src/report/individual/RoadmapReport.tsx` (768 lines), others
- Files: See `src/report/` directory
- Impact: Hard to test, debug, and refactor; single component failure breaks entire section
- Improvement path: Split each report component into smaller sections (e.g., USB-01 through USB-12 as separate components), each 50-100 LOC, composed together

## Fragile Areas

**Synthesis Rule Error Handling Too Forgiving**
- Files: `src/engine/synthesis.ts` (lines 18-27)
- Why fragile: Rules that throw errors log a warning and continue; a rule that returns `undefined` instead of `null` would be silently ignored, hiding bugs
- Safe modification: Add explicit error tracking: `const ruleErrors = []` and return both `insights` and `ruleErrors` from `runSynthesis()`. Log all errors at end instead of per-rule
- Test coverage: No unit tests for synthesis rule execution; add Jest tests for each rule with edge case workspaces

**Workspace State Rehydration on Page Load**
- Files: `src/store/workspaceStore.ts` (persist middleware), `src/main.tsx` (initializeRegistry sequence)
- Why fragile: Three async initializers run before first render (`initializeRegistry`, `initializeValidation`, `registerCharts`); if any fails silently, app loads with broken state
- Safe modification: Add explicit error handling in `main.tsx`; if initialization fails, show error screen instead of blank app
- Test coverage: No tests for cold start or rehydration from corrupted localStorage

**Rule Dependencies Not Documented**
- Files: `src/engine/rules-v2.ts` (all 9 rules)
- Why fragile: Rules assume certain tools exist (e.g., visionExecutionMismatch needs both vision-canvas and leadership-dna); no validation at rule level
- Safe modification: Add `requiredTools: string[]` field to SynthesisRule interface; check all required tools exist before executing rule
- Example: visionExecutionMismatch currently returns `null` if vision missing, but silently proceeds if dna missing

**Report Narrative Generation Without Fallback**
- Files: `src/report/unified/LLMStrategicBriefing.tsx` (line 50), `src/report/narrative/templates.ts`
- Why fragile: If Gemini/OpenAI API fails, no fallback narrative is shown; component catches error (line 50) but renders nothing
- Safe modification: Use `src/report/narrative/templates.ts` as fallback; generate basic narrative from workspace data if API unavailable
- Example: If `generateBriefingNarrative()` fails, use template-driven approach instead of blank section

## Validation & Testing Gaps

**Validation Profiles Not Exhaustive**
- What's not tested: Business-Context tool has no validation profile
- Files: `src/validation/index.ts` registers profiles for 10 tools, but business-context validation missing
- Risk: Corrupted business-context data passes validation and breaks rules (e.g., founderHours parsing in rules-v2.ts:80)
- Priority: High (rules depend on this data)

**No Unit Tests for Synthesis Rules**
- What's not tested: Each of the 9 rules in `src/engine/rules-v2.ts` lacks individual test coverage
- Files: `tests/` directory has only E2E tests (journeys, smoke tests); no Jest/Vitest tests for `src/engine/`
- Risk: Rule logic regressions go undetected; new rules might have edge cases
- Priority: High (rules are core business logic)

**No Tests for PDF Generation Edge Cases**
- What's not tested: Multi-page reports, SVG rendering at scale, timeout scenarios
- Files: `src/report/pdf/PdfGenerator.ts` has no unit tests; only E2E test at `tests/journeys/pdf-generation.spec.ts`
- Risk: PDF generation silently fails for large reports; timeout errors not caught
- Priority: Medium (user-facing but doesn't break other features)

**Validation Profiles Incomplete for Advisor-Readiness**
- What's not tested: Advisor-readiness answer structure (o1-o5, s1-s5, etc.) not validated against expected answer types
- Files: `src/validation/profiles_p3.ts` (if it exists)
- Risk: Bad data in advisor tool breaks derived metrics calculation
- Priority: Medium

## Missing Critical Features

**No Offline Support**
- Problem: All synthesis and PDF generation depends on network (Gemini, OpenAI APIs)
- Impact: If Gemini/OpenAI down, users can't run insights or generate reports
- Blocks: Reliable report generation in unstable network conditions

**No Data Backup/Recovery**
- Problem: If localStorage is cleared (cache flush, cookie deletion), all workspace data is lost
- Impact: Users lose hours of work with no recovery option
- Blocks: Enterprise adoption; users need audit trail

**No Role-Based Access Control**
- Problem: All users see all tools; no admin/viewer/editor roles
- Impact: Can't share workspaces safely with read-only stakeholders
- Blocks: Team collaboration scenarios

## Dependencies at Risk

**html2canvas + jsPDF Upgrade Risk**
- Risk: html2canvas (used in PDF generation) has known limitations with modern CSS (e.g., grid, flex positioning). Upgrading could break PDF layout
- Impact: PDF rendering could regress
- Migration plan: Consider replacing with native browser Print API (src/report/pdf/PrintPdfService.ts exists as alternative) for printing; add feature flag to test

**Zustand Store Scaling**
- Risk: Single store holds all 11 tools' data + insights + ephemeral state; no modular store structure
- Impact: Store becomes harder to test and refactor as app grows
- Migration plan: Split into feature stores (one per tool) using Zustand context; keep workspace store as orchestrator

## Known Issues & Quirks

**Logic Version Upgrade Path Unclear**
- Files: `src/store/workspaceStore.ts:13` (LOGIC_VERSION = 'v1.1.0'), logic version banner in `AppShell.tsx`
- Issue: When LOGIC_VERSION bumps, old workspaces show upgrade banner; clicking "recompute" calls `recomputeLogic()` which only updates timestamps, doesn't re-run synthesis with new rules
- Workaround: User must edit a tool to trigger synthesis

**Export Cooldown Could Fail Silently**
- Files: `src/store/workspaceStore.ts:214-216` (5-second cooldown)
- Issue: If user clicks Export twice within 5 seconds, second click throws error; UI doesn't show feedback
- Workaround: Button is disabled during export, but error message could be clearer

**AI Consultation Response Type Mismatch**
- Files: `src/engine/cloud.ts:66` (parses response as Insight[])
- Issue: Gemini response format not validated; if API returns different structure, JSON.parse fails silently (caught line 70)
- Impact: User sees "Cloud Synthesis Failed" with no details

---

*Concerns audit: 2025-02-15*
