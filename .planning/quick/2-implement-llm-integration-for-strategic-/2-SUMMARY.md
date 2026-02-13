---
phase: quick-2
plan: 01
subsystem: llm-narrative-generation
tags: [llm, openai, strategic-narrative, report-generation, chatgpt]
dependency_graph:
  requires:
    - existing report system (src/report/)
    - derived metrics (src/engine/derived-metrics.ts)
    - synthesis engine (src/engine/synthesis.ts)
    - workspace store (src/store/workspaceStore.ts)
  provides:
    - LLM-powered strategic narrative generation
    - Two-model pipeline (ChatGPT generator + ChatGPT Mini QA validator)
    - AI briefing mode in Report Center
  affects:
    - Report Center UI (three modes instead of two)
    - Report generation workflow (template vs AI)
tech_stack:
  added:
    - Native fetch API for OpenAI calls (no SDK)
    - ChatGPT 4o-latest for generation
    - GPT-4o-mini for QA validation
  patterns:
    - Two-model validation pipeline
    - Retry with feedback mechanism
    - Markdown rendering in React
    - Graceful degradation (works without API key)
key_files:
  created:
    - src/engine/llm/types.ts
    - src/engine/llm/prompts.ts
    - src/engine/llm/openai-service.ts
    - src/engine/llm/payload-assembler.ts
    - src/engine/llm/index.ts
    - src/report/unified/LLMStrategicBriefing.tsx
  modified:
    - src/report/unified/index.ts
    - src/tools/report/ReportCenter.tsx
decisions:
  - decision: "Use native fetch instead of openai SDK"
    rationale: "Client-side SPA context, avoid unnecessary bundle weight"
  - decision: "Two-model pipeline (ChatGPT + ChatGPT Mini)"
    rationale: "Mini provides cost-effective QA validation, catches errors reliably"
  - decision: "Retry with feedback appended to prompt"
    rationale: "Spec section 8.1 - improves quality on second attempt"
  - decision: "Render markdown inline (not at parse time)"
    rationale: "Narrative text contains **bold** and *italic* - simple inline parser handles it"
  - decision: "Three report modes in UI (not two)"
    rationale: "Existing template-based Strategic Briefing stays unchanged, AI is parallel option"
metrics:
  duration: "~30 minutes"
  tasks_completed: 2
  files_created: 7
  files_modified: 2
  lines_added: ~1670
  commits: 2
---

# Quick Task 2: LLM Integration for Strategic Narrative Generation

**One-liner:** ChatGPT-powered strategic briefing generation with two-model validation pipeline (generator + QA validator), integrated into Report Center as parallel option to template-based reports.

## What Was Built

### Task 1: LLM Engine Module (5 files)

**src/engine/llm/types.ts**
- `BriefingNarrative` interface (10 fields matching spec JSON schema)
- `QAValidationResult` interface (pass/fail + critical_failures + warnings)
- `GenerationResult` interface (narrative + qa + attempts + needs_human_review + usage)
- `AssessmentPayload` interface (client + 6 assessments + derived_metrics + optional _qa_feedback)

**src/engine/llm/prompts.ts**
- `GENERATOR_SYSTEM_PROMPT`: Complete ChatGPT generator prompt from spec Section 3 (voice guidelines, financial formulas, recommendation rules, sample output)
- `QA_VALIDATOR_SYSTEM_PROMPT`: Complete ChatGPT Mini QA prompt from spec Section 5 (validation checklist A-D, factual accuracy, financial estimates, narrative quality, structural completeness)

**src/engine/llm/openai-service.ts**
- `generateBriefingNarrative(payload, apiKey)`: Calls `api.openai.com/v1/chat/completions` with model `chatgpt-4o-latest`, temperature 0.7, max_tokens 8000, JSON mode. Appends QA feedback on retry.
- `validateBriefingNarrative(payload, narrative, apiKey)`: Calls same API with model `gpt-4o-mini`, temperature 0.0, max_tokens 2000. Returns QA validation result.
- `generateWithRetry(payload, apiKey, maxRetries=2)`: Implements full pipeline — generate → validate structure → QA validate → retry with feedback → return with needs_human_review flag.
- `isValidNarrativeStructure(narrative)`: Checks all required fields exist AND recommendations.length === 3 AND quick_wins.length === 3 AND three_words.length === 3.
- Error handling: Typed errors for 429 rate limit (with retry-after), 401 auth, 500+ server errors.
- AbortController with 120-second timeout.

**src/engine/llm/payload-assembler.ts**
- `assemblePayload(workspace)`: Maps all 6 tool data structures from workspace store to spec's payload format.
- Client block: Pulls from business-context tool (revenueRange → revenue_range, founderHours → founder_weekly_hours, etc.)
- Advisor readiness: Computes category averages (strategic_alignment, operational_maturity, financial_health, cultural_readiness), overall score, stage mapping.
- AI readiness: Averages 6 dimensions, maps to stage (Foundational/Developing/Operational/Advanced).
- Leadership DNA: Maps current/target/gap for 6 dimensions (vision, execution, empowerment, decisiveness, adaptability, integrity).
- SWOT: Extracts `.text` field from each array item into string arrays.
- Vision Canvas: Maps pillars to {name, kpi} objects, values to string array.
- Roadmap: Maps tasks to {name, owner, phase, status} objects.
- Derived metrics: Calls `computeDerivedMetrics()` and `runSynthesis()`, maps contradictions from conflict-type insights.
- Graceful handling: Tools with no data get `status: 'incomplete'` flag.

