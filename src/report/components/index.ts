/**
 * Report Components
 *
 * Reusable components for consulting-grade PDF reports.
 * Provides page layouts and typography hierarchy.
 */

export { ReportPage } from './ReportPage';
export type { ReportPageProps, ReportPageVariant } from './ReportPage';

export {
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCaption,
  ReportCallout,
  ReportList,
  ReportTable,
  ReportTableHeader,
  ReportTableRow,
  ReportTableCell,
} from './ReportTypography';

export type {
  ReportTypographyProps,
  ReportListProps,
  ReportTableProps,
  ReportTableHeaderProps,
  ReportTableRowProps,
  ReportTableCellProps,
} from './ReportTypography';
