---
phase: quick-1
plan: 01
subsystem: report-center-integration
tags: [ui, report-system, pdf-generation, quality-detection]
dependency_graph:
  requires: [unified-strategic-briefing, individual-reports, pdf-generator, quality-detector]
  provides: [functional-report-center-ui]
  affects: [user-report-workflow]
tech_stack:
  added: []
  patterns: [dual-mode-ui, quality-warnings, data-detection]
key_files:
  created: []
  modified: [src/tools/report/ReportCenter.tsx]
decisions:
  - "Dual-mode UI: Strategic Briefing (default) vs Individual Report selection"
  - "Quality warnings displayed inline for transparency, non-blocking"
  - "Data availability detection per-tool to gray out unavailable reports"
  - "Strategic Briefing captures inner USB element, individual captures wrapper container"
  - "Old PdfService.ts and ReportPreview.tsx kept as fallbacks (not deleted)"
metrics:
  duration: "15 minutes"
  completed_date: "2026-02-13"
  tasks_completed: 1
  files_modified: 1
  lines_added: 397
---

# Quick Task 1: Wire New Report System to Report Center UI

**One-liner:** Rewritten ReportCenter.tsx bridges the complete new report suite (unified briefing, individual reports, 300 DPI PDF, quality detection) into the existing tool interface with dual-mode selection and real-time preview.

## Objective

Wire the new report system (unified strategic briefing, 6 individual reports, new PDF generator, quality edge case detection) into the existing ReportCenter.tsx UI, replacing the old checkbox-based tool selector with a modern dual-mode interface that renders the new consulting-grade report components.

## What Was Built

### Core Implementation

**ReportCenter.tsx (397 lines) — Complete rewrite:**

1. **Dual-Mode UI Architecture**
   - Strategic Briefing mode (default): Renders UnifiedStrategicBriefing component
   - Individual Report mode: Tool selector for 6 individual reports
   - Large clickable cards with icons (BookOpen, FileText) for mode selection
   - Clear visual state management with indigo-50/indigo-200 selection styling

2. **Individual Report Integration**
   - INDIVIDUAL_REPORT_MAP constant: 6 tools with label, reportType, Component
   - Tools: AI Readiness, Leadership DNA, SWOT, Vision Canvas, Advisor Readiness, Roadmap
   - Excluded: BEI, SOP Taxonomy/Creation/Management (no individual reports)
   - Dynamic component rendering based on selected tool
   - Data availability detection with gray-out for empty tools

3. **Quality Detection System**
   - `useMemo` hook runs `detectEdgeCases({ tools })` on tools data changes
   - Amber warning panel displays edge case results when detected
   - Shows edge case type and details text
   - Non-blocking — informational only, doesn't prevent PDF generation

4. **New PDF Pipeline**
   - `handleDownloadPdf` async handler
   - Strategic Briefing: Captures `#unified-strategic-briefing` element
   - Individual: Captures `#report-preview-container` wrapper
   - Calls `savePdf(element, { title, clientName, reportType })`
   - Branded file naming and 300 DPI output from new PdfGenerator

5. **Preview Rendering**
   - Strategic Briefing: UnifiedStrategicBriefing rendered in preview container
   - Individual: Selected report component (e.g., AIReadinessReport) rendered
   - Empty state: "Select a report from the left panel to preview" placeholder
   - Consistent styling: bg-slate-500/10 wrapper, white max-w-800px content, scale-95 transform

### Data Detection Logic

Tool-specific hasData checks (reused from old component, improved):

- **AI Readiness:** Checks Strategy, Data, Infrastructure, Talent, Governance, Culture dimensions > 0
- **Leadership DNA:** Checks for current_ or target_ prefixed fields
- **SWOT:** Checks for entries in strengths, weaknesses, opportunities, threats arrays
- **Vision Canvas:** Checks northStar text or pillars/values arrays
- **Advisor Readiness:** Checks answers object has keys
- **Roadmap:** Checks tasks array length

### Intentional Preservation

- **PdfService.ts** — Kept intact (old PDF generator, may have other consumers)
- **ReportPreview.tsx** — Kept intact (old preview component, fallback)
- These files are NOT imported in the new code but remain as fallback options

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

