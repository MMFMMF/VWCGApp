---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/engine/llm/types.ts
  - src/engine/llm/prompts.ts
  - src/engine/llm/openai-service.ts
  - src/engine/llm/payload-assembler.ts
  - src/engine/llm/index.ts
  - src/report/unified/LLMStrategicBriefing.tsx
  - src/tools/report/ReportCenter.tsx
autonomous: false
must_haves:
  truths:
    - "User can trigger LLM-powered briefing generation from the Report Center"
    - "App assembles all 6 assessment tool data + derived metrics into the spec payload format before calling OpenAI"
    - "ChatGPT generates structured JSON narrative sections matching the spec schema"
    - "ChatGPT Mini validates the generated narrative and returns pass/fail with specific flags"
    - "If QA fails, system retries once with feedback appended, then flags for human review"
    - "Generated LLM narratives render in a new report component using existing report design system"
    - "App works without OpenAI key (LLM button hidden or disabled when no key set)"
  artifacts:
    - path: "src/engine/llm/types.ts"
      provides: "TypeScript interfaces for narrative JSON response, QA response, payload schema, generation result"
    - path: "src/engine/llm/prompts.ts"
      provides: "System prompts for ChatGPT generator and ChatGPT Mini QA validator as string constants"
    - path: "src/engine/llm/openai-service.ts"
      provides: "OpenAI API calls: generateBriefingNarrative, validateBriefingNarrative, generateWithRetry"
    - path: "src/engine/llm/payload-assembler.ts"
      provides: "assemblePayload function that gathers tool data from workspace and computes derived metrics into spec format"
    - path: "src/engine/llm/index.ts"
      provides: "Public API barrel export for LLM module"
    - path: "src/report/unified/LLMStrategicBriefing.tsx"
      provides: "React component rendering LLM-generated narratives using existing ReportPage/ReportBody components"
    - path: "src/tools/report/ReportCenter.tsx"
      provides: "Updated Report Center with LLM generation trigger button and mode switching"
  key_links:
    - from: "src/engine/llm/payload-assembler.ts"
      to: "src/engine/derived-metrics.ts"
      via: "import computeDerivedMetrics"
      pattern: "computeDerivedMetrics"
    - from: "src/engine/llm/openai-service.ts"
      to: "OpenAI API"
      via: "fetch to api.openai.com"
      pattern: "api\\.openai\\.com"
    - from: "src/report/unified/LLMStrategicBriefing.tsx"
      to: "src/engine/llm/types.ts"
      via: "BriefingNarrative type"
      pattern: "BriefingNarrative"
    - from: "src/tools/report/ReportCenter.tsx"
      to: "src/engine/llm/index.ts"
      via: "import assemblePayload, generateWithRetry"
      pattern: "generateWithRetry|assemblePayload"
---

<objective>
Implement the two-model LLM pipeline (ChatGPT generator + ChatGPT Mini QA validator) for generating strategic briefing narratives from assessment data, per the VWCG Prompt Engineering Spec.

Purpose: Replace template-driven narratives with AI-generated consultant-voice narratives that produce personalized, data-driven strategic briefings. The LLM integration adds a "Generate AI Briefing" option alongside the existing template-based report in the Report Center.

Output: Complete LLM service module under `src/engine/llm/`, an LLM-powered briefing component, and Report Center UI integration.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/Kamyar/Documents/VWCGApp/CLAUDE.md
@C:/Users/Kamyar/Downloads/VWCG-Prompt-Engineering-Spec.md
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/derived-metrics.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/types.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/rules-v2.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/synthesis.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/cloud.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/engine/index.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/tools/business-context/types.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/store/workspaceStore.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/tools/report/ReportCenter.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/unified/UnifiedStrategicBriefing.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/components/index.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/report/design.ts
@C:/Users/Kamyar/Documents/VWCGApp/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: LLM Engine Module — Types, Prompts, OpenAI Service, Payload Assembler</name>
  <files>
    src/engine/llm/types.ts
    src/engine/llm/prompts.ts
    src/engine/llm/openai-service.ts
    src/engine/llm/payload-assembler.ts
    src/engine/llm/index.ts
  </files>
  <action>
