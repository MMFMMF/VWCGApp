import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

export type ReportPageVariant = 'standard' | 'data' | 'callout' | 'cover';

export interface ReportPageProps {
  variant?: ReportPageVariant;
  children: ReactNode;
  pageNumber?: number;
  className?: string;
}

/**
 * ReportPage - Base page layout for reports
 *
 * Provides consistent page structure with variants:
 * - standard: 1-inch margins, 6.5-inch max text width, left-aligned
 * - data: Two-column layout support
 * - callout: Large pull-quote area at top
 * - cover: Navy background, centered white text
 *
 * Footer is handled by Puppeteer's footerTemplate during PDF generation.
 */
export function ReportPage({
  variant = 'standard',
  children,
  pageNumber: _pageNumber,
  className,
}: ReportPageProps) {
  // Cover page variant
  if (variant === 'cover') {
    return (
      <div
        className={cn(
          'relative min-h-screen bg-report-navy text-white flex flex-col items-center justify-center p-16',
          className
        )}
      >
        <div className="max-w-3xl text-center space-y-8">
          {children}
        </div>
      </div>
    );
  }

  // Standard, data, and callout variants
  return (
    <div
      className={cn(
        'relative min-h-screen bg-white print:min-h-0',
        className
      )}
    >
      {/* Main content area with 1-inch margins */}
      <div
        className={cn(
          'mx-auto px-16 py-16',
          variant === 'standard' && 'max-w-4xl',
          variant === 'data' && 'max-w-6xl',
          variant === 'callout' && 'max-w-4xl'
        )}
      >
        {/* Callout variant: pull-quote area at top */}
        {variant === 'callout' && (
          <div className="mb-12 pb-8 border-l-4 border-report-blue pl-6">
            {children}
          </div>
        )}

        {/* Standard and data variants: regular content */}
        {variant !== 'callout' && (
          <div
            className={cn(
              variant === 'data' && 'grid grid-cols-2 gap-8'
            )}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
