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
 * Minimum percentage-point spacing between label centers before they're
 * considered overlapping. 12% of the axis ≈ 70px on a typical ~600px chart.
 */
const MIN_LABEL_SPACING_PCT = 14;

/** Extra vertical offset (px) applied to a label that would otherwise overlap. */
const OVERLAP_OFFSET_PX = 20;

interface PlottedLabel {
  position: number; // % along axis
  type: 'user' | 'benchmark';
  yOffset: number;  // additional vertical offset in px (negative = higher)
}

/**
 * Detect overlapping labels and offset them vertically.
 *
 * Multi-pass resolution with alternating up/down offsets and origIdx tracking
 * for correct mapping back to benchmark order.
 */
function resolveOverlaps(
  clientPosition: number,
  benchmarkPositions: number[],
): { userOffset: number; benchmarkOffsets: number[] } {
  // Collect all labels sorted by x-position, tracking original index
  const labels: (PlottedLabel & { origIdx: number })[] = [
    { position: clientPosition, type: 'user', yOffset: 0, origIdx: -1 },
    ...benchmarkPositions.map((p, i) => ({
      position: p,
      type: 'benchmark' as const,
      yOffset: 0,
      origIdx: i,
    })),
  ];
  labels.sort((a, b) => a.position - b.position);

  // Multi-pass: resolve overlaps until stable (max 5 passes)
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (let i = 1; i < labels.length; i++) {
      if (Math.abs(labels[i].position - labels[i - 1].position) < MIN_LABEL_SPACING_PCT
          && labels[i].yOffset === labels[i - 1].yOffset) {
        // Alternate direction: even conflicts go up, odd go down
        const direction = (i % 2 === 0) ? 1 : -1;
        // Prefer moving benchmark labels; move user label only as fallback
        if (labels[i].type === 'benchmark') {
          labels[i].yOffset = direction * OVERLAP_OFFSET_PX;
        } else if (labels[i - 1].type === 'benchmark') {
          labels[i - 1].yOffset = direction * OVERLAP_OFFSET_PX;
        } else {
          labels[i].yOffset = direction * OVERLAP_OFFSET_PX;
        }
        changed = true;
      }
    }
    if (!changed) break;
  }

  const userLabel = labels.find((l) => l.type === 'user')!;
  const benchmarkOffsets = benchmarkPositions.map((_, i) => {
    const match = labels.find((l) => l.origIdx === i);
    return match?.yOffset ?? 0;
  });

  return { userOffset: userLabel.yOffset, benchmarkOffsets };
}

/**
 * DotPlot - Shows where client falls on a range
 *
 * Displays a horizontal range with the client's position as a dot.
 * Benchmark positions shown as markers.
 * Used for benchmarking context pages.
 *
 * Labels are automatically offset vertically when they would overlap.
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

  // Pre-compute overlap offsets
  const benchmarkPositions = benchmarks.map((b) => getPosition(b.value));
  const { userOffset, benchmarkOffsets } = resolveOverlaps(
    clientPosition,
    benchmarkPositions,
  );

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
          const position = benchmarkPositions[index];
          if (position < 0 || position > 100) return null;
          const extraOffset = benchmarkOffsets[index];

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
                {/* Benchmark label — offset vertically when overlapping */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ top: `${-24 + extraOffset}px` }}
                >
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
            {/* Value label above dot — offset vertically when overlapping */}
            <div
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ top: `${-(CHART_DEFAULTS.dotPlot.dotSize + 16) + userOffset}px` }}
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