**Build Verification:**
```bash
npm run build
```
- ✅ TypeScript compilation passed (tsc -b)
- ✅ Vite production build succeeded (4.63s)
- ✅ No unused import errors after cleanup
- ✅ All imports use correct type-only syntax (`import type` for ReportType)
- ✅ Build output: 1,340.47 kB main chunk (large due to report components + Chart.js/D3)

**Code Quality:**
- ✅ Follows `verbatimModuleSyntax` — all type imports use `import type`
- ✅ No unused variables (`noUnusedLocals` / `noUnusedParameters` enforced)
- ✅ Proper path alias usage (`@/` for src/)
- ✅ `cn()` utility for conditional classNames
- ✅ All icons from lucide-react
- ✅ Consistent Tailwind patterns (indigo-600 primary, slate-500 text, rounded-xl cards)

**Key Integrations Verified:**

| Integration | Status | Evidence |
|-------------|--------|----------|
| UnifiedStrategicBriefing import | ✅ | `import { UnifiedStrategicBriefing } from '@/report/unified'` |
| 6 individual reports import | ✅ | `import { AIReadinessReport, LeadershipDNAReport, ... } from '@/report/individual'` |
| savePdf import | ✅ | `import { savePdf } from '@/report/pdf'` with ReportType type |
| detectEdgeCases import | ✅ | `import { detectEdgeCases } from '@/report/quality'` |
| Quality warnings state | ✅ | `useMemo(() => detectEdgeCases({ tools }), [tools])` |
| Dual-mode UI | ✅ | Strategic Briefing + Individual Report cards with selection state |
| Data detection | ✅ | Per-tool hasData checks, gray out unavailable reports |
| PDF handler | ✅ | Element capture + savePdf call with reportType routing |

## Success Criteria Check

- [x] ReportCenter.tsx imports and renders UnifiedStrategicBriefing ✅
- [x] All 6 individual reports imported and rendered ✅
- [x] Uses savePdf from new PDF generator ✅
- [x] Mode selector allows switching between strategic briefing and individual ✅
- [x] Quality detection runs on workspace data and displays warnings ✅
- [x] `npm run build` passes with zero errors ✅
- [x] Old PdfService.ts and ReportPreview.tsx remain untouched ✅

## Key Files

**Modified:**
- `src/tools/report/ReportCenter.tsx` (397 lines) — Complete rewrite with dual-mode UI

**Preserved (not deleted):**
- `src/tools/report/PdfService.ts` — Old PDF generator (fallback)
- `src/tools/report/ReportPreview.tsx` — Old preview component (fallback)

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | bd97af0 | feat(quick-1): rewrite ReportCenter with new report system |

## Self-Check: PASSED

**Files created:** None (rewrite of existing file)

**Files modified:**
```bash
[ -f "C:/Users/Kamyar/Documents/VWCGApp/src/tools/report/ReportCenter.tsx" ] && echo "FOUND"
```
✅ FOUND: src/tools/report/ReportCenter.tsx

**Commits exist:**
```bash
git log --oneline --all | grep -q "bd97af0"
```
✅ FOUND: bd97af0 (feat(quick-1): rewrite ReportCenter with new report system)

**Build verification:**
```bash
npm run build
```
✅ PASSED: TypeScript + Vite build completed successfully

## Notes

**Why this matters:**

The entire new report system under `src/report/` (phases 1-10, ~9,400 lines of code) had ZERO integration with the UI until this task. This 397-line rewrite is the critical bridge that makes the consulting-grade reports actually usable by end users.

**User workflow enabled:**

1. Navigate to Report Center
2. Choose Strategic Briefing (flagship 12-16 page assessment) or Individual Report
3. Preview renders new report components in real-time
4. Quality warnings appear automatically when edge cases detected
5. Download PDF triggers new 300 DPI branded pipeline
6. Files named: `ClientName-Strategic-Briefing-2026-02-13.pdf` or `ClientName-AI-Readiness-2026-02-13.pdf`

**Architecture decision:**

Keeping old PdfService.ts and ReportPreview.tsx files ensures no breaking changes if those components are imported elsewhere or needed as fallback. The new ReportCenter.tsx doesn't import them — clean separation.

**Next steps (outside this task):**

- User acceptance testing with real workspace data
- Visual QA of PDF output across all 7 report types (1 unified + 6 individual)
- Performance testing with large datasets (e.g., 100+ SWOT entries)
- Accessibility audit (keyboard navigation, ARIA labels)