Create `src/engine/llm/` directory with 5 files:

**1. `types.ts`** — TypeScript interfaces matching the spec's JSON schemas:

```typescript
// BriefingNarrative — the ChatGPT generator output (Section 3 of spec)
export interface BriefingNarrative {
  headline_finding: string;
  three_words: [string, string, string];
  strengths_narrative: string;
  exposure_narrative: string;
  contradictions: Array<{ title: string; narrative: string }>;
  financial_impact: Array<{ amount_range: string; label: string; explanation: string }>;
  financial_impact_total: string;
  recommendations: Array<{
    title: string;
    why_first: string;
    what_it_looks_like: string;
    estimated_impact: string;
    first_step: string;
  }>;
  quick_wins: Array<{ phase: string; title: string; description: string }>;
  benchmarking_interpretations: {
    advisor_readiness: string;
    ai_readiness: string;
    leadership_dna: string;
    swot_risk_profile: string;
  };
}

// QAValidationResult — the ChatGPT Mini QA output (Section 5 of spec)
export interface QAValidationResult {
  overall_result: 'PASS' | 'FAIL';
  critical_failures: Array<{ check: string; issue: string }>;
  warnings: Array<{ check: string; issue: string }>;
  summary: string;
}

// GenerationResult — combined output from the pipeline
export interface GenerationResult {
  narrative: BriefingNarrative;
  qa: QAValidationResult;
  attempts: number;
  needs_human_review: boolean;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  model: string;
}

// AssessmentPayload — the complete input payload sent to the LLM (Section 2 of spec)
export interface AssessmentPayload {
  client: {
    name: string;
    company_name: string;
    industry: string;
    revenue_range: string;
    employee_count: string;
    founder_weekly_hours: string;
    years_in_business: string;
    primary_growth_goal: string;
  };
  advisor_readiness: Record<string, any>;
  ai_readiness: Record<string, any>;
  leadership_dna: Record<string, any>;
  swot: Record<string, any>;
  vision_canvas: Record<string, any>;
  roadmap_90day: Record<string, any>;
  derived_metrics: Record<string, any>;
  _qa_feedback?: any[];  // Appended on retry
}
```

**2. `prompts.ts`** — Two string constants:
- `GENERATOR_SYSTEM_PROMPT`: Copy the COMPLETE system prompt from Section 3 of the spec verbatim (the entire content between the code fences starting with "You are a senior business strategy consultant at World Consulting Group (VWCG)..."). This is the ChatGPT generator prompt.
- `QA_VALIDATOR_SYSTEM_PROMPT`: Copy the COMPLETE system prompt from Section 5 of the spec verbatim (the entire content between the code fences starting with "You are a quality assurance reviewer..."). This is the ChatGPT Mini QA prompt.

Both should be exported as `const` strings. Use template literals for multi-line.

**3. `openai-service.ts`** — Three main functions using the browser-native `fetch` API (NOT the `openai` npm package, since this is a client-side SPA with no Node.js backend — the openai SDK would add unnecessary weight and complexity):

- `generateBriefingNarrative(payload: AssessmentPayload, apiKey: string)`: Calls OpenAI Chat Completions API at `https://api.openai.com/v1/chat/completions` with model `chatgpt-4o-latest`, temperature 0.7, max_tokens 8000, response_format `{ type: "json_object" }`. System message = GENERATOR_SYSTEM_PROMPT. User message = "Generate a complete strategic briefing narrative for the following client assessment data:\n\n" + JSON.stringify(payload, null, 2). If payload._qa_feedback exists, append the retry instruction from Section 8.2 of the spec. Parse the response JSON. Return `{ narrative: BriefingNarrative, usage, model }`.

- `validateBriefingNarrative(payload: AssessmentPayload, narrative: BriefingNarrative, apiKey: string)`: Calls the same API with model `gpt-4o-mini`, temperature 0.0, max_tokens 2000, response_format JSON mode. System message = QA_VALIDATOR_SYSTEM_PROMPT. User message = "## ORIGINAL ASSESSMENT DATA\n\n" + JSON.stringify(payload) + "\n\n## GENERATED NARRATIVE\n\n" + JSON.stringify(narrative). Return `{ validation: QAValidationResult, usage, model }`.

