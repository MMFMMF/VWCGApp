---
phase: quick-7
plan: 01
subsystem: report-pdf
tags: [bugfix, pdf, routing, vision-canvas, footer]
dependency-graph:
  requires: []
  provides:
    - "Clean AI Briefing PDF via print route"
    - "Correct Vision Canvas value rendering in narratives"
    - "Single-source footer from Puppeteer footerTemplate"
  affects:
    - src/report/narrative/templates.ts
    - src/report/components/ReportPage.tsx
    - src/tools/report/ReportCenter.tsx
    - src/components/print/PrintReport.tsx
    - tests/helpers/pdf.ts
tech-stack:
  added: []
  patterns:
    - "localStorage bridge between Report Center and print route"
    - "Dual-shape value extraction (string | { text: string })"
key-files:
  created: []
  modified:
    - src/report/narrative/templates.ts
    - src/report/components/ReportPage.tsx
    - src/tools/report/ReportCenter.tsx
    - src/components/print/PrintReport.tsx
    - tests/helpers/pdf.ts
decisions:
  - "Use localStorage as bridge between Report Center LLM generation and print route rendering"
  - "Remove internal footer entirely rather than conditionally — Puppeteer footerTemplate is sole footer source"
  - "Handle both string and {text: string} shapes for forward compatibility"
metrics:
  duration: "2m 40s"
  completed: 2026-02-14
  tasks: 3
  files-modified: 5
---

# Quick Task 7: Fix AI Briefing Routing, Remove Dual Footer, Fix [object Object] Values

Fixed three QA issues: Vision Canvas values rendering as [object Object], duplicate internal+Puppeteer footers wasting page space, and AI Briefing PDFs capturing Report Center UI chrome instead of clean briefing content.

## Changes Made

### Task 1: Fix [object Object] in Vision Canvas values
**Commit:** `debb18d`

Vision Canvas stores values as `{ id: string, text: string }` objects, but two locations in `templates.ts` cast them as `string[]`, causing `[object Object]` to appear in narrative text.

**Fix:** Both `buildContradictionsNarrative` (line 312) and `buildVisionCanvasNarrative` (line 602) now extract `.text` from value objects with a dual-shape handler:
```typescript
const rawValues = vision?.values as Array<string | { text: string }> | undefined;
const values = rawValues?.map(v => typeof v === 'string' ? v : v.text);
```

### Task 2: Remove internal footer from ReportPage
**Commit:** `f582298`

ReportPage.tsx rendered an internal `<footer>` element with company branding and page numbers. The Puppeteer `footerTemplate` in pdf.ts already renders identical content. This caused duplicate footers in PDFs and wasted ~50-60px of page space.

**Fix:** Removed the `REPORT_FOOTER` import and the entire `<footer>` block. Changed `pageNumber` to `_pageNumber` in destructuring to suppress `noUnusedParameters` warning (prop still accepted from ~30 call sites).

### Task 3: Route AI Briefing through clean print route
**Commit:** `551fae5`

Previously `captureAIBriefingPdf` captured the entire Report Center page including mode selector, QA banners, quality warnings, and sidebar controls.

**Fix (3 files):**
1. **ReportCenter.tsx:** Added `localStorage.setItem('vwcg-llm-narrative', JSON.stringify(result.narrative))` after LLM generation
2. **PrintReport.tsx:** Added `AIBriefingPrintWrapper` component that reads narrative from localStorage, plus `ai-briefing` entry in `REPORT_MAP`
3. **pdf.ts:** After LLM generation completes in Report Center, navigates to `/report/print/ai-briefing` for clean PDF capture

The localStorage bridge works because `page.goto()` within the same browser context preserves localStorage.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run build` passes with zero errors
- Zero matches for `as string[]` in templates.ts (values always extracted via `.text`)
- Zero matches for `REPORT_FOOTER` in ReportPage.tsx (internal footer fully removed)
- PrintReport.tsx lists 8 report types including `ai-briefing` in JSDoc and REPORT_MAP
- ReportCenter.tsx persists narrative to localStorage on generation
- pdf.ts navigates to `/report/print/ai-briefing` after generation for clean capture

## Self-Check: PASSED

All files found. All 3 commits verified (debb18d, f582298, 551fae5). Build passes.
