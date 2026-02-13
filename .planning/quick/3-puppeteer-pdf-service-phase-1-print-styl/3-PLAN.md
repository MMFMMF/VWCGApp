---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - src/index.css
  - src/report/pdf/PrintPdfService.ts
  - src/tools/report/ReportCenter.tsx
  - scripts/generate-print-pdf.cjs
autonomous: true
must_haves:
  truths:
    - "User can click 'Download Print-Ready PDF' and get a browser print dialog targeting the AI Briefing report"
    - "The printed/saved PDF has correct A4 page breaks between report pages"
    - "The PDF has proper Inter + Source Serif Pro fonts with correct kerning"
    - "The existing jsPDF 'Download PDF' button still works unchanged"
    - "A Puppeteer script can generate a print-ready PDF from the command line"
  artifacts:
    - path: "src/index.css"
      provides: "@media print stylesheet with page-break controls, margin reset, orphan/widow rules"
      contains: "@media print"
    - path: "src/report/pdf/PrintPdfService.ts"
      provides: "Print-to-PDF service using window.print() with pre/post print hooks"
      exports: ["printReport"]
    - path: "src/tools/report/ReportCenter.tsx"
      provides: "Updated UI with both Download PDF and Download Print-Ready PDF buttons"
      contains: "Print-Ready PDF"
    - path: "scripts/generate-print-pdf.cjs"
      provides: "Puppeteer script for CI/automated PDF generation"
      contains: "page.pdf"
    - path: "index.html"
      provides: "Google Fonts link for Inter + Source Serif Pro"
      contains: "Source+Serif+4"
  key_links:
    - from: "src/tools/report/ReportCenter.tsx"
      to: "src/report/pdf/PrintPdfService.ts"
      via: "import { printReport }"
      pattern: "printReport"
    - from: "src/index.css"
      to: "src/report/components/ReportPage.tsx"
      via: "@media print rules targeting .report-page-break class"
      pattern: "@media print"
    - from: "index.html"
      to: "src/index.css"
      via: "Google Fonts loaded before CSS renders"
      pattern: "fonts.googleapis.com"
---

<objective>
Add a print-ready PDF pipeline for the AI Briefing report using browser print CSS + Puppeteer.

Purpose: The current jsPDF + html2canvas pipeline produces rasterized pages with poor kerning, no real font embedding, and no CSS page-break control. A print-stylesheet approach gives proper typography, real font embedding (Inter + Source Serif Pro), CSS page-break-before/after controls, and "what you see is what you get" fidelity (browser preview = PDF output). Puppeteer provides automated/CI generation.

Output: Print stylesheet, PrintPdfService module, updated ReportCenter UI with two PDF buttons, Puppeteer automation script, Google Fonts loading.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/tools/report/ReportCenter.tsx
@src/report/pdf/PdfGenerator.ts
@src/report/components/ReportPage.tsx
@src/report/unified/LLMStrategicBriefing.tsx
@src/report/design.ts
@src/index.css
@index.html
@tailwind.config.js
@scripts/generate-pdf.cjs
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Google Fonts and comprehensive @media print stylesheet</name>
  <files>index.html, src/index.css, tailwind.config.js</files>
  <action>
**index.html** — Add Google Fonts link tags in `<head>` (after the existing preconnect tags) to load Inter (400, 600, 700) and Source Serif 4 (400, 600, 700):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

**tailwind.config.js** — Update fontFamily.sans to include the full fallback stack and add a serif family:
```js
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  serif: ['"Source Serif 4"', 'Georgia', 'serif'],
}
```

**src/index.css** — After the existing `@layer base` block, add a comprehensive `@media print` section. This is the core of the print-ready PDF approach:

