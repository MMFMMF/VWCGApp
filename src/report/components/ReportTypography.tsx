import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

export interface ReportTypographyProps {
  children: ReactNode;
  className?: string;
}

/**
 * ReportHero - 48-64pt hero numbers
 *
 * Large headline numbers for executive summary pages.
 * Used sparingly for maximum impact.
 */
export function ReportHero({ children, className }: ReportTypographyProps) {
  return (
    <div
      className={cn(
        'text-6xl font-bold text-report-navy leading-tight',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ReportSectionTitle - 24pt bold section titles
 *
 * Primary section headers. Navy color for authority.
 */
export function ReportSectionTitle({ children, className }: ReportTypographyProps) {
  return (
    <h2
      className={cn(
        'text-2xl font-bold text-report-navy leading-tight mb-4',
        className
      )}
    >
      {children}
    </h2>
  );
}

/**
 * ReportSubsection - 18pt semibold subsection titles
 *
 * Secondary headers within sections.
 */
export function ReportSubsection({ children, className }: ReportTypographyProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-report-charcoal leading-tight mb-3',
        className
      )}
    >
      {children}
    </h3>
  );
}

/**
 * ReportBody - 11-12pt body narrative
 *
 * Main text content. Charcoal for readability.
 * Relaxed line height for comfortable reading.
 */
export function ReportBody({ children, className }: ReportTypographyProps) {
  return (
    <p
      className={cn(
        'text-sm text-report-charcoal leading-relaxed',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * ReportCaption - 9-10pt captions/labels
 *
 * Small text for chart labels, footnotes, metadata.
 */
export function ReportCaption({ children, className }: ReportTypographyProps) {
  return (
    <span
      className={cn(
        'text-xs text-report-gray leading-normal',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * ReportCallout - 16pt callout text with left accent border
 *
 * Highlighted insights or pull quotes.
 * Blue accent border for visual emphasis.
 */
export function ReportCallout({ children, className }: ReportTypographyProps) {
  return (
    <blockquote
      className={cn(
        'text-base font-semibold text-report-charcoal leading-relaxed pl-6 border-l-4 border-report-blue py-2',
        className
      )}
    >
      {children}
    </blockquote>
  );
}

/**
 * ReportList - Styled list container
 *
 * Maintains consistent spacing and styling for lists.
 */
export interface ReportListProps {
  children: ReactNode;
  variant?: 'bullet' | 'number';
  className?: string;
}

export function ReportList({ children, variant = 'bullet', className }: ReportListProps) {
  const Component = variant === 'number' ? 'ol' : 'ul';

  return (
    <Component
      className={cn(
        'text-sm text-report-charcoal leading-relaxed space-y-2',
        variant === 'bullet' && 'list-disc list-inside',
        variant === 'number' && 'list-decimal list-inside',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * ReportTable - Clean table styling
 *
 * Minimal table design with header emphasis.
 */
export interface ReportTableProps {
  children: ReactNode;
  className?: string;
}

export function ReportTable({ children, className }: ReportTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

export interface ReportTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ReportTableHeader({ children, className }: ReportTableHeaderProps) {
  return (
    <thead className={cn('bg-report-navy text-white', className)}>
      {children}
    </thead>
  );
}

export interface ReportTableRowProps {
  children: ReactNode;
  variant?: 'default' | 'alternate';
  className?: string;
}

export function ReportTableRow({ children, variant = 'default', className }: ReportTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-report-warm',
        variant === 'alternate' && 'bg-report-warm/30',
        className
      )}
    >
      {children}
    </tr>
  );
}

export interface ReportTableCellProps {
  children: ReactNode;
  header?: boolean;
  className?: string;
}

export function ReportTableCell({ children, header = false, className }: ReportTableCellProps) {
  const Component = header ? 'th' : 'td';

  return (
    <Component
      className={cn(
        'px-4 py-2 text-left text-sm',
        header && 'font-semibold',
        !header && 'text-report-charcoal',
        className
      )}
    >
      {children}
    </Component>
  );
}
