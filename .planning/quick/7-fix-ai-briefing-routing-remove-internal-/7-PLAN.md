---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/report/narrative/templates.ts
  - src/report/components/ReportPage.tsx
  - src/tools/report/ReportCenter.tsx
  - src/components/print/PrintReport.tsx
  - tests/helpers/pdf.ts
autonomous: true
must_haves:
  truths:
    - "Vision Canvas values render as readable text, not [object Object]"
    - "PDF pages have exactly one footer (Puppeteer footerTemplate only), no internal footer"
    - "AI Briefing PDF captures only the briefing content, not Report Center UI chrome"
  artifacts:
    - path: "src/report/narrative/templates.ts"
      provides: "Correct string extraction from value objects"
      contains: "typeof v === 'string' ? v : v.text"
    - path: "src/report/components/ReportPage.tsx"
      provides: "Page layout without internal footer"
    - path: "src/components/print/PrintReport.tsx"
      provides: "ai-briefing entry in REPORT_MAP"
      contains: "ai-briefing"
    - path: "src/tools/report/ReportCenter.tsx"
      provides: "localStorage persistence of LLM narrative"
      contains: "localStorage.setItem"
    - path: "tests/helpers/pdf.ts"
      provides: "AI briefing capture via print route"
      contains: "report/print/ai-briefing"
  key_links:
    - from: "src/tools/report/ReportCenter.tsx"
      to: "src/components/print/PrintReport.tsx"
      via: "localStorage key 'vwcg-llm-narrative'"
      pattern: "vwcg-llm-narrative"
    - from: "tests/helpers/pdf.ts"
      to: "/report/print/ai-briefing"
      via: "page.goto navigation after generation"
      pattern: "report/print/ai-briefing"
---

<objective>
Fix 3 issues from QA review (Test 8): [object Object] in Vision Canvas values, duplicate internal+Puppeteer footers, and AI Briefing PDFs capturing Report Center UI instead of clean briefing content.

Purpose: Eliminate rendering bugs and layout issues found during QA validation of PDF output.
Output: Clean, correct PDF generation for all report types.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/report/narrative/templates.ts
@src/report/components/ReportPage.tsx
@src/tools/report/ReportCenter.tsx
@src/components/print/PrintReport.tsx
@tests/helpers/pdf.ts
@src/report/unified/LLMStrategicBriefing.tsx (lines 540-596 — component interface + props)
@src/engine/llm/types.ts (BriefingNarrative type definition)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix [object Object] in Vision Canvas values</name>
  <files>src/report/narrative/templates.ts</files>
  <action>
Fix two locations where Vision Canvas `values` are incorrectly cast as `string[]` when they are actually `{ id: string, text: string }` objects. The seed data in tests and the real Vision Canvas tool both store values as objects with a `text` property.

**Line 312** (in `buildContradictionsNarrative`):
Replace:
```typescript
const values = vision?.values as string[] | undefined;
```
With:
```typescript
const rawValues = vision?.values as Array<string | { text: string }> | undefined;
const values = rawValues?.map(v => typeof v === 'string' ? v : v.text);
```

**Line 602** (in `buildVisionCanvasNarrative`):
Replace:
```typescript
const values = (vision.values ?? []) as string[];
```
With:
```typescript
const rawValues = (vision.values ?? []) as Array<string | { text: string }>;
const values = rawValues.map(v => typeof v === 'string' ? v : v.text);
```

Both locations handle the dual shape (plain strings OR objects) so the code is forward-compatible.
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Grep templates.ts for `as string[]` related to values — should find zero matches.</verify>
  <done>Both `buildContradictionsNarrative` and `buildVisionCanvasNarrative` extract `.text` from value objects, preventing [object Object] rendering.</done>
</task>

<task type="auto">
  <name>Task 2: Remove internal footer from ReportPage (eliminate dual footer)</name>
  <files>src/report/components/ReportPage.tsx</files>
  <action>
The Puppeteer `footerTemplate` in `tests/helpers/pdf.ts` already renders "World Consulting Group | worldconsultinggroup.com Page X of Y" on every PDF page. The internal `<footer>` in ReportPage.tsx (lines 83-95) duplicates this and wastes ~50-60px of page space.

1. **Remove the entire `<footer>` block** (lines 83-95 inclusive) from the non-cover variant render path.

2. **Remove the `REPORT_FOOTER` import** on line 2 (`import { REPORT_FOOTER } from '../design';`) since it is no longer used anywhere in this file.

3. **Keep the `pageNumber` prop in the interface** — do NOT remove it. It is passed by ~30 call sites across UnifiedStrategicBriefing.tsx, LLMStrategicBriefing.tsx, and all 6 individual report components. The prop simply becomes unused within ReportPage itself. Add an underscore prefix or a suppression comment to satisfy `noUnusedParameters`:
   - Change the destructured parameter from `pageNumber,` to `pageNumber: _pageNumber,` (or use `// eslint-disable-next-line @typescript-eslint/no-unused-vars` before the destructuring if preferred). The underscore-prefix approach is cleaner.

The final component should render the `<div>` with main content area but NO footer element for standard/data/callout variants.
  </action>
  <verify>Run `npm run build` — no TypeScript errors, no unused variable warnings. Visually inspect the file to confirm no `<footer>` block remains. Grep for `REPORT_FOOTER` in ReportPage.tsx — zero matches.</verify>
  <done>ReportPage renders without internal footer. Puppeteer footerTemplate is the sole footer source in PDFs, eliminating duplicate branding and reclaiming page space.</done>
