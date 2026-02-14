---
phase: quick-6
plan: 01
subsystem: pdf-generation
tags: [pdf, e2e-testing, routing, playwright]
dependency_graph:
  requires: [quick-5]
  provides: [clean-pdf-output, print-route]
  affects: [e2e-tests, app-routing]
tech_stack:
  added: [print-route, footer-template]
  patterns: [shell-less-rendering, direct-navigation]
key_files:
  created:
    - src/components/print/PrintReport.tsx
  modified:
    - src/App.tsx
    - tests/helpers/pdf.ts
decisions:
  - PrintReport maps 7 report types to components (unified + 6 individual)
  - Print route exists OUTSIDE AppShell wrapper for clean rendering
  - E2E tests navigate directly to /report/print/:reportType URLs
  - Footer template uses inline CSS with flexbox for proper spacing
  - AI briefing keeps Report Center route (requires interactive LLM generation)
metrics:
  duration: "5m 26s"
  completed: 2026-02-14
  tasks: 3
  files_created: 1
  files_modified: 2
  tests_passing: 27
---

# Quick Task 6: Dedicated Print Route for PDF Generation Summary

**One-liner:** Print route renders reports without AppShell wrapper, enabling clean PDF generation with footer template in E2E tests.

## Overview

Added a dedicated `/report/print/:reportType` route that renders reports without the AppShell wrapper (no sidebar, header, or navigation chrome). Updated E2E PDF generation helpers to navigate directly to print routes and include a footer template with company branding and page numbers. This produces professional PDFs containing only report content with proper pagination.

## Tasks Completed

### Task 1: Create PrintReport component for shell-free rendering
**Status:** Complete | **Commit:** 4e93ef2

Created `src/components/print/PrintReport.tsx` that:
- Maps 7 report types to their components (unified, ai-readiness, leadership-dna, swot, vision-canvas, advisor-readiness, roadmap)
- Renders reports in full-width container without AppShell
- Assigns appropriate container IDs for E2E test selectors
- Handles invalid report types with error message

**Key implementation:**
```tsx
const REPORT_MAP: Record<string, { Component: FC; containerId: string }> = {
  unified: { Component: UnifiedStrategicBriefing, containerId: 'unified-strategic-briefing' },
  'ai-readiness': { Component: AIReadinessReport, containerId: 'ai-readiness' },
  // ... 5 more individual reports
};

export const PrintReport: FC = () => {
  const { reportType } = useParams<{ reportType: string }>();
  const { Component, containerId } = REPORT_MAP[reportType];
  return (
    <div className="min-h-screen bg-white">
      <div id={containerId} className="w-full">
        <Component />
      </div>
    </div>
  );
};
```

**Files:**
- Created: `src/components/print/PrintReport.tsx` (109 lines)

### Task 2: Add print route outside AppShell wrapper in App.tsx
**Status:** Complete | **Commit:** 8bd98f8

Restructured routing in `src/App.tsx` to place print route OUTSIDE the AppShell wrapper:
- Print route `/report/print/:reportType` renders directly without shell
- Existing app routes remain wrapped in AppShell for normal navigation
- Import PrintReport component

**Key implementation:**
```tsx
<Router>
  <Routes>
    {/* Print routes — NO AppShell (for clean PDF generation) */}
    <Route path="/report/print/:reportType" element={<PrintReport />} />

    {/* App routes — WITH AppShell */}
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardTool />} />
      {/* ... existing tool routes */}
    </Route>
  </Routes>
</Router>
```

**Files:**
- Modified: `src/App.tsx` (+7 lines)

### Task 3: Update E2E helpers to use print routes with footer template
**Status:** Complete | **Commit:** 9febb03

Updated `tests/helpers/pdf.ts` to navigate directly to print routes:

**captureIndividualReportPdf:**
- Changed from Report Center navigation + UI clicks to direct print route: `page.goto(/report/print/${toolId})`
- Removed INDIVIDUAL_REPORT_LABELS mapping (no longer needed)
- Added footer template with company branding and page numbers
- Increased bottom margin to 25mm to accommodate footer

**captureUnifiedReportPdf:**
- Changed from Report Center navigation to direct print route: `page.goto('/report/print/unified')`
- Added footer template
- Increased bottom margin to 25mm

**captureAIBriefingPdf:**
- Kept Report Center route (requires interactive LLM generation)
- Added footer template
- Increased bottom margin to 25mm

**Footer template:**
```typescript
const FOOTER_TEMPLATE = '<div style="width: 100%; font-size: 9px; padding: 0 18mm; display: flex; justify-content: space-between; color: #64748b;"><span>World Consulting Group | worldconsultinggroup.com</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>';
```

