---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - tests/helpers/pdf.ts
  - tests/journeys/pdf-generation.spec.ts
autonomous: true
must_haves:
  truths:
    - "All 27 tests generate PDFs using Playwright's page.pdf() instead of jsPDF"
    - "Individual tool PDFs render from Report Center's consulting-grade components"
    - "PDFs contain real text (searchable) instead of rasterized images"
    - "CSS page breaks control pagination instead of html2canvas"
    - "Tests complete faster (no html2canvas rendering delays)"
  artifacts:
    - path: "tests/helpers/pdf.ts"
      provides: "page.pdf() capture helpers with DOM preparation"
      exports: ["captureIndividualReportPdf", "captureUnifiedReportPdf", "captureAIBriefingPdf", "seedAllPersonaData"]
      min_lines: 150
    - path: "tests/journeys/pdf-generation.spec.ts"
      provides: "Restructured E2E tests using Report Center + page.pdf()"
      contains: "page.pdf({ format: 'A4'"
      min_lines: 250
  key_links:
    - from: "tests/journeys/pdf-generation.spec.ts"
      to: "tests/helpers/pdf.ts"
      via: "import captureIndividualReportPdf"
      pattern: "import.*captureIndividualReportPdf"
    - from: "tests/helpers/pdf.ts"
      to: "page.pdf()"
      via: "Playwright PDF API"
      pattern: "await page\\.pdf\\("
    - from: "tests/helpers/pdf.ts"
      to: "#report-preview-container"
      via: "DOM element selector"
      pattern: "#report-preview-container"
---

<objective>
Replace jsPDF + html2canvas with Playwright's native page.pdf() for all E2E test PDF generation, producing real text PDFs with CSS page breaks.

Purpose: Generate production-quality PDFs using the browser's native print engine instead of screenshot-based rasterization — faster tests, searchable text, embedded fonts, proper kerning.

Output: Refactored test suite that uses Report Center's consulting-grade components + page.pdf() for all 27 PDF generation tests across 3 personas.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/Kamyar/Documents/VWCGApp/tests/helpers/pdf.ts
@C:/Users/Kamyar/Documents/VWCGApp/tests/journeys/pdf-generation.spec.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/index.css
@C:/Users/Kamyar/Documents/VWCGApp/playwright.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite pdf.ts helpers to use page.pdf()</name>
  <files>tests/helpers/pdf.ts</files>
  <action>
Replace all three download-based helpers with page.pdf() capture helpers:

**1. captureIndividualReportPdf(page, personaName, toolId)**
- Navigate to `/tools/report`
- Wait for Report Center to load
- Click "Individual Reports" mode button
- Select tool from dropdown via `page.selectOption('select[data-testid="tool-selector"]', toolId)`
- Wait for `#report-preview-container` to render the selected tool's report
- Prepare DOM:
  ```typescript
  await page.evaluate(() => {
    // Hide app shell
    document.querySelector('[data-sidebar]')?.setAttribute('style', 'display:none !important');
    document.querySelector('header')?.setAttribute('style', 'display:none !important');
    document.querySelector('nav')?.setAttribute('style', 'display:none !important');

    // Expand preview container (remove scroll constraints)
    const preview = document.querySelector('#report-preview-container');
    if (preview) {
      preview.setAttribute('style', 'max-height:none !important; overflow:visible !important; transform:none !important; scale:1 !important;');
    }
  });
  ```
- Wait for fonts/charts: `await page.waitForTimeout(1000);`
- Capture PDF: `await page.pdf({ path: destPath, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' } })`
- Return destPath

**2. captureUnifiedReportPdf(page, personaName)**
- Navigate to `/tools/report`
- Wait for `#unified-strategic-briefing` (Strategic Briefing mode is default)
- Wait 2 seconds for all charts/data to settle
- Prepare DOM (same pattern as above — hide shell, expand container)
- Target `#unified-strategic-briefing` element
- Capture PDF with same options
- Return destPath

**3. captureAIBriefingPdf(page, personaName)**
- Navigate to `/tools/report`
- Click "AI-Powered Briefing" mode button
- Click "Generate AI Briefing" button
- Wait for `#llm-strategic-briefing` (timeout: 180s for LLM generation)
- Wait 2 seconds for render
- Prepare DOM (same pattern)
- Target `#llm-strategic-briefing` element
- Capture PDF with same options
- Return destPath

**4. Keep seedAllPersonaData() unchanged** — it works fine and is needed to populate tool data before Report Center visits.

**5. Remove old constants** — DOWNLOAD_TIMEOUT, FULL_REPORT_DOWNLOAD_TIMEOUT no longer needed (page.pdf() is synchronous).

**File naming pattern:** Same as before — `{PersonaName}-{ToolName}.pdf`, `{PersonaName}-Full-Report.pdf`, `{PersonaName}-AI-Briefing.pdf`

**Output directory:** Keep `test-outputs/pdfs/{persona}/` structure.

**Why this approach:** Report Center already renders consulting-grade reports with proper styling, pagination, and charts. We just need to navigate there, prepare the DOM, and capture via page.pdf() instead of clicking download buttons.
  </action>
  <verify>
