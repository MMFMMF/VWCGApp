---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/tools/report/ReportCenter.tsx
autonomous: true

must_haves:
  truths:
    - "User can select between Strategic Briefing mode and Individual Report mode"
    - "Strategic Briefing mode renders the UnifiedStrategicBriefing component in the preview pane"
    - "Individual Report mode shows a tool selector limited to the 6 tools that have individual reports"
    - "Individual Report mode renders the correct report component for the selected tool"
    - "Download PDF uses the new PdfGenerator (savePdf) with branded naming and 300 DPI"
    - "Quality warnings (edge cases, vague entries) display before PDF generation when issues are detected"
    - "Tools without individual reports (BEI, SOP Taxonomy/Creation/Management) are excluded from individual mode"
  artifacts:
    - path: "src/tools/report/ReportCenter.tsx"
      provides: "Rewritten Report Center wiring new report system to UI"
      min_lines: 200
  key_links:
    - from: "src/tools/report/ReportCenter.tsx"
      to: "@/report/unified"
      via: "import UnifiedStrategicBriefing"
      pattern: "import.*UnifiedStrategicBriefing.*from.*@/report/unified"
    - from: "src/tools/report/ReportCenter.tsx"
      to: "@/report/individual"
      via: "import individual report components"
      pattern: "import.*from.*@/report/individual"
    - from: "src/tools/report/ReportCenter.tsx"
      to: "@/report/pdf"
      via: "import savePdf for PDF generation"
      pattern: "import.*savePdf.*from.*@/report/pdf"
    - from: "src/tools/report/ReportCenter.tsx"
      to: "@/report/quality"
      via: "import detectEdgeCases for quality warnings"
      pattern: "import.*detectEdgeCases.*from.*@/report/quality"
---

<objective>
Rewrite ReportCenter.tsx to wire the new report system (unified briefing, individual reports, new PDF generator, quality detection) into the existing UI, replacing the old tool-checkbox + ReportPreview approach.

Purpose: The complete new report system under `src/report/` is built but has zero connections to the app. This plan bridges that gap so users can actually generate the consulting-grade reports.

Output: A fully functional ReportCenter.tsx that renders new report components and uses the new PDF pipeline.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/tools/report/ReportCenter.tsx
@src/report/unified/UnifiedStrategicBriefing.tsx
@src/report/individual/index.ts
@src/report/pdf/PdfGenerator.ts
@src/report/pdf/index.ts
@src/report/quality/index.ts
@src/report/quality/EdgeCaseDetector.ts
@src/tools/report/PdfService.ts
@src/tools/report/ReportPreview.tsx
@src/store/workspaceStore.ts
@src/components/ui/Button.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite ReportCenter.tsx with dual-mode report UI and new PDF pipeline</name>
  <files>src/tools/report/ReportCenter.tsx</files>
  <action>
Rewrite `src/tools/report/ReportCenter.tsx` completely. The new component must implement the following:

**Imports (use `import type` for type-only imports per `verbatimModuleSyntax`):**
- `useState, useCallback, useRef` from `react`
- `useWorkspaceStore` from `@/store/workspaceStore`
- `Button` from `@/components/ui/Button` (existing relative path `../../components/ui/Button` is fine too)
- Icons from `lucide-react`: `FileDown, Loader2, BookOpen, FileText, AlertTriangle, ChevronDown`
- `UnifiedStrategicBriefing` from `@/report/unified`
- All 6 individual reports from `@/report/individual`: `AIReadinessReport, LeadershipDNAReport, SwotReport, VisionCanvasReport, AdvisorReadinessReport, RoadmapReport`
- `savePdf` from `@/report/pdf`
- `import type { ReportType } from '@/report/pdf'`
- `detectEdgeCases` from `@/report/quality`
- `import type { EdgeCaseResult } from '@/report/quality'`
- `cn` from `@/utils/cn`

**Keep the old imports of `generatePdf` from `./PdfService` and `ReportPreview` from `./ReportPreview` — do NOT delete those files. They remain as fallbacks.**

**State:**
- `reportMode`: `'strategic-briefing' | 'individual'` — defaults to `'strategic-briefing'`
- `selectedTool`: `string | null` — for individual mode, defaults to `null`
- `isGenerating`: `boolean`
- `showPreview`: `boolean` — defaults to `true` (show preview by default, unlike old component)
- `qualityWarnings`: `EdgeCaseResult[]` — populated on mount and when tools data changes

**Constants — INDIVIDUAL_REPORT_MAP:**
Define a constant array mapping tool IDs to their report components and ReportType values. Only the 6 tools that have individual reports:
```typescript
const INDIVIDUAL_REPORT_MAP: Array<{
  toolId: string;
  label: string;
  reportType: ReportType;
  Component: React.ComponentType;
}> = [
  { toolId: 'ai-readiness', label: 'AI Readiness Assessment', reportType: 'ai-readiness', Component: AIReadinessReport },
  { toolId: 'leadership-dna', label: 'Leadership DNA', reportType: 'leadership-dna', Component: LeadershipDNAReport },
  { toolId: 'swot', label: 'SWOT Analysis', reportType: 'swot', Component: SwotReport },
  { toolId: 'vision-canvas', label: 'Vision Canvas', reportType: 'vision-canvas', Component: VisionCanvasReport },
  { toolId: 'advisor-readiness', label: 'Advisor Readiness', reportType: 'advisor-readiness', Component: AdvisorReadinessReport },
  { toolId: 'roadmap', label: '90-Day Roadmap', reportType: 'roadmap', Component: RoadmapReport },
];
```

