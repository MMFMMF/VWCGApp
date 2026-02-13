import { cn } from '@/utils/cn';
import { REPORT_COLORS, CHART_DEFAULTS } from '../design';

export interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  sublabel?: string;
  variant?: 'semicircle' | 'linear';
  className?: string;
}

/**
 * Gauge - Simple gauge for headline metrics
 *
 * A clean, minimal gauge in semi-circular or linear form.
 * Use once per page maximum for headline metrics.
 * Authority aesthetic with navy/blue palette.
 */
export function Gauge({
  value,
  maxValue,
  label,
  sublabel,
  variant = 'semicircle',
  className,
}: GaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  if (variant === 'linear') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Labels */}
        <div className="text-center">
          <div className="text-4xl font-bold text-report-navy">
            {value.toFixed(0)}
            <span className="text-2xl text-report-gray">/{maxValue}</span>
          </div>
          <div className="text-sm font-semibold text-report-charcoal mt-1">
            {label}
          </div>
          {sublabel && (
            <div className="text-xs text-report-gray mt-0.5">
              {sublabel}
            </div>
          )}
        </div>

        {/* Linear progress bar */}
        <div className="relative h-3 bg-report-warm rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: REPORT_COLORS.blue,
            }}
          />
        </div>

        {/* Percentage label */}
        <div className="text-center text-sm font-semibold text-report-blue">
          {percentage.toFixed(0)}%
        </div>
      </div>
    );
  }

  // Semicircle variant
  const circumference = Math.PI * CHART_DEFAULTS.gauge.width * 0.8;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* SVG Semicircle Gauge */}
      <svg
        width={CHART_DEFAULTS.gauge.width}
        height={CHART_DEFAULTS.gauge.height}
        viewBox={`0 0 ${CHART_DEFAULTS.gauge.width} ${CHART_DEFAULTS.gauge.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${CHART_DEFAULTS.gauge.width * 0.1} ${CHART_DEFAULTS.gauge.height * 0.9}
             A ${CHART_DEFAULTS.gauge.width * 0.4} ${CHART_DEFAULTS.gauge.width * 0.4} 0 0 1
             ${CHART_DEFAULTS.gauge.width * 0.9} ${CHART_DEFAULTS.gauge.height * 0.9}`}
          fill="none"
          stroke={REPORT_COLORS.warm}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={`M ${CHART_DEFAULTS.gauge.width * 0.1} ${CHART_DEFAULTS.gauge.height * 0.9}
             A ${CHART_DEFAULTS.gauge.width * 0.4} ${CHART_DEFAULTS.gauge.width * 0.4} 0 0 1
             ${CHART_DEFAULTS.gauge.width * 0.9} ${CHART_DEFAULTS.gauge.height * 0.9}`}
          fill="none"
          stroke={REPORT_COLORS.blue}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />

        {/* Center value text */}
        <text
          x={CHART_DEFAULTS.gauge.width / 2}
          y={CHART_DEFAULTS.gauge.height * 0.7}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={REPORT_COLORS.navy}
        >
          {value.toFixed(0)}
        </text>

        {/* Max value text */}
        <text
          x={CHART_DEFAULTS.gauge.width / 2}
          y={CHART_DEFAULTS.gauge.height * 0.85}
          textAnchor="middle"
          className="text-sm"
          fill={REPORT_COLORS.gray}
        >
          of {maxValue}
        </text>
      </svg>

      {/* Labels */}
      <div className="text-center mt-2">
        <div className="text-sm font-semibold text-report-charcoal">
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-report-gray mt-0.5">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
