---
phase: quick-5
plan: 01
subsystem: pdf-generation
tags: [pdf, print-css, e2e-tests, chromium, layout]
dependency_graph:
  requires: [page.pdf(), Report Center, AppShell layout]
  provides: [Clean PDFs without app shell, Print CSS stylesheet]
  affects: [All 27 PDF generation tests, Print mode rendering]
tech_stack:
  added: ["@media print CSS rules", "Chromium print-to-PDF engine"]
  patterns: ["Print stylesheet pattern", "CSS-based layout control", "No JS DOM manipulation"]
key_files:
  created: []
  modified:
    - path: "src/index.css"
      diff: "+43 lines"
      purpose: "Added comprehensive @media print rules to hide app shell and expand reports"
    - path: "tests/helpers/pdf.ts"
      diff: "-57 lines"
      purpose: "Removed obsolete prepareDomForPdf() DOM manipulation function"
decisions:
  - what: "Use @media print CSS instead of ?print=on routing or dedicated print route"
    why: "Simpler, no routing changes, works automatically with page.pdf(), non-breaking"
    alternatives_rejected: ["Dedicated /print route", "?print=on query param with conditional rendering", "Continued JS DOM manipulation"]
  - what: "Remove prepareDomForPdf() instead of keeping as fallback"
    why: "Print CSS is single source of truth, eliminates fragile class-name dependencies, 1.5s faster tests"
    impact: "Cleaner test code, more maintainable, relies on browser standards"
metrics:
  duration: "3.9 minutes"
  tasks_completed: 2
  files_modified: 2
  lines_added: 43
  lines_removed: 57
  net_change: -14
  test_suite: "27/27 tests pass (2.0m runtime)"
  completed: "2026-02-14"
---

# Quick Task 5: Strip AppShell from PDF Output via Print CSS

**One-liner:** Replaced fragile JS DOM manipulation with comprehensive @media print CSS rules to hide AppShell (sidebar, header, banners) from page.pdf() output — PDFs now contain only report content, full-width across A4 pages.

## Summary

**Problem:** PDFs generated via page.pdf() included the entire app UI (sidebar, topbar, logic upgrade banner, buttons) instead of just the report content. This made them unprofessional and wasted space. The existing print CSS was incomplete, and test helpers used fragile JS DOM manipulation to hide elements.

**Solution:** Enhanced the existing @media print block in src/index.css with comprehensive rules to:
- Hide all app chrome (aside, nav, header, buttons, banners, file inputs)
- Force main and report containers to full-width with no layout constraints
- Remove scroll/height/overflow constraints
- Remove grid/flex layout constraints that limited report width

Removed the 45-line prepareDomForPdf() function from test helpers — print CSS is now the single source of truth for PDF layout.

**Impact:** All 27 PDF generation tests pass, PDFs contain only report content (no sidebar, no header, no banner), and tests run 1.5 seconds faster (removed 3 × 500ms waits). Browser UI in non-print mode unchanged.

## Tasks Completed

| Task | Description | Commit | Files Modified |
|------|-------------|--------|----------------|
| 1    | Add comprehensive @media print CSS to hide app shell and expand reports | 3aab405 | src/index.css (+43 lines) |
| 2    | Remove obsolete prepareDomForPdf() DOM manipulation from test helpers | 20392b8 | tests/helpers/pdf.ts (-57 lines) |

## Deviations from Plan

None — plan executed exactly as written.

## Technical Details

### Print CSS Rules Added

**App shell hiding:**
```css
aside,              /* Sidebar in AppShell */
nav,
header,
button,
input[type="file"],
[class*="banner"],  /* Logic upgrade banner, safe mode banner, etc. */
```

**Full-width expansion:**
```css
main {
  overflow: visible !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
}

#report-preview-container,
#unified-strategic-briefing,
#llm-strategic-briefing {
  width: 100% !important;
  max-width: none !important;
  transform: none !important;
  scale: 1 !important;
}
```

**Layout constraint removal:**
```css
.overflow-y-auto,
.custom-scrollbar {
  overflow: visible !important;
  height: auto !important;
}

.lg\:col-span-1,
.lg\:col-span-3,
.grid {
  display: block !important;
  width: 100% !important;
}
```

### Simplification in Test Helpers

**Before (fragile):**
```typescript
async function prepareDomForPdf(page: Page) {
  await page.evaluate(() => {
    const leftPanel = document.querySelector('.lg\\:col-span-1');
    if (leftPanel) (leftPanel as HTMLElement).style.display = 'none';
    // ... 40 more lines of DOM manipulation
  });
}

// Called 3 times per test:
await prepareDomForPdf(page);
await page.waitForTimeout(500);
```

**After (simple):**
```typescript
// No function needed — print CSS handles everything
await page.pdf({ ... });
```

## Verification

**Test results:**
```
npm run test:e2e -- pdf-generation.spec.ts
27 passed (2.0m)
```

**Coverage:**
- 3 personas (Sarah Chen, Mike Patterson, Alex Rivera)
- 6 individual reports per persona
- 1 unified strategic briefing per persona
- 1 AI-powered briefing per persona
- File size verification (all > 1KB, real text content)

**Visual check:** Generated PDFs in test-outputs/pdfs/ contain only report content, no sidebar, no header, no banner, full-width across A4 pages.

## Self-Check: PASSED

**Files modified exist:**
```bash
FOUND: src/index.css
FOUND: tests/helpers/pdf.ts
```

**Commits exist:**
```bash
FOUND: 3aab405 (feat: add comprehensive print CSS)
FOUND: 20392b8 (refactor: remove obsolete DOM manipulation)
```

**Tests pass:**
```bash
27/27 PDF generation tests pass
```

## Lessons Learned

**Print CSS > JS DOM manipulation:**
- Browser standards (Chromium's print-to-PDF) respect @media print automatically
- No fragile class-name dependencies
- No need to wait for JS execution
- Single source of truth for print layout
- Non-breaking: existing UI unchanged in browser mode

**Why not a dedicated /print route:**
- Would require routing changes
- Would need conditional component rendering
- Would add complexity for navigation in tests
- Print CSS achieves the same result with zero routing code

**Performance improvement:**
- Removed 3 × 500ms waits (prepareDomForPdf + settle time)
- 1.5 seconds faster per test × 27 tests = ~40 seconds faster suite
- Actual runtime: 2.0m (down from ~2.7m estimated)