```css
/* ===== PRINT STYLESHEET ===== */
@media print {
  /* Reset page geometry */
  @page {
    size: A4 portrait;
    margin: 20mm 18mm 20mm 18mm;
  }

  /* Hide app chrome — sidebar, topbar, buttons, scrollbars */
  nav,
  header,
  [data-sidebar],
  .sidebar,
  button,
  [role="navigation"],
  .no-print {
    display: none !important;
  }

  /* Reset body/root for clean print */
  body {
    background: white !important;
    color: #2D3436 !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #root {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }

  /* Typography controls */
  h1, h2, h3, h4, h5, h6 {
    orphans: 3;
    widows: 3;
    page-break-after: avoid;
    break-after: avoid;
  }

  p, li {
    orphans: 3;
    widows: 3;
  }

  /* Images and charts — prevent splitting */
  img, svg, canvas, figure, .chart-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Report page sections — each ReportPage is a full print page */
  #llm-strategic-briefing > div,
  #unified-strategic-briefing > div {
    page-break-before: always;
    break-before: page;
    page-break-inside: avoid;
    break-inside: avoid;
    min-height: 0 !important;
    padding: 0 !important;
  }

  /* First page (cover) — no break before */
  #llm-strategic-briefing > div:first-child,
  #unified-strategic-briefing > div:first-child {
    page-break-before: auto;
    break-before: auto;
  }

  /* Remove min-height: screen constraints that cause blank pages */
  .min-h-screen {
    min-height: 0 !important;
  }

  /* Footer positioning in print — static, not absolute */
  #llm-strategic-briefing footer,
  #unified-strategic-briefing footer {
    position: static !important;
    margin-top: auto;
  }

  /* Remove decorative shadows and transforms */
  .shadow-xl, .shadow-2xl, .shadow-lg, .shadow-sm, .shadow {
    box-shadow: none !important;
  }

  /* Ensure background colors print (for cover page, callouts) */
  .bg-report-navy,
  [style*="background"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Links — show URL for reference */
  a[href]:after {
    content: none; /* Don't show URLs inline — too noisy for reports */
  }

  /* Table handling */
  table, tr, td, th {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  thead {
    display: table-header-group;
  }

  /* Gauge/chart containers */
  .report-chart {
    page-break-inside: avoid;
    break-inside: avoid;
    max-width: 100%;
  }
}

/* Print-specific helper classes (always available, only affect print) */
.print-break-before {
  @media print {
    page-break-before: always;
    break-before: page;
  }
}

.print-break-after {
  @media print {
    page-break-after: always;
    break-after: page;
  }
}

.print-no-break {
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
```

The stylesheet hides all app UI chrome, resets page geometry to A4, forces each report page section (`#llm-strategic-briefing > div`) to start on a new printed page, controls orphans/widows, and ensures backgrounds print correctly.
  </action>
  <verify>
Run `npm run build` to confirm no build errors. Visually inspect `src/index.css` to confirm the @media print block exists and is syntactically correct. Open the app in dev mode, go to Report Center, select Strategic Briefing, use browser Ctrl+P to verify print preview shows clean paginated output with no sidebar/topbar.
  </verify>
  <done>
Google Fonts (Inter + Source Serif 4) load in index.html. The @media print stylesheet in index.css produces clean A4-paginated output when using browser print. App chrome (sidebar, topbar, buttons) is hidden in print. Each report page section gets its own printed page. Orphan/widow controls prevent dangling lines.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create PrintPdfService and add "Download Print-Ready PDF" button to ReportCenter</name>
  <files>src/report/pdf/PrintPdfService.ts, src/report/pdf/index.ts, src/tools/report/ReportCenter.tsx</files>
  <action>
**src/report/pdf/PrintPdfService.ts** — Create a new module that orchestrates browser-based print-to-PDF. This is NOT a replacement for PdfGenerator.ts (which remains untouched as the jsPDF fallback).

