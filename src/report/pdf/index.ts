/**
 * PDF Generation — Public API
 *
 * Re-exports the high-quality PDF generator for use by the Report Center
 * and any other consumer that needs to produce branded VWCG PDF documents.
 */

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
