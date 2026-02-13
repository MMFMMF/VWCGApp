import { cn } from '@/utils/cn';
import { REPORT_COLORS } from '../design';

export interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  maxValue?: number;
  className?: string;
}

/**
 * ProgressBar - Shows current vs target with gap visualization
 *
 * Current shown as filled bar, target as outlined/dashed.
 * Gap highlighted in amber/red based on severity.
 * Used for Leadership DNA dimension gaps.
 */
export function ProgressBar({
  current,
  target,
  label,
  maxValue = 100,
  className,
}: ProgressBarProps) {
  const currentPercent = (current / maxValue) * 100;
  const targetPercent = (target / maxValue) * 100;
  const gap = target - current;
  const gapPercent = Math.abs((gap / maxValue) * 100);

  // Determine gap severity color
  const gapSeverity = Math.abs(gap) > maxValue * 0.2 ? 'critical' : 'moderate';
  const gapColor = gap > 0
    ? (gapSeverity === 'critical' ? REPORT_COLORS.red : REPORT_COLORS.amber)
    : REPORT_COLORS.green;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and values */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-report-charcoal">{label}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-report-blue font-semibold">
            Current: {current}
          </span>
          <span className="text-report-gray">
            Target: {target}
          </span>
          {gap !== 0 && (
            <span
              className="font-semibold"
              style={{ color: gapColor }}
            >
              Gap: {gap > 0 ? '+' : ''}{gap}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar visualization */}
      <div className="relative h-6">
        {/* Background track */}
        <div className="absolute inset-0 bg-report-warm rounded-sm" />

        {/* Current progress (filled) */}
        <div
          className="absolute top-0 left-0 h-full rounded-sm transition-all duration-300"
          style={{
            width: `${Math.min(currentPercent, 100)}%`,
            backgroundColor: REPORT_COLORS.blue,
          }}
        />

        {/* Gap indicator (between current and target) */}
        {gap !== 0 && (
          <div
            className="absolute top-0 h-full opacity-30 transition-all duration-300"
            style={{
              left: `${Math.min(currentPercent, targetPercent)}%`,
              width: `${Math.min(gapPercent, 100 - Math.min(currentPercent, targetPercent))}%`,
              backgroundColor: gapColor,
            }}
          />
        )}

        {/* Target marker (dashed outline) */}
        <div
          className="absolute top-0 h-full border-2 border-dashed rounded-sm transition-all duration-300 pointer-events-none"
          style={{
            left: 0,
            width: `${Math.min(targetPercent, 100)}%`,
            borderColor: REPORT_COLORS.navy,
          }}
        />

        {/* Target label indicator */}
        {targetPercent <= 100 && (
          <div
            className="absolute top-0 -translate-x-1/2 h-full w-0.5 bg-report-navy transition-all duration-300"
            style={{ left: `${targetPercent}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-report-navy" />
          </div>
        )}
      </div>
    </div>
  );
}