```typescript
/**
 * PrintPdfService — Browser print-to-PDF for consulting-grade output.
 *
 * Uses window.print() with the @media print stylesheet to produce PDFs
 * with real font embedding, proper kerning, and CSS page-break controls.
 * This is the "Print-Ready PDF" option alongside the jsPDF fallback.
 */

/** Options for configuring the print operation */
export interface PrintOptions {
  /** CSS selector for the element to print (isolates from app chrome) */
  targetSelector: string;
  /** Optional: title to set on the document during print (appears in PDF metadata) */
  documentTitle?: string;
  /** Callback before print dialog opens — used to prepare the DOM */
  onBeforePrint?: () => void;
  /** Callback after print dialog closes — used to restore the DOM */
  onAfterPrint?: () => void;
}

/**
 * Trigger the browser's print dialog, scoped to a specific report element.
 *
 * The @media print stylesheet in index.css handles:
 * - Hiding app chrome (sidebar, topbar, buttons)
 * - A4 page geometry with proper margins
 * - Page breaks between report sections
 * - Orphan/widow typographic controls
 * - Background color preservation for cover pages and callouts
 *
 * The user's browser "Save as PDF" option produces a PDF with:
 * - Real font embedding (Inter + Source Serif 4 from Google Fonts)
 * - Proper kerning and word spacing (native browser rendering)
 * - CSS page-break-before/after controls
 * - Exact match to browser preview (WYSIWYG)
 */
export function printReport(options: PrintOptions): void {
  const { targetSelector, documentTitle, onBeforePrint, onAfterPrint } = options;

  const target = document.querySelector(targetSelector);
  if (!target) {
    console.error(`[PrintPdfService] Target element not found: ${targetSelector}`);
    return;
  }

  // Save original title
  const originalTitle = document.title;

  // Set print-specific title (shows in PDF metadata)
  if (documentTitle) {
    document.title = documentTitle;
  }

  // Add a class to body that the print stylesheet can use to scope visibility
  document.body.classList.add('printing-report');

  // Mark the target element so only it shows during print
  target.classList.add('print-target');

  // Pre-print callback
  onBeforePrint?.();

  // Inject a temporary style that hides everything except the target in print
  const scopeStyle = document.createElement('style');
  scopeStyle.id = 'print-scope-style';
  scopeStyle.textContent = `
    @media print {
      body > *:not(#root),
      #root > *:not([class*="report"]):not(.print-target-ancestor) {
        display: none !important;
      }

      /* Hide the preview container chrome, show only the report content */
      .print-target {
        position: static !important;
        transform: none !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
      }

      /* Hide scrollable wrapper chrome */
      .print-target-ancestor {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        background: none !important;
      }
    }
  `;
  document.head.appendChild(scopeStyle);

  // Walk up the DOM tree marking ancestors so they remain visible
  let ancestor = target.parentElement;
  const markedAncestors: Element[] = [];
  while (ancestor && ancestor !== document.body) {
    ancestor.classList.add('print-target-ancestor');
    markedAncestors.push(ancestor);
    ancestor = ancestor.parentElement;
  }

  // Use a small delay to let the DOM updates settle, then trigger print
  requestAnimationFrame(() => {
    window.print();

    // Cleanup after print dialog closes (runs synchronously after print on most browsers)
    // Use a timeout as fallback for browsers that return immediately
    const cleanup = () => {
      document.title = originalTitle;
      document.body.classList.remove('printing-report');
      target.classList.remove('print-target');
      markedAncestors.forEach(el => el.classList.remove('print-target-ancestor'));
      scopeStyle.remove();
      onAfterPrint?.();
    };

    // The 'afterprint' event is the reliable way to detect print dialog close
    const handleAfterPrint = () => {
      cleanup();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Fallback: if afterprint never fires (some browsers), clean up after 60s
    setTimeout(() => {
      window.removeEventListener('afterprint', handleAfterPrint);
      cleanup();
    }, 60000);
  });
}
```

**src/report/pdf/index.ts** — If this barrel file exists, add the new export. If it does not exist, create it re-exporting from both PdfGenerator and PrintPdfService. Check the existing file first. The export should be:
```typescript
export { printReport } from './PrintPdfService';
export type { PrintOptions } from './PrintPdfService';
```
Add these exports WITHOUT removing any existing exports from PdfGenerator.ts.

**src/tools/report/ReportCenter.tsx** — Add a second download button alongside the existing one. Changes:

1. Add import at top:
```typescript
import { Printer } from 'lucide-react';
import { printReport } from '@/report/pdf/PrintPdfService';
```

