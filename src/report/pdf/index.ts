/**
 * PDF Generation — Public API
 *
 * Re-exports the high-quality PDF generator for use by the Report Center
 * and any other consumer that needs to produce branded VWCG PDF documents.
 */

// Legacy jsPDF pipeline (raster-based via html2canvas)
export {
  generateReportPdf,
  savePdf,
  buildPdfFileName,
} from './PdfGenerator';

export type {
  PdfOptions,
  PdfResult,
  ReportType,
} from './PdfGenerator';

// Print-ready pipeline (browser print with real fonts + CSS page breaks)
export { printReport } from './PrintPdfService';
export type { PrintOptions } from './PrintPdfService';