**Files:**
- Modified: `tests/helpers/pdf.ts` (-44 lines, +31 lines)

## Deviations from Plan

None — plan executed exactly as written.

## Verification

### Build Verification
```bash
$ npm run build
✓ 2062 modules transformed.
✓ built in 4.65s
```

### E2E Test Verification
```bash
$ npx playwright test tests/journeys/pdf-generation.spec.ts --reporter=line
27 passed (2.3m)
```

All PDF generation tests pass:
- 6 individual reports × 3 personas = 18 tests
- 1 unified report × 3 personas = 3 tests
- 1 AI briefing × 3 personas = 3 tests
- 3 verification tests (PDF existence checks)

**Generated PDFs:**
- `test-outputs/pdfs/sarah/`: 8 PDFs
- `test-outputs/pdfs/mike/`: 8 PDFs
- `test-outputs/pdfs/alex/`: 8 PDFs

Each PDF contains:
- Only report content (no AppShell)
- Footer with "World Consulting Group | worldconsultinggroup.com" and "Page X of Y"
- Proper A4 formatting with 18mm margins (25mm bottom for footer)

### Manual Verification
Navigated to `http://localhost:5173/report/print/unified` — confirmed NO sidebar/header visible, only report content.

## Self-Check

**Created files exist:**
```bash
$ [ -f "src/components/print/PrintReport.tsx" ] && echo "FOUND"
FOUND
```

**Commits exist:**
```bash
$ git log --oneline | grep -E "(4e93ef2|8bd98f8|9febb03)"
9febb03 feat(quick-6): update E2E helpers to use print routes with footer template
8bd98f8 feat(quick-6): add print route outside AppShell wrapper
4e93ef2 feat(quick-6): create PrintReport component for shell-free rendering
```

**Modified files contain expected patterns:**
```bash
$ grep -q "Route path=\"/report/print/:reportType\"" src/App.tsx && echo "FOUND: Print route"
FOUND: Print route

$ grep -q "FOOTER_TEMPLATE" tests/helpers/pdf.ts && echo "FOUND: Footer template"
FOUND: Footer template

$ grep -q "page.goto('/report/print/" tests/helpers/pdf.ts && echo "FOUND: Print route navigation"
FOUND: Print route navigation
```

## Self-Check: PASSED

All files created, all commits exist, all patterns verified.

## Impact

**Benefits:**
- Clean PDFs with no UI artifacts (sidebar, header, banners)
- Professional footer with company branding and page numbers
- Faster E2E tests (direct navigation vs UI clicks)
- Separation of concerns (print rendering vs app navigation)

**Breaking changes:** None

**Affected systems:**
- E2E PDF generation tests (simplified navigation)
- App routing (new print route)
- Report rendering (new shell-less component)

## Metrics

| Metric | Value |
|--------|-------|
| Duration | 5m 26s |
| Tasks completed | 3 |
| Files created | 1 |
| Files modified | 2 |
| Lines added | 147 |
| Lines removed | 44 |
| Net lines | +103 |
| E2E tests | 27 passing |
| PDFs generated | 24 (3 personas × 8 reports each) |

## Notes

**Key decisions:**
1. **Container IDs:** Individual reports use `id={toolId}` pattern (e.g., `id="ai-readiness"`), unified uses `id="unified-strategic-briefing"`, matching what E2E tests expect
2. **AI briefing route:** Kept Report Center navigation for AI briefing (requires interactive LLM generation button click) but added footer template to pdf() call
3. **Footer template:** Uses inline CSS with flexbox for proper left/right alignment, slate-500 color (#64748b) for subtle text, 9px font for professional appearance
4. **Margin adjustment:** Increased bottom margin to 25mm (from 20mm) to accommodate footer when `displayHeaderFooter: true`
5. **Header template:** Empty `<div></div>` suppresses default Chromium header text

**Future considerations:**
- Could add LLM print route if we pre-generate narrative in URL params or localStorage
- Could add query params for custom footer text/branding
- Could create print preview UI for manual PDF generation (window.print())

## Related Artifacts

**Commits:**
- `4e93ef2`: PrintReport component
- `8bd98f8`: Print route in App.tsx
- `9febb03`: E2E helpers with print routes

**Files:**
- `src/components/print/PrintReport.tsx` — Print-only report renderer
- `src/App.tsx` — Print route outside AppShell
- `tests/helpers/pdf.ts` — Direct navigation to print routes with footer

**Tests:**
- `tests/journeys/pdf-generation.spec.ts` — All 27 tests passing