2. Add a `handlePrintPdf` callback (place near `handleDownloadPdf`):
```typescript
const handlePrintPdf = useCallback(() => {
  let targetSelector = '';
  let title = '';

  if (reportMode === 'strategic-briefing') {
    targetSelector = '#unified-strategic-briefing';
    title = `${metadata.name || 'Client'} — Strategic Business Assessment`;
  } else if (reportMode === 'ai-briefing' && llmNarrative) {
    targetSelector = '#llm-strategic-briefing';
    title = `${metadata.name || 'Client'} — AI Strategic Business Assessment`;
  } else if (reportMode === 'individual' && selectedTool) {
    targetSelector = '#report-preview-container';
    const mapping = INDIVIDUAL_REPORT_MAP.find(m => m.toolId === selectedTool);
    title = `${metadata.name || 'Client'} — ${mapping?.label || 'Report'}`;
  }

  if (!targetSelector) return;

  printReport({
    targetSelector,
    documentTitle: title,
  });
}, [reportMode, selectedTool, metadata.name, llmNarrative]);
```

3. Compute `isPrintDisabled` alongside `isDownloadDisabled`:
```typescript
const isPrintDisabled =
  (reportMode === 'individual' && !selectedTool) ||
  (reportMode === 'ai-briefing' && !llmNarrative);
```

4. In the download button section (the `<div className="bg-white rounded-xl border...">` near the bottom of the left panel), add the Print-Ready PDF button ABOVE the existing Download PDF button with a small "Recommended" badge:

```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
  {/* Print-Ready PDF — recommended */}
  <Button
    onClick={handlePrintPdf}
    disabled={isPrintDisabled}
    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
  >
    <Printer className="w-4 h-4 mr-2" />
    Download Print-Ready PDF
  </Button>
  <p className="text-xs text-slate-500 text-center">
    Best quality — uses browser print with real fonts and page breaks
  </p>

  {/* Divider */}
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-200" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-white px-2 text-xs text-slate-400">or</span>
    </div>
  </div>

  {/* Existing jsPDF button — unchanged behavior */}
  <Button
    onClick={handleDownloadPdf}
    disabled={isDownloadDisabled}
    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
  >
    {isGenerating ? (
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    ) : (
      <FileDown className="w-4 h-4 mr-2" />
    )}
    {isGenerating ? 'Generating PDF...' : 'Download PDF (Legacy)'}
  </Button>
  <p className="text-xs text-slate-400 text-center">
    Raster-based fallback via html2canvas + jsPDF
  </p>
</div>
```

**Critical:** Do NOT modify `handleDownloadPdf`, `savePdf`, or any code in `PdfGenerator.ts`. The jsPDF pipeline is preserved exactly as-is.
  </action>
  <verify>
Run `npm run build` — must compile with zero errors. Run `npm run dev`, navigate to Report Center, select Strategic Briefing mode. Verify two buttons appear: green "Download Print-Ready PDF" and indigo "Download PDF (Legacy)". Click "Download Print-Ready PDF" and confirm the browser print dialog opens with the report content visible, app chrome hidden, and pages breaking correctly. Click "Download PDF (Legacy)" and confirm it still works exactly as before. Switch to AI Briefing mode — verify "Download Print-Ready PDF" is disabled until narrative is generated.
  </verify>
  <done>
PrintPdfService.ts exists and exports `printReport()`. ReportCenter shows two download buttons: "Download Print-Ready PDF" (green, recommended, uses window.print()) and "Download PDF (Legacy)" (indigo, jsPDF fallback). Both work. The print dialog shows clean A4 paginated output with Inter + Source Serif 4 fonts, proper page breaks, and no app chrome.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create Puppeteer script for automated print-ready PDF generation</name>
  <files>scripts/generate-print-pdf.cjs</files>
  <action>
Create `scripts/generate-print-pdf.cjs` — a Node.js/Puppeteer script that automates PDF generation from the command line. This is for CI/testing/automated workflows. It uses Puppeteer's `page.pdf()` which invokes the same Chromium print engine that `window.print()` uses, so the output matches the browser print experience.

The script should:

1. Accept optional CLI args: `--url` (default: `http://localhost:5173`), `--report` (default: `ai-briefing`, also accepts `strategic-briefing`), `--output` (default: auto-generated filename in current directory), `--wait` (milliseconds to wait for rendering, default: 5000).