- `generateWithRetry(payload: AssessmentPayload, apiKey: string, maxRetries = 2)`: Implements the retry logic from Section 8.1 of the spec. Loop up to maxRetries: call generateBriefingNarrative, validate structure with `isValidNarrativeStructure`, call validateBriefingNarrative. If QA passes, return result. If QA fails and retries remain, clone payload and set `_qa_feedback` to the critical_failures array, then retry. If all retries exhausted, return with `needs_human_review: true`. On network/API errors, exponential backoff (2000ms * attempt). Wrap the entire function in a 120-second AbortController timeout.

- Helper `isValidNarrativeStructure(narrative: any): boolean`: Checks all required fields exist per Section 8.3 of the spec (headline_finding, three_words, strengths_narrative, exposure_narrative, contradictions, financial_impact, financial_impact_total, recommendations, quick_wins, benchmarking_interpretations) AND recommendations.length === 3 AND quick_wins.length === 3 AND three_words.length === 3.

Error handling: Throw typed errors for API errors (rate limit 429, auth 401, server 500+). On 429, include retry-after header value if present.

IMPORTANT: Use `import type` for type-only imports per verbatimModuleSyntax. Do NOT install the `openai` npm package. Use native `fetch`.

**4. `payload-assembler.ts`** — Assembles the LLM payload from workspace data:

- `assemblePayload(workspace: { tools: Record<string, any>; metadata: any }): AssessmentPayload`: Reads from workspace.tools for each tool ID and maps to the spec's payload schema. Specifically:

  - `client` block: Pull from `workspace.tools['business-context']` (revenueRange, industry, employeeCount, founderHours, yearsInBusiness, growthGoal) and `workspace.metadata.name` for company_name. Map the app's field names to the spec's field names (e.g., `founderHours` -> `founder_weekly_hours`).

  - `advisor_readiness`: Pull from `workspace.tools['advisor-readiness']`. The app stores answers as `{ answers: { q1_strategic_alignment: number, ... } }`. Compute category averages for strategic_alignment, operational_maturity, financial_health, cultural_readiness, then overall_score. Map the advisor readiness stage based on overall score.

  - `ai_readiness`: Pull from `workspace.tools['ai-readiness']`. The app stores `{ Strategy: number, Data: number, Infrastructure: number, Talent: number, Governance: number, Culture: number }`. Compute average and determine stage (Foundational <40, Developing 40-60, Operational 60-80, Advanced >80).

  - `leadership_dna`: Pull from `workspace.tools['leadership-dna']`. The app stores `current_Vision`, `target_Vision`, `current_Execution`, `target_Execution`, etc. Map to spec format: `{ vision: { current, target, gap }, execution: { current, target, gap }, ... }`.

  - `swot`: Pull from `workspace.tools['swot']`. The app stores `{ strengths: [{id, text, impact, ...}], weaknesses: [...], ... }`. Map to spec format: extract just the `.text` field from each item into string arrays.

  - `vision_canvas`: Pull from `workspace.tools['vision-canvas']`. The app stores `{ northStar: string, pillars: [{id, text}], values: [{id, text}] }`. Map to spec format: `{ north_star, pillars: [{name, kpi}], core_values: [string] }`.

  - `roadmap_90day`: Pull from `workspace.tools['roadmap']`. The app stores `{ tasks: [{id, title, owner, ...}] }`. Map to spec format.

  - `derived_metrics`: Call `computeDerivedMetrics(workspace)` from `@/engine/derived-metrics` and also `runSynthesis(workspace)` from `@/engine/synthesis` to get contradiction insights. Map derived metrics to the spec format with interpretations. For contradictions, filter insights with `type === 'conflict'` and map to the spec's contradiction format (id, type based on insight title, severity, detail from message, assessments from relatedTools).

  Handle missing/incomplete tools gracefully: If a tool has no data, include it with null/empty values and add a `"status": "incomplete"` flag as the spec requires.

