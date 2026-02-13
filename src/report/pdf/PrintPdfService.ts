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
  /** Callback before print dialog opens */
  onBeforePrint?: () => void;
  /** Callback after print dialog closes */
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

  // Add a class to body for print scoping
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
      body > *:not(#root) {
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

    // Cleanup function
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