2. Launch Puppeteer in headless mode with a 1280x900 viewport.

3. Navigate to the app URL, wait for `networkidle0`.

4. Navigate to `/tools/report` (Report Center).

5. If `--report=ai-briefing`, click the AI-Powered Briefing mode button. If `--report=strategic-briefing`, it's the default mode.

6. Wait for the report content to render (use `page.waitForSelector('#llm-strategic-briefing', { timeout: 10000 })` or `#unified-strategic-briefing` depending on mode). For AI briefing, the user must have already generated the narrative in the browser before running this script, since it requires an API key.

7. Scroll the preview container to force lazy content to load (`page.evaluate` to set overflow: visible, height: auto on the scroll wrapper).

8. Wait `--wait` ms for charts/fonts to settle.

9. Call `page.pdf()` with:
   - `format: 'A4'`
   - `printBackground: true` (required for cover page navy background, callout backgrounds)
   - `margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' }` (matches @page in print stylesheet)
   - `preferCSSPageSize: true` (honors our @page CSS)
   - `displayHeaderFooter: false`
   - `path: outputPath`

10. Log success and file path. Close browser.

The script must be CommonJS (`.cjs`) to match the existing `scripts/generate-pdf.cjs` pattern in the project. Use `require('puppeteer')`.

Add a helper note at the top of the file:
```
/**
 * generate-print-pdf.cjs — Puppeteer PDF generation for VWCG reports
 *
 * Usage:
 *   node scripts/generate-print-pdf.cjs
 *   node scripts/generate-print-pdf.cjs --report=strategic-briefing
 *   node scripts/generate-print-pdf.cjs --output=./my-report.pdf
 *   node scripts/generate-print-pdf.cjs --url=http://localhost:5174 --wait=8000
 *
 * Prerequisites:
 *   - Dev server running: npm run dev
 *   - For AI Briefing: narrative must be generated in browser first
 *   - puppeteer in devDependencies (already installed)
 */
```

Also add an npm script to package.json: `"pdf:print": "node scripts/generate-print-pdf.cjs"` (add it alongside existing scripts).
  </action>
  <verify>
Start the dev server with `npm run dev`. In a separate terminal, run `node scripts/generate-print-pdf.cjs --report=strategic-briefing`. Verify it produces an A4 PDF file in the current directory with the Strategic Briefing content, proper page breaks, and background colors intact. Check that `npm run pdf:print` also works. Verify `npm run build` still passes (script is not part of the TS build since it's in `scripts/` not `src/`).
  </verify>
  <done>
`scripts/generate-print-pdf.cjs` exists and can generate A4 PDFs via Puppeteer's `page.pdf()`. It accepts `--report`, `--output`, `--url`, and `--wait` CLI args. The `pdf:print` npm script is available. Output matches the browser print stylesheet with proper margins, page breaks, background colors, and font rendering.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes with zero errors
2. Browser print (Ctrl+P) from Report Center shows clean paginated A4 report with no app chrome
3. "Download Print-Ready PDF" button opens browser print dialog with report content
4. "Download PDF (Legacy)" button still generates jsPDF-based PDF identically to before
5. `node scripts/generate-print-pdf.cjs --report=strategic-briefing` produces a valid PDF file
6. Google Fonts (Inter + Source Serif 4) load successfully (check Network tab)
7. No modifications to `src/report/pdf/PdfGenerator.ts` (jsPDF fallback preserved)
</verification>

<success_criteria>
- Two PDF download options visible in Report Center: Print-Ready (recommended) and Legacy (jsPDF)
- Print-Ready PDF output has real font embedding, proper kerning, CSS page-break controls
- Browser preview matches PDF output (WYSIWYG)
- jsPDF pipeline completely untouched and functional
- Puppeteer script available for CLI/CI PDF generation
- All existing tests and builds pass
</success_criteria>

<output>
After completion, create `.planning/quick/3-puppeteer-pdf-service-phase-1-print-styl/3-SUMMARY.md`
</output>