**5. `index.ts`** — Barrel export:

```typescript
export type { BriefingNarrative, QAValidationResult, GenerationResult, AssessmentPayload } from './types.ts';
export { generateWithRetry } from './openai-service.ts';
export { assemblePayload } from './payload-assembler.ts';
export { GENERATOR_SYSTEM_PROMPT, QA_VALIDATOR_SYSTEM_PROMPT } from './prompts.ts';
```

Key implementation notes:
- Follow existing `src/engine/cloud.ts` pattern for API key handling: read from `import.meta.env.VITE_OPENAI_API_KEY`.
- All imports must use `import type` for type-only imports (verbatimModuleSyntax).
- No unused variables or parameters (noUnusedLocals, noUnusedParameters).
- No enums — use string union types (erasableSyntaxOnly).
  </action>
  <verify>
1. `npm run build` passes with no TypeScript errors.
2. Manually verify the files exist: `ls src/engine/llm/` shows types.ts, prompts.ts, openai-service.ts, payload-assembler.ts, index.ts.
3. Verify the GENERATOR_SYSTEM_PROMPT contains the full Section 3 prompt (check for "You are a senior business strategy consultant" and "CRITICAL REMINDERS" at the end).
4. Verify the QA_VALIDATOR_SYSTEM_PROMPT contains the full Section 5 prompt (check for "VALIDATION CHECKLIST" and "RULES" sections).
5. Verify `assemblePayload` correctly imports and calls `computeDerivedMetrics` from the existing engine module.
  </verify>
  <done>
- All 5 files in `src/engine/llm/` compile without errors
- `BriefingNarrative` interface matches the spec's JSON output schema exactly (all 10 fields)
- `AssessmentPayload` interface matches the spec's input schema (client, 6 assessments, derived_metrics)
- System prompts are complete verbatim copies from the spec
- `generateWithRetry` implements the full retry pipeline: generate -> validate structure -> QA validate -> retry with feedback or return with needs_human_review
- `assemblePayload` maps all 6 tool data shapes from the workspace store to the spec's payload format
- Native fetch is used (no openai npm dependency added)
  </done>
</task>

<task type="auto">
  <name>Task 2: LLM Briefing Component and Report Center Integration</name>
  <files>
    src/report/unified/LLMStrategicBriefing.tsx
    src/tools/report/ReportCenter.tsx
  </files>
  <action>
**1. Create `src/report/unified/LLMStrategicBriefing.tsx`** — A React component that renders LLM-generated narrative content using the existing report design system.

This component receives a `BriefingNarrative` object as a prop and renders it page-by-page using the existing report components (ReportPage, ReportSectionTitle, ReportBody, ReportSubsection, ReportCallout, ReportCaption, ReportList, ReportHero) from `@/report/components` and colors from `@/report/design`.

The page mapping follows Section 7.1 of the spec:

- **Cover Page**: Reuse the existing CoverPage pattern from UnifiedStrategicBriefing.tsx — client name, date, VWCG branding.
- **Executive Snapshot**: `narrative.headline_finding` in a ReportCallout. `narrative.three_words` rendered as three styled badges. Derived metrics vital signs from the workspace (use computeDerivedMetrics, same as USB does).
- **Where You Are Strong**: `narrative.strengths_narrative` split on `\n\n` into paragraphs, each in a ReportBody. Handle markdown bold (**text**) and italic (*text*) by converting to `<strong>` and `<em>` via a simple inline parser helper function.
- **Where You Are Exposed**: `narrative.exposure_narrative`, same rendering approach.
- **The Contradictions**: Map over `narrative.contradictions[]`, render each with its `.title` in ReportSubsection and `.narrative` split into paragraphs.
- **What This Is Costing You**: Map over `narrative.financial_impact[]`, render each as a cost card (similar to CostPage in USB) with `.label`, `.amount_range` in ReportHero, `.explanation` in ReportBody. Show `narrative.financial_impact_total` as a summary callout.
- **Benchmarking Context**: `narrative.benchmarking_interpretations` rendered as 4 labeled blocks (advisor_readiness, ai_readiness, leadership_dna, swot_risk_profile). Keep the existing DotPlot charts from USB and add the LLM interpretation text below each chart.
- **Top 3 Recommendations**: Map over `narrative.recommendations[]` (exactly 3), render each as a numbered card with `.title`, `.why_first`, `.what_it_looks_like`, `.estimated_impact`, `.first_step` as labeled sections.
- **90-Day Quick Wins**: Map over `narrative.quick_wins[]` (exactly 3), render as phased timeline cards with `.phase` badge, `.title`, `.description`.
- **How to Use + Report Downloads**: Reuse the static pages from UnifiedStrategicBriefing.tsx (HowToUsePage, ReportDownloadsPage pattern).

