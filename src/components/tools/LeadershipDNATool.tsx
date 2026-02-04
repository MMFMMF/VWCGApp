import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
  SliderInput,
  TextArea,
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Each dimension has current and target values
interface DimensionScore {
  current: number;
  target: number;
}

interface LeadershipDNAData {
  vision: DimensionScore;
  execution: DimensionScore;
  empowerment: DimensionScore;
  decisiveness: DimensionScore;
  adaptability: DimensionScore;
  integrity: DimensionScore;
  notes: string;
  lastUpdated: number;
}

const defaultScore: DimensionScore = { current: 5, target: 8 };

const defaultData: LeadershipDNAData = {
  vision: { ...defaultScore },
  execution: { ...defaultScore },
  empowerment: { ...defaultScore },
  decisiveness: { ...defaultScore },
  adaptability: { ...defaultScore },
  integrity: { ...defaultScore },
  notes: '',
  lastUpdated: Date.now()
};

const dimensions = [
  {
    key: 'vision',
    label: 'Vision',
    description: 'Ability to define and communicate a compelling future state'
  },
  {
    key: 'execution',
    label: 'Execution',
    description: 'Effectiveness in translating strategy into action and results'
  },
  {
    key: 'empowerment',
    label: 'Empowerment',
    description: 'Capacity to delegate, develop others, and build capable teams'
  },
  {
    key: 'decisiveness',
    label: 'Decisiveness',
    description: 'Speed and quality of decision-making under uncertainty'
  },
  {
    key: 'adaptability',
    label: 'Adaptability',
    description: 'Flexibility and resilience in response to change'
  },
  {
    key: 'integrity',
    label: 'Integrity',
    description: 'Consistency between values, words, and actions'
  }
] as const;

type DimensionKey = typeof dimensions[number]['key'];

