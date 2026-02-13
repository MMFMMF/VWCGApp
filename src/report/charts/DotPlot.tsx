import { cn } from '@/utils/cn';
import { REPORT_COLORS, CHART_DEFAULTS } from '../design';

export interface DotPlotBenchmark {
  value: number;
  label: string;
}

export interface DotPlotProps {
  value: number;
  min: number;
  max: number;
  benchmarks?: DotPlotBenchmark[];
  label: string;
  className?: string;
}

/**
 * DotPlot - Shows where client falls on a range
 *
 * Displays a horizontal range with the client's position as a dot.
 * Benchmark positions shown as markers.
 * Used for benchmarking context pages.
 */
export function DotPlot({
  value,
  min,
  max,
  benchmarks = [],
  label,
  className,
}: DotPlotProps) {
  const range = max - min;
  const getPosition = (val: number) => ((val - min) / range) * 100;
  const clientPosition = getPosition(value);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-report-charcoal">{label}</span>
        <span className="text-sm font-semibold text-report-blue">
          {value.toFixed(1)}
        </span>
      </div>

      {/* Dot plot visualization */}
      <div className="relative" style={{ height: `${CHART_DEFAULTS.dotPlot.height}px` }}>
        {/* Horizontal range line */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-report-gray"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />

        {/* Min/Max labels */}
        <div className="absolute left-0 bottom-0 text-xs text-report-gray">
          {min}
        </div>
        <div className="absolute right-0 bottom-0 text-xs text-report-gray">
          {max}
        </div>

        {/* Benchmark markers */}
        {benchmarks.map((benchmark, index) => {
          const position = getPosition(benchmark.value);
          if (position < 0 || position > 100) return null;

          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Benchmark marker */}
              <div className="relative">
                <div
                  className="w-2 h-6 bg-report-gray opacity-50"
                  style={{ marginLeft: '-4px' }}
                />
                {/* Benchmark label */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs text-report-gray">
                    {benchmark.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Client position dot */}
        {clientPosition >= 0 && clientPosition <= 100 && (
          <div
            className="absolute"
            style={{
              left: `${clientPosition}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Dot */}
            <div
              className="rounded-full border-2 border-white shadow-lg"
              style={{
                width: `${CHART_DEFAULTS.dotPlot.dotSize}px`,
                height: `${CHART_DEFAULTS.dotPlot.dotSize}px`,
                backgroundColor: REPORT_COLORS.blue,
              }}
            />
            {/* Value label above dot */}
            <div
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ top: `-${CHART_DEFAULTS.dotPlot.dotSize + 16}px` }}
            >
              <span className="text-xs font-semibold text-report-blue">
                You: {value.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