The component's root div should have `id="llm-strategic-briefing"` for PDF capture.

Props interface:
```typescript
interface LLMStrategicBriefingProps {
  narrative: BriefingNarrative;
}
```

Also use workspace data from the Zustand store for: client name (metadata.name), date, derived metrics for the vital signs section, and the DotPlot benchmarking charts. Import `useWorkspaceStore` and `computeDerivedMetrics`.

Create a helper function `renderMarkdown(text: string): React.ReactNode` that converts **bold** and *italic* markdown syntax in narrative strings into React elements with `<strong>` and `<em>` tags. Also handle `\n\n` paragraph breaks. This is needed because the LLM outputs markdown-formatted text per Section 7.2 of the spec.

Export `LLMStrategicBriefing` as a named export. Also re-export from `src/report/unified/index.ts` if that barrel file exists.

**2. Update `src/tools/report/ReportCenter.tsx`** to add the LLM generation flow:

Add a third report mode: `'ai-briefing'`. Update the `ReportMode` type to `'strategic-briefing' | 'ai-briefing' | 'individual'`.

Add new state:
```typescript
const [llmNarrative, setLlmNarrative] = useState<BriefingNarrative | null>(null);
const [llmError, setLlmError] = useState<string | null>(null);
const [llmGenerating, setLlmGenerating] = useState(false);
const [llmQaResult, setLlmQaResult] = useState<QAValidationResult | null>(null);
const [llmNeedsReview, setLlmNeedsReview] = useState(false);
```

Read the API key: `const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;`

Add "AI-Powered Briefing" button in the Report Mode Selector section (between Strategic Briefing and Individual Report). Use the `Sparkles` icon from lucide-react. If `!apiKey`, show the button as disabled with tooltip text "Set VITE_OPENAI_API_KEY to enable". The button description should say "AI-generated narrative with QA validation (~$3-6)".

When AI Briefing mode is selected and user clicks a "Generate AI Briefing" button:
1. Set `llmGenerating = true`, clear previous errors/narrative.
2. Call `assemblePayload({ tools, metadata })` to build the payload.
3. Call `generateWithRetry(payload, apiKey)` and await.
4. On success: set `llmNarrative` to the result.narrative, `llmQaResult` to result.qa, `llmNeedsReview` to result.needs_human_review.
5. On error: set `llmError` to the error message.
6. Set `llmGenerating = false`.

In the preview panel, when `reportMode === 'ai-briefing'`:
- If `llmGenerating`: Show a loading state with Loader2 spinner and "Generating AI briefing... This may take 30-60 seconds" text.
- If `llmNarrative`: Render `<LLMStrategicBriefing narrative={llmNarrative} />` inside the preview container.
- If `llmNeedsReview`: Show an amber warning banner above the preview: "QA flagged issues. Review the report carefully before sharing."
- If `llmError`: Show error message with retry button.
- If no narrative yet and not generating: Show empty state with "Click Generate AI Briefing to create an AI-powered strategic narrative" message.

For PDF download in ai-briefing mode: target element ID `llm-strategic-briefing`, reportType `'strategic-briefing'`.

If `llmQaResult` exists and has warnings, show them in a collapsible section below the generate button.