**src/engine/llm/index.ts**
- Barrel export: types, generateWithRetry, assemblePayload, prompts.

### Task 2: LLM Briefing Component + Report Center Integration (2 files)

**src/report/unified/LLMStrategicBriefing.tsx**
- React component rendering AI-generated narrative using existing report design system.
- Props: `{ narrative: BriefingNarrative }`.
- 10 pages: Cover, Executive Snapshot (headline + three words + vital signs), Strengths, Exposure, Contradictions (conditional), Cost (financial impact), Benchmarking (DotPlot charts + LLM interpretations), Recommendations (3 numbered cards), Quick Wins (3 phased timeline cards), How to Use (static).
- `renderMarkdown(text)` helper: Converts **bold** and *italic* markdown syntax in narrative strings to React elements (`<strong>`, `<em>`). Handles `\n\n` paragraph breaks.
- Uses workspace data: client name from metadata.name, date from metadata.lastModified, derived metrics for vital signs, tools data for DotPlot benchmarking charts.
- Root div: `id="llm-strategic-briefing"` for PDF capture.

**src/tools/report/ReportCenter.tsx**
- Updated `ReportMode` type: `'strategic-briefing' | 'ai-briefing' | 'individual'`.
- New state: `llmNarrative`, `llmError`, `llmGenerating`, `llmQaResult`, `llmNeedsReview`.
- API key check: `import.meta.env.VITE_OPENAI_API_KEY`.
- `handleGenerateAIBriefing()`: Calls `assemblePayload()` → `generateWithRetry()` → sets state.
- UI: Three report mode buttons (Strategic Briefing with BookOpen icon, AI-Powered Briefing with Sparkles icon, Individual Report with FileText icon).
- AI mode button: Disabled if no API key, shows "API key required" message.
- Generate button: "Generate AI Briefing" with Sparkles icon, appears when AI mode selected and no narrative yet.
- Preview panel states:
  - Loading: Loader2 spinner + "Generating AI briefing... This may take 30-60 seconds"
  - Error: AlertTriangle + error message + Retry button
  - Success: Amber warning banner if `needs_human_review`, QA warnings section if any, LLMStrategicBriefing component in preview container
  - Empty: Sparkles icon + "Click Generate AI Briefing to create..."
- PDF download: Target element `llm-strategic-briefing`, reportType `'strategic-briefing'`.
- Existing template-based Strategic Briefing: Unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

**Files exist:**
```
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/engine/llm/types.ts" ] && echo "FOUND: types.ts" || echo "MISSING: types.ts"
FOUND: types.ts
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/engine/llm/prompts.ts" ] && echo "FOUND: prompts.ts" || echo "MISSING: prompts.ts"
FOUND: prompts.ts
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/engine/llm/openai-service.ts" ] && echo "FOUND: openai-service.ts" || echo "MISSING: openai-service.ts"
FOUND: openai-service.ts
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/engine/llm/payload-assembler.ts" ] && echo "FOUND: payload-assembler.ts" || echo "MISSING: payload-assembler.ts"
FOUND: payload-assembler.ts
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/engine/llm/index.ts" ] && echo "FOUND: index.ts" || echo "MISSING: index.ts"
FOUND: index.ts
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/report/unified/LLMStrategicBriefing.tsx" ] && echo "FOUND: LLMStrategicBriefing.tsx" || echo "MISSING: LLMStrategicBriefing.tsx"
FOUND: LLMStrategicBriefing.tsx
```

**Commits exist:**
```
git log --oneline --all | grep -q "ae111bc" && echo "FOUND: ae111bc" || echo "MISSING: ae111bc"
FOUND: ae111bc (Task 1 commit)
git log --oneline --all | grep -q "cf044e0" && echo "FOUND: cf044e0" || echo "MISSING: cf044e0"
FOUND: cf044e0 (Task 2 commit)
```

**Build passes:**
```
npm run build
✓ built in 4.61s
```

**Verification complete:** All files created, all commits exist, build passes with no errors.

## What's Next

The checkpoint (Task 3) requires human verification:

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173/tools/report
3. Verify three report mode buttons exist
4. Click "Strategic Briefing" — verify existing template report still works
5. Click "AI-Powered Briefing":
   - If no API key: button disabled with "API key required" message ✓
   - If API key set: click "Generate AI Briefing", watch loading state, verify generated report renders
   - Verify PDF download works for AI-generated briefing
6. Check browser console for any errors
7. Verify generated narrative has all sections (headline, three words, strengths, exposure, contradictions, financial impact, recommendations × 3, quick wins × 3, benchmarking interpretations)

**To test with API key:**
1. Create `.env.local` in project root
2. Add: `VITE_OPENAI_API_KEY=sk-proj-...`
3. Restart dev server
4. AI-Powered Briefing button should now be enabled

## Commits

- `ae111bc`: feat(quick-2): implement LLM engine module for strategic narrative generation
- `cf044e0`: feat(quick-2): add LLM briefing component and Report Center integration

## Duration

~30 minutes (plan execution + implementation + testing + commits)