**Quality detection on mount:**
Use `useMemo` or `useEffect` to run `detectEdgeCases({ tools })` whenever `tools` changes. Store results in `qualityWarnings` state. The `detectEdgeCases` function expects `Record<string, unknown>` with a `tools` key, so pass `{ tools }` where `tools` comes from `useWorkspaceStore`.

**PDF handler:**
Create `handleDownloadPdf` async function:
1. Set `isGenerating = true`
2. Determine the element ID to capture:
   - Strategic briefing mode: `document.getElementById('unified-strategic-briefing')` (the USB component renders with this id)
   - Individual mode: `document.getElementById('report-preview-container')` (wrapper div around individual report)
3. If no element found, show console.error and return
4. Determine `reportType` and `title`:
   - Strategic briefing: `reportType = 'strategic-briefing'`, `title = 'Strategic Business Assessment'`
   - Individual: look up `reportType` from `INDIVIDUAL_REPORT_MAP` for `selectedTool`, `title` = the label
5. Call `await savePdf(element, { title, clientName: metadata.name, reportType })`
6. Wrap in try/catch, always set `isGenerating = false` in finally

**Layout (3-column grid like existing):**

Left panel (lg:col-span-1):
1. **Report Mode selector** — Two large clickable cards/buttons:
   - "Strategic Briefing" card with `BookOpen` icon — selected when `reportMode === 'strategic-briefing'`. Description: "Comprehensive 12-16 page unified assessment"
   - "Individual Report" card with `FileText` icon — selected when `reportMode === 'individual'`. Description: "Detailed single-tool report"
   - Use navy/indigo styling for selected state, slate for unselected, following existing design patterns (indigo-50/indigo-200 for selected, white/slate-200 for unselected)

2. **Tool selector** (only visible when `reportMode === 'individual'`):
   - Render `INDIVIDUAL_REPORT_MAP` as a list of clickable items (similar style to old tool checkboxes)
   - Each shows tool label, highlight when `selectedTool === toolId`
   - Gray out / disable tools that have no data (reuse the hasData detection logic from the old component for each tool)

3. **Quality warnings panel** (only visible when `qualityWarnings.length > 0`):
   - Amber/yellow background panel with `AlertTriangle` icon
   - Title: "Quality Notices"
   - List each warning's `details` text in a compact format
   - This is informational only, does not block generation

4. **Download button:**
   - "Download PDF" button with `FileDown` icon, indigo-600 background
   - Disabled when: `isGenerating`, or (individual mode and no tool selected)
   - Shows `Loader2` spinner when generating
   - Calls `handleDownloadPdf`

Right panel (lg:col-span-2):
- When `reportMode === 'strategic-briefing'`:
  - Render preview container div with: `className="bg-slate-500/10 p-4 rounded-xl border border-slate-200 h-[800px] overflow-y-auto"` and inside it a white div with `id="report-preview-container"` wrapping `<UnifiedStrategicBriefing />`
  - The USB component has its own `id="unified-strategic-briefing"` so the PDF handler captures that inner element directly

- When `reportMode === 'individual'` and `selectedTool` is set:
  - Look up the Component from `INDIVIDUAL_REPORT_MAP`
  - Render it inside a preview wrapper with `id="report-preview-container"` (similar styling to USB preview)

- When `reportMode === 'individual'` and no tool selected:
  - Show empty state placeholder: "Select a report from the left panel to preview"

**Style conventions:**
- Use `cn()` for conditional classnames
- All icons from `lucide-react`
- Follow existing Tailwind patterns: `text-slate-800` headings, `text-slate-500` descriptions, `bg-indigo-600` primary buttons, `rounded-xl` cards, `shadow-sm` borders
- Keep the header with `FileDown` icon and "Report Center" title

**What NOT to do:**
- Do NOT delete `PdfService.ts` or `ReportPreview.tsx` — keep them as files (they may be imported elsewhere or serve as fallback)
- Do NOT import from `./PdfService` or `./ReportPreview` in the new code — the new component uses only the new report system
- Do NOT add animations or transitions (keep it snappy)
- Do NOT use `any` type — use proper typing throughout
  </action>
  <verify>
Run `npm run build` — must pass with zero TypeScript errors. Then run `npm run dev` and navigate to the Report Center tool at `/tools/report`. Verify:
1. The mode selector shows "Strategic Briefing" and "Individual Report" cards
2. Strategic Briefing mode renders the UnifiedStrategicBriefing in the preview pane
3. Switching to Individual mode shows the tool list
4. Selecting a tool renders the corresponding individual report
5. The Download PDF button triggers the new savePdf pipeline
  </verify>
  <done>
ReportCenter.tsx renders the new report components, uses the new PDF generator, shows quality warnings, and supports both Strategic Briefing and Individual Report modes. `npm run build` passes cleanly.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes — no TypeScript errors, no unused imports
2. Navigate to Report Center in dev server — dual mode UI renders
3. Strategic Briefing preview loads the full UnifiedStrategicBriefing
4. Individual mode renders each of the 6 report components correctly
5. PDF download triggers branded file naming (e.g., "ClientName-Strategic-Briefing-2026-02-13.pdf")
6. Quality warnings panel appears when edge cases are detected (e.g., with sparse data)
</verification>

<success_criteria>
- ReportCenter.tsx imports and renders UnifiedStrategicBriefing, all 6 individual reports, and uses savePdf from the new PDF generator
- Mode selector allows switching between strategic briefing and individual report views
- Quality detection runs on workspace data and displays warnings
- npm run build passes with zero errors
- The old PdfService.ts and ReportPreview.tsx files remain untouched
</success_criteria>

<output>
After completion, create `.planning/quick/1-finish-the-remaining-tasks-including-wir/1-SUMMARY.md`
</output>