Keep ALL existing functionality intact. The template-based Strategic Briefing remains as-is. This adds a parallel option.

Import `assemblePayload`, `generateWithRetry` from `@/engine/llm`. Import types `BriefingNarrative`, `QAValidationResult` with `import type`. Import `LLMStrategicBriefing` from `@/report/unified/LLMStrategicBriefing`. Import `Sparkles` from lucide-react.
  </action>
  <verify>
1. `npm run build` passes with no TypeScript errors.
2. `npm run dev` starts successfully.
3. Navigate to Report Center (`/tools/report`). Verify three report mode buttons are visible: "Strategic Briefing", "AI-Powered Briefing", "Individual Report".
4. If no `VITE_OPENAI_API_KEY` is set, the AI-Powered Briefing button should be disabled with a message about setting the API key.
5. If API key IS set (in `.env.local`), clicking AI-Powered Briefing then "Generate AI Briefing" should show the loading spinner.
6. Verify the existing Strategic Briefing and Individual Report modes still work exactly as before.
  </verify>
  <done>
- LLMStrategicBriefing component renders all narrative sections (headline, three words, strengths, exposure, contradictions, financial impact, benchmarking, recommendations, quick wins) using existing report design system components
- Report Center has three modes: template-based Strategic Briefing (unchanged), AI-Powered Briefing (new), Individual Report (unchanged)
- LLM generation flow works end-to-end: click generate -> assembles payload -> calls OpenAI -> validates with Mini -> displays result in preview -> can download as PDF
- Error states handled: no API key (disabled), generation failure (error message + retry), QA warnings (shown to user), needs human review (amber warning)
- No regressions to existing report functionality
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Complete LLM integration pipeline: OpenAI service module with two-model architecture (ChatGPT generator + ChatGPT Mini QA validator), payload assembler that maps all 6 assessment tools to the spec format, LLM briefing React component, and Report Center integration with three report modes.
  </what-built>
  <how-to-verify>
1. Start the dev server: `npm run dev`
2. Navigate to Report Center at http://localhost:5173/tools/report
3. Verify three report mode buttons exist: "Strategic Briefing" (existing), "AI-Powered Briefing" (new, with Sparkles icon), "Individual Report" (existing)
4. Click "Strategic Briefing" — verify existing template-based report still renders correctly in preview
5. Click "AI-Powered Briefing":
   - If no API key set: button should be disabled with "Set VITE_OPENAI_API_KEY to enable" message
   - If API key IS set (add `VITE_OPENAI_API_KEY=sk-...` to `.env.local`): click "Generate AI Briefing", watch loading state, verify generated report renders with LLM narratives in all sections
   - Verify PDF download works for the AI-generated briefing
6. Check the browser console for any errors during generation
7. Verify the generated narrative has: headline finding, three words, strengths, exposure, contradictions, financial impact, recommendations (exactly 3), quick wins (exactly 3), benchmarking interpretations
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues to fix</resume-signal>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors (TypeScript strict mode passes)
2. `npm run lint` reports no new errors in the created/modified files
3. No new npm dependencies added (uses native fetch, not openai SDK)
4. Existing template-based Strategic Briefing report is completely unchanged
5. The LLM module follows existing codebase patterns (similar to src/engine/cloud.ts for API calls, uses computeDerivedMetrics from existing engine)
6. All type imports use `import type` syntax per verbatimModuleSyntax
</verification>

<success_criteria>
- 5 new files in `src/engine/llm/` implementing the complete two-model pipeline
- 1 new file `src/report/unified/LLMStrategicBriefing.tsx` rendering LLM narratives
- 1 modified file `src/tools/report/ReportCenter.tsx` with AI briefing mode
- Build passes, dev server runs, no regressions
- Full pipeline works: workspace data -> payload assembly -> ChatGPT generation -> ChatGPT Mini QA -> render in report component -> PDF download
- Graceful degradation: works without API key (feature hidden/disabled), handles API errors, handles QA failures with retry
</success_criteria>

<output>
After completion, create `.planning/quick/2-implement-llm-integration-for-strategic-/2-SUMMARY.md`
</output>
