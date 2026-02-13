import { cn } from '@/utils/cn';
import { REPORT_COLORS, CHART_DEFAULTS } from '../design';

export interface HorizontalBarItem {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export interface HorizontalBarProps {
  items: HorizontalBarItem[];
  title: string;
  interpretation?: string;
  className?: string;
}

/**
 * HorizontalBar - Reusable horizontal bar chart for reports
 *
 * Displays data as horizontal bars with labels and values.
 * Uses navy/blue palette with optional custom colors.
 * Title renders as insight statement, not metric name.
 */
export function HorizontalBar({ items, title, interpretation, className }: HorizontalBarProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Title as insight statement */}
      <h3 className="text-lg font-semibold text-report-navy leading-tight">
        {title}
      </h3>

      {/* Bar chart */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const percentage = (item.value / item.maxValue) * 100;
          const barColor = item.color || REPORT_COLORS.blue;

          return (
            <div key={index} className="flex items-center gap-3">
              {/* Label */}
              <div
                className="text-sm text-report-charcoal font-medium flex-shrink-0"
                style={{ width: `${CHART_DEFAULTS.bar.labelWidth}px` }}
              >
                {item.label}
              </div>

              {/* Bar container */}
              <div className="flex-1 relative">
                <div className="h-8 bg-report-warm rounded-sm overflow-hidden">
                  {/* Filled bar */}
                  <div
                    className="h-full transition-all duration-300 flex items-center justify-end px-2"
                    style={{
                      width: `${Math.max(percentage, 0)}%`,
                      backgroundColor: barColor,
                    }}
                  >
                    {/* Value label on bar */}
                    {percentage > 15 && (
                      <span className="text-xs font-semibold text-white">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>

                {/* Value label outside bar (for small percentages) */}
                {percentage <= 15 && (
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold"
                    style={{ color: barColor }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interpretation paragraph */}
      {interpretation && (
        <p className="text-sm text-report-charcoal leading-relaxed pt-2 border-t border-report-warm">
          {interpretation}
        </p>
      )}
    </div>
  );
}