Read the rewritten tests/helpers/pdf.ts file — verify:
- All three capture functions use `page.pdf()` instead of `page.waitForEvent('download')`
- Each function includes DOM preparation step (hide shell, expand containers)
- `seedAllPersonaData()` is unchanged
- File exports: `captureIndividualReportPdf`, `captureUnifiedReportPdf`, `captureAIBriefingPdf`, `seedAllPersonaData`
  </verify>
  <done>
tests/helpers/pdf.ts exports three new page.pdf()-based capture helpers with DOM preparation logic and keeps seedAllPersonaData() unchanged.
  </done>
</task>

<task type="auto">
  <name>Task 2: Restructure pdf-generation.spec.ts to use Report Center</name>
  <files>tests/journeys/pdf-generation.spec.ts</files>
  <action>
Rewrite all 27 tests to use Report Center + page.pdf() instead of tool page visits + download events.

**Pattern for each persona's describe.serial block:**

**Individual tool tests (6 per persona):**
Each test now:
1. `await page.goto('/')`
2. `await resetWorkspace(page)`
3. `await seedAllPersonaData(page, {persona})` — seeds all tool data at once
4. `const p = await captureIndividualReportPdf(page, '{PersonaName}', '{tool-id}')` — captures from Report Center
5. `pdfPaths.push(p)`

Tools to generate individual PDFs for:
- `ai-readiness` → "AI Readiness"
- `leadership-dna` → "Leadership DNA"
- `swot` → "SWOT Analysis"
- `vision-canvas` → "Vision Canvas"
- `roadmap` → "90-Day Roadmap"
- `advisor-readiness` → "Advisor Readiness"

**Unified Strategic Briefing test (1 per persona):**
1. `await page.goto('/')`
2. `await resetWorkspace(page)`
3. `await seedAllPersonaData(page, {persona})`
4. `const p = await captureUnifiedReportPdf(page, '{PersonaName}')`
5. `pdfPaths.push(p)`

**AI-Powered Briefing test (1 per persona):**
1. `await page.goto('/')`
2. `await resetWorkspace(page)`
3. `await seedAllPersonaData(page, {persona})`
4. `const p = await captureAIBriefingPdf(page, '{PersonaName}')`
5. `pdfPaths.push(p)`

**Verification test (1 per persona):**
Keep the final test that verifies all 8 PDFs exist and are >1KB — this stays unchanged.

**Imports to update:**
- Remove: `fillAiReadiness`, `fillLeadershipDna`, `fillSwot`, `fillVisionCanvas`, `fillRoadmap`, `fillAdvisorReadiness` (no longer filling forms)
- Remove: `navigateToTool` (no longer visiting individual tool pages)
- Keep: `resetWorkspace`, `seedAllPersonaData`
- Update: `exportToolPdf` → `captureIndividualReportPdf`, `exportFullReport` → `captureUnifiedReportPdf`, `exportAIBriefingPdf` → `captureAIBriefingPdf`

**Test names:** Update to reflect the new approach:
- Old: "AI Readiness — fill + export PDF"
- New: "AI Readiness — seed data + capture individual report PDF"

**Why this restructure:** We no longer need to fill forms manually — seeding data via localStorage is faster and more reliable. We're capturing PDFs from the Report Center's consulting-grade components, which already have proper styling, pagination, and print CSS applied.

**Keep test timeout:** 300,000ms (5 minutes) for AI Briefing LLM generation.
  </action>
  <verify>
Run the E2E test suite:
```bash
npm run test:e2e:generate-pdfs
```

Verify:
- All 27 tests pass (9 per persona × 3 personas)
- 24 PDFs generated (8 per persona: 6 individual + 1 unified + 1 AI briefing)
- PDFs are in `test-outputs/pdfs/{sarah|mike|alex}/`
- PDF files are >1KB each
- No jsPDF/html2canvas errors in console
- PDFs contain searchable text (not images) — open one manually and try to select text
  </verify>
  <done>
All 27 E2E tests use page.pdf() to generate PDFs from Report Center's consulting-grade components. Tests pass and produce real text PDFs in test-outputs/pdfs/.
  </done>
</task>

</tasks>

<verification>
1. Read both refactored files — verify page.pdf() pattern used consistently
2. Run `npm run test:e2e:generate-pdfs` — all tests pass
3. Check test-outputs/pdfs/ — 24 PDFs exist (8 per persona)
4. Open a sample PDF — verify text is selectable (real text, not rasterized image)
5. Check PDF page count — verify CSS page breaks work (no excessive blank pages)
6. Verify no jsPDF/html2canvas imports remain in test files
</verification>

<success_criteria>
- tests/helpers/pdf.ts exports captureIndividualReportPdf, captureUnifiedReportPdf, captureAIBriefingPdf using page.pdf()
- tests/journeys/pdf-generation.spec.ts restructured with 27 tests using Report Center + seedAllPersonaData
- All E2E tests pass with `npm run test:e2e:generate-pdfs`
- 24 PDFs generated in test-outputs/pdfs/ across 3 personas
- PDFs contain searchable text rendered from browser's native print engine
- No jsPDF, html2canvas, or download event handlers in test code
</success_criteria>

<output>
After completion, create `.planning/quick/4-replace-jspdf-with-puppeteer-page-pdf-fo/4-SUMMARY.md`
</output>