</task>

<task type="auto">
  <name>Task 3: Fix AI Briefing PDF to use print route instead of Report Center page</name>
  <files>
    src/tools/report/ReportCenter.tsx
    src/components/print/PrintReport.tsx
    tests/helpers/pdf.ts
  </files>
  <action>
Currently `captureAIBriefingPdf` captures the entire Report Center page (including mode selector, QA banners, quality warnings, sidebar controls). Fix this by persisting the LLM narrative to localStorage after generation, creating a print-route wrapper that reads it back, and updating the test helper to navigate to the clean print route after generation.

**Step A — ReportCenter.tsx: Persist narrative to localStorage**

In the `handleGenerateAIBriefing` callback, immediately after the `setLlmNarrative(result.narrative)` call (line 165), add:
```typescript
localStorage.setItem('vwcg-llm-narrative', JSON.stringify(result.narrative));
```

This single line is all that changes in ReportCenter.tsx. No other modifications needed.

**Step B — PrintReport.tsx: Add `ai-briefing` to REPORT_MAP**

1. Add import for `LLMStrategicBriefing` at the top:
```typescript
import { LLMStrategicBriefing } from '@/report/unified';
```

2. Add import for `BriefingNarrative` type:
```typescript
import type { BriefingNarrative } from '@/engine/llm/types';
```

3. Create a wrapper component (inside PrintReport.tsx, above the REPORT_MAP) that reads the narrative from localStorage:
```typescript
const AIBriefingPrintWrapper: FC = () => {
  const raw = localStorage.getItem('vwcg-llm-narrative');
  if (!raw) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">No AI Briefing Data</h1>
          <p className="text-slate-600">
            Generate an AI briefing from Report Center first.
          </p>
        </div>
      </div>
    );
  }
  const narrative: BriefingNarrative = JSON.parse(raw);
  return <LLMStrategicBriefing narrative={narrative} />;
};
```

4. Add entry to `REPORT_MAP`:
```typescript
'ai-briefing': {
  Component: AIBriefingPrintWrapper,
  containerId: 'llm-strategic-briefing',
},
```

Note: The `containerId` is `llm-strategic-briefing` because that's the id rendered by `LLMStrategicBriefing` on its root div.

**Step C — tests/helpers/pdf.ts: Navigate to print route after generation**

Update `captureAIBriefingPdf` (lines 105-139). Keep the Report Center navigation and LLM generation steps (lines 112-125) exactly as they are — the UI button click is still needed to trigger generation. But REPLACE the capture section (lines 127-136) with navigation to the print route:

After `await page.waitForTimeout(3000);` (line 125), replace the `page.pdf(...)` block with:
```typescript
// Navigate to clean print route for capture (no Report Center chrome)
await page.goto('/report/print/ai-briefing');
await page.waitForSelector('#llm-strategic-briefing', { state: 'attached' });
await page.waitForTimeout(3000); // let charts/fonts settle

// Capture PDF with footer
await page.pdf({
  path: destPath,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: HEADER_TEMPLATE,
  footerTemplate: FOOTER_TEMPLATE,
  margin: { top: '20mm', right: '18mm', bottom: '25mm', left: '18mm' },
});
```

The key insight: localStorage persists across `page.goto()` calls within the same browser context, so the narrative written by ReportCenter will be available when PrintReport reads it.
  </action>
  <verify>
1. Run `npm run build` — no TypeScript errors.
2. Grep PrintReport.tsx for `ai-briefing` — should find the REPORT_MAP entry.
3. Grep ReportCenter.tsx for `localStorage.setItem.*vwcg-llm-narrative` — should find the persistence line.
4. Grep pdf.ts for `report/print/ai-briefing` — should find the navigation line.
5. Verify the updated doc comment at the top of PrintReport.tsx lists `ai-briefing` as a supported type.
  </verify>
  <done>AI Briefing PDFs are captured from the clean `/report/print/ai-briefing` route, showing only the LLMStrategicBriefing component without any Report Center UI chrome (mode selector, QA banners, download buttons, sidebar).</done>
</task>

</tasks>

<verification>
After all three tasks:
1. `npm run build` passes with zero errors
2. No `[object Object]` possible in Vision Canvas value rendering (templates.ts handles both string and object shapes)
3. No `<footer>` element in ReportPage.tsx (Puppeteer footerTemplate is the single footer source)
4. PrintReport.tsx supports 8 report types including `ai-briefing`
5. ReportCenter.tsx persists LLM narrative to localStorage on generation
6. pdf.ts navigates to `/report/print/ai-briefing` for clean AI briefing capture
</verification>

<success_criteria>
- `npm run build` succeeds
- Vision Canvas values in narrative templates extract `.text` from object values
- ReportPage has no internal footer — zero matches for `REPORT_FOOTER` in the file
- AI Briefing print route exists at `/report/print/ai-briefing` and renders LLMStrategicBriefing from localStorage
- Test helper `captureAIBriefingPdf` generates via Report Center UI then navigates to print route for capture
</success_criteria>

<output>
After completion, create `.planning/quick/7-fix-ai-briefing-routing-remove-internal-/7-SUMMARY.md`
</output>
