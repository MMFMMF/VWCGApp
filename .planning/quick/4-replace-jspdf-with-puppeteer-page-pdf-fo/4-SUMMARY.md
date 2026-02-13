# Quick Task 4 Summary: Replace jsPDF with page.pdf()

**Date:** 2026-02-13
**Commit:** 479b67b (fix), 46f6858 + 7bc3ab1 (test rewrites)

## What Changed

Replaced jsPDF/html2canvas rasterized PDF generation in E2E tests with Playwright's native `page.pdf()`, producing real text PDFs with embedded fonts and CSS page breaks.

### Files Modified

| File | Change |
|------|--------|
| `tests/helpers/pdf.ts` | Replaced `exportToolPdf`, `exportFullReport`, `exportAIBriefingPdf` (download-event based) with `captureIndividualReportPdf`, `captureUnifiedReportPdf`, `captureAIBriefingPdf` (page.pdf based) |
| `tests/journeys/pdf-generation.spec.ts` | Restructured all 27 tests to use Report Center + seeded data instead of tool page form filling + jsPDF download |
| `src/report/individual/VisionCanvasReport.tsx` | Fixed data format crash: normalized pillars (`{text,kpi}` → `{name,kpi}`) and values (`{id,text}` → `string`) |

### Results

- **27/27 tests pass** in 2.4 minutes
- **24 PDFs generated** (8 per persona × 3 personas)
- **File sizes dropped 8-26x** (real text vs rasterized screenshots)
  - Sarah-AI-Readiness: 8.1 MB → 310 KB (26x)
  - Sarah-Full-Report: 3.7 MB → 441 KB (8x)
  - Total zip: 23.8 MB → 4.4 MB

### Key Technique

All PDFs now generated from Report Center's consulting-grade report components via:
1. Seed persona data into localStorage
2. Navigate to Report Center
3. Select report mode + tool
4. Prepare DOM (hide app chrome, expand scroll containers, remove transforms)
5. `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`

### Bug Found & Fixed

`VisionCanvasReport` crashed React because the stored data format (`{ id, text }` objects for values, `{ id, text, kpi }` for pillars) didn't match the component's expected format (`string[]` for values, `{ name, kpi }` for pillars). Calling `.toLowerCase()` on an object threw a TypeError. Fixed with format normalization at the top of the component.