export default function LeadershipDNATool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<LeadershipDNAData>(
    (data as LeadershipDNAData) || defaultData
  );

  useEffect(() => {
    if (data) setFormData(data as LeadershipDNAData);
  }, [data]);

  const handleDimensionChange = (
    dimension: DimensionKey,
    type: 'current' | 'target',
    value: number
  ) => {
    const updated = {
      ...formData,
      [dimension]: { ...formData[dimension], [type]: value },
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const handleNotesChange = (notes: string) => {
    const updated = { ...formData, notes, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate overall scores
  const { currentAvg, targetAvg, gapAvg } = useMemo(() => {
    const currents = dimensions.map(d => formData[d.key].current);
    const targets = dimensions.map(d => formData[d.key].target);
    const gaps = dimensions.map(d => formData[d.key].target - formData[d.key].current);

    return {
      currentAvg: Math.round(currents.reduce((a, b) => a + b, 0) / currents.length * 10) / 10,
      targetAvg: Math.round(targets.reduce((a, b) => a + b, 0) / targets.length * 10) / 10,
      gapAvg: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length * 10) / 10
    };
  }, [formData]);

  // Radar chart data with both current and target
  const chartData = useMemo(() =>
    dimensions.map(d => ({
      dimension: d.label,
      current: formData[d.key].current,
      target: formData[d.key].target,
      fullMark: 10
    })),
    [formData]
  );

  const getGapAssessment = (gap: number) => {
    if (gap <= 1) return { label: 'Aligned', variant: 'success' as const };
    if (gap <= 2) return { label: 'Small Gap', variant: 'success' as const };
    if (gap <= 3) return { label: 'Moderate Gap', variant: 'warning' as const };
    return { label: 'Significant Gap', variant: 'danger' as const };
  };

  return (
    <div className="space-y-6">
      {/* Summary Card with Dual-Layer Radar */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Leadership DNA Profile</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{currentAvg}</div>
                <div className="text-xs text-gray-600">Current</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{targetAvg}</div>
                <div className="text-xs text-gray-600">Target</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{gapAvg}</div>
                <div className="text-xs text-gray-600">Gap</div>
              </div>
            </div>

            <Badge variant={getGapAssessment(gapAvg).variant}>
              {getGapAssessment(gapAvg).label}
            </Badge>

            <p className="text-sm text-gray-600 mt-4">
              Compare your current leadership capabilities against your aspirational targets
              to identify development priorities.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeDasharray="5 5"
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Dimension Controls - Current & Target side by side */}
      <Card>
        <CardHeader>
          <CardTitle>Leadership Dimensions</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-600 mb-6">
          Rate each dimension on a scale of 0-10. Set both your current capability
          level and your target aspiration.
        </p>

        <div className="space-y-8">
          {dimensions.map(dim => (
            <div key={dim.key} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900">{dim.label}</h4>
                <p className="text-sm text-gray-500">{dim.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <SliderInput
                  label="Current Level"
                  value={formData[dim.key].current}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(v) => handleDimensionChange(dim.key, 'current', v)}
                  disabled={readonly}
                />
                <SliderInput
                  label="Target Level"
                  value={formData[dim.key].target}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(v) => handleDimensionChange(dim.key, 'target', v)}
                  disabled={readonly}
                />
              </div>

              {/* Gap indicator */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">Gap:</span>
                <Badge
                  variant={getGapAssessment(formData[dim.key].target - formData[dim.key].current).variant}
                  size="sm"
                >
                  {formData[dim.key].target - formData[dim.key].current > 0 ? '+' : ''}
                  {formData[dim.key].target - formData[dim.key].current}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Development Notes</CardTitle>
        </CardHeader>
        <TextArea
          label=""
          value={formData.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Document your leadership development priorities, specific situations where you want to grow, or feedback you've received..."
          rows={4}
          disabled={readonly}
        />
      </Card>

      {/* Actions */}
      {!readonly && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => {
            setFormData(defaultData);
            onUpdate?.(defaultData);
          }}>
            Reset
          </Button>
          <Button variant="primary" onClick={() => onUpdate?.(formData)}>
            Save Assessment
          </Button>
        </div>
      )}
    </div>
  );
}

// Validation
export function validateLeadershipDNA(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as LeadershipDNAData;

  dimensions.forEach(dim => {
    const score = d[dim.key];
    if (score.current < 0 || score.current > 10) {
      errors.push(`${dim.label} current must be 0-10`);
    }
    if (score.target < 0 || score.target > 10) {
      errors.push(`${dim.label} target must be 0-10`);
    }
    if (score.target < score.current) {
      warnings.push(`${dim.label}: Target is lower than current - is this intentional?`);
    }
  });

  // Check for unrealistic targets
  const allTargets10 = dimensions.every(dim => d[dim.key].target === 10);
  if (allTargets10) {
    warnings.push('All targets at maximum - consider prioritizing specific areas');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportLeadershipDNAToPDF(data: unknown): PDFSection {
  const d = data as LeadershipDNAData;

  const avgCurrent = Math.round(
    dimensions.reduce((acc, dim) => acc + d[dim.key].current, 0) / dimensions.length * 10
  ) / 10;

  const avgTarget = Math.round(
    dimensions.reduce((acc, dim) => acc + d[dim.key].target, 0) / dimensions.length * 10
  ) / 10;

  return {
    title: 'Leadership DNA Assessment',
    summary: `Current Average: ${avgCurrent}/10 | Target Average: ${avgTarget}/10 | Gap: ${Math.round((avgTarget - avgCurrent) * 10) / 10}`,
    charts: [{
      type: 'radar',
      data: dimensions.map(dim => ({
        label: dim.label,
        value: d[dim.key].current,
        target: d[dim.key].target
      }))
    }],
    tables: [{
      headers: ['Dimension', 'Current', 'Target', 'Gap', 'Priority'],
      rows: dimensions
        .map(dim => ({
          label: dim.label,
          current: d[dim.key].current,
          target: d[dim.key].target,
          gap: d[dim.key].target - d[dim.key].current
        }))
        .sort((a, b) => b.gap - a.gap)
        .map(row => [
          row.label,
          `${row.current}/10`,
          `${row.target}/10`,
          `+${row.gap}`,
          row.gap >= 3 ? 'High' : row.gap >= 2 ? 'Medium' : 'Low'
        ])
    }],
    insights: [
      `Average gap of ${Math.round((avgTarget - avgCurrent) * 10) / 10} points across all dimensions`,
      ...dimensions
        .filter(dim => d[dim.key].target - d[dim.key].current >= 3)
        .map(dim => `${dim.label} identified as priority development area`),
      d.notes ? `Notes: ${d.notes}` : undefined
    ].filter(Boolean) as string[],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'leadership-dna',
    name: 'Leadership DNA',
    description: 'Assess your leadership capabilities across 6 dimensions with current vs target analysis',
    category: 'assessment',
    order: 2,
    estimatedTime: 15
  },
  component: LeadershipDNATool,
  validate: validateLeadershipDNA,
  exportToPDF: exportLeadershipDNAToPDF,
  getDefaultData: () => defaultData
});
