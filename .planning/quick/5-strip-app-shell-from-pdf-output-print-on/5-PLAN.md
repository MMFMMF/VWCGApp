---
phase: 5-strip-app-shell-from-pdf-output-print-on
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/index.css
  - tests/helpers/pdf.ts
autonomous: true

must_haves:
  truths:
    - "PDFs contain only report content, no sidebar/header/banner"
    - "PDFs render full-width across the page"
    - "Print CSS activates automatically when page.pdf() is called"
  artifacts:
    - path: "src/index.css"
      provides: "@media print rules to hide app shell"
      contains: "@media print"
    - path: "tests/helpers/pdf.ts"
      provides: "Simplified PDF helpers without DOM manipulation"
      min_lines: 150
  key_links:
    - from: "page.pdf()"
      to: "@media print rules"
      via: "Chromium's print-to-PDF engine"
      pattern: "@media print"
---

<objective>
Strip app shell (sidebar, header, banner) from PDF output by adding @media print CSS rules. PDFs generated via page.pdf() will show only the report content, full-width, with no app chrome.

Purpose: PDFs currently include the entire app UI (sidebar, header, logic upgrade banner) instead of just the report. This makes them unprofessional and wastes space.

Output: Clean PDFs containing only report content, achieved via print CSS without routing or component changes.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/layout/AppShell.tsx
@src/App.tsx
@tests/helpers/pdf.ts
@tests/journeys/pdf-generation.spec.ts

**Key Architecture:**
- `AppShell` provides sidebar (`.w-64.bg-slate-900`), header (`<header>`), and content area (`<main>`)
- Report containers use IDs: `#report-preview-container`, `#unified-strategic-briefing`, `#llm-strategic-briefing`
- `page.pdf()` uses Chromium's print-to-PDF, which respects `@media print` rules
- Current `prepareDomForPdf()` tries to hide shell via JS DOM manipulation, but it's fragile
</context>

<tasks>

<task type="auto">
  <name>Add @media print CSS to hide app shell and expand report content</name>
  <files>src/index.css</files>
  <action>
Add `@media print` block to `src/index.css` (append at end of file):

```css
/* =====================================================================
   Print Styles — for PDF generation via page.pdf()
   ===================================================================== */
@media print {
  /* Hide all app chrome */
  aside,              /* Sidebar */
  header,             /* Topbar */
  nav,                /* Navigation */
  .sidebar,
  .topbar,
  [class*="banner"],  /* Logic upgrade banner, safe mode banner, etc. */
  button,             /* All buttons (Save/Load/etc.) */
  input[type="file"]  /* Hidden file input */
  {
    display: none !important;
  }

  /* Make body and main full-width */
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  main {
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
  }

  /* Expand report containers to full width */
  #report-preview-container,
  #unified-strategic-briefing,
  #llm-strategic-briefing {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    scale: 1 !important;
  }

  /* Remove any scroll/height constraints */
  .overflow-y-auto,
  .overflow-auto,
  .custom-scrollbar {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }

  /* Ensure all containers allow content to flow */
  div {
    page-break-inside: avoid;
  }

  /* Remove any grid/flex constraints on report ancestors */
  .lg\\:col-span-1,
  .lg\\:col-span-3,
  .grid,
  .flex {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
  }
}
```

Why print CSS over dedicated route:
- No routing changes required
- No component modifications
- Chromium's page.pdf() automatically applies @media print
- Works for all three report types (individual, unified, AI-powered)
- Non-breaking: existing tests work unchanged
  </action>
  <verify>Run E2E test and verify PDF contains no sidebar/header: `npm run test:e2e -- pdf-generation.spec.ts -g "Sarah Chen.*AI Readiness"`</verify>
  <done>PDF generated for Sarah's AI Readiness report contains only the report content (no sidebar, no header, no banner), full-width across the page</done>
</task>

<task type="auto">
  <name>Remove obsolete prepareDomForPdf() DOM manipulation from test helpers</name>
  <files>tests/helpers/pdf.ts</files>
  <action>
Since `@media print` CSS now handles hiding the app shell, the `prepareDomForPdf()` function is obsolete and can be removed.

**Changes to `tests/helpers/pdf.ts`:**

1. **Delete the `prepareDomForPdf()` function** (lines 36-72)

2. **Remove `prepareDomForPdf()` calls** from all three capture functions:
   - In `captureIndividualReportPdf()`: delete lines 118-120 (prepareDomForPdf call + wait)
   - In `captureUnifiedReportPdf()`: delete lines 153-155 (prepareDomForPdf call + wait)
   - In `captureAIBriefingPdf()`: delete lines 195-197 (prepareDomForPdf call + wait)

3. **Keep everything else unchanged**: selectors, timeouts, PDF options, file paths, etc.

Why remove instead of keep:
- Print CSS is the single source of truth for PDF layout
- JS DOM manipulation is fragile (depends on class names, structure)
- Eliminates 500ms wait × 3 per test = faster test runs
- Simpler test code
  </action>
  <verify>Run full PDF generation suite: `npm run test:e2e -- pdf-generation.spec.ts` (all 27 tests should pass and produce clean PDFs)</verify>
  <done>All 27 PDF generation tests pass, PDFs contain only report content (no app shell), and `prepareDomForPdf()` function is removed from test helpers</done>
</task>

</tasks>

<verification>
1. **Visual check**: Open any generated PDF from `test-outputs/pdfs/` — verify no sidebar, no header, no banner, report content full-width
2. **Test pass**: All 27 tests in `pdf-generation.spec.ts` pass
3. **File size**: PDFs remain > 1KB (text content preserved)
4. **No regression**: UI in browser (non-print mode) remains unchanged — sidebar, header, banner still visible
</verification>

<success_criteria>
- [ ] `@media print` block added to `src/index.css` with rules to hide app shell
- [ ] `prepareDomForPdf()` function deleted from `tests/helpers/pdf.ts`
- [ ] All 27 PDF generation tests pass
- [ ] Generated PDFs contain only report content (no sidebar, no header, no banner)
- [ ] PDFs render full-width across A4 pages
- [ ] Browser UI (non-print) unchanged — sidebar/header/banner still visible
</success_criteria>

<output>
After completion, create `.planning/quick/5-strip-app-shell-from-pdf-output-print-on/5-SUMMARY.md`
</output>
