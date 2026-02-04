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
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Single assessment entry
interface EQEntry {
  id: string;
  date: string;
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  intuition: number;
  notes: string;
}

interface BusinessEQData {
  entries: EQEntry[];
  lastUpdated: number;
}

const dimensions = [
  { key: 'selfAwareness', label: 'Self Awareness', description: 'Recognition of own emotions and their impact on decisions' },
  { key: 'selfRegulation', label: 'Self Regulation', description: 'Managing emotional reactions and maintaining composure' },
  { key: 'motivation', label: 'Motivation', description: 'Internal drive and resilience in pursuing goals' },
  { key: 'empathy', label: 'Empathy', description: 'Understanding and considering others\' perspectives' },
  { key: 'socialSkills', label: 'Social Skills', description: 'Building relationships and navigating interpersonal dynamics' },
  { key: 'intuition', label: 'Intuition', description: 'Trusting instincts informed by experience and pattern recognition' }
] as const;

type DimensionKey = typeof dimensions[number]['key'];

const createEmptyEntry = (): EQEntry => ({
  id: Date.now().toString(),
  date: new Date().toISOString().split('T')[0],
  selfAwareness: 50,
  selfRegulation: 50,
  motivation: 50,
  empathy: 50,
  socialSkills: 50,
  intuition: 50,
  notes: ''
});

const defaultData: BusinessEQData = {
  entries: [createEmptyEntry()],
  lastUpdated: Date.now()
};

export default function BusinessEQTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<BusinessEQData>(
    (data as BusinessEQData) || defaultData
  );
  const [activeEntryIndex, setActiveEntryIndex] = useState(
    formData.entries.length - 1
  );

  useEffect(() => {
    if (data) {
      const d = data as BusinessEQData;
      setFormData(d);
      setActiveEntryIndex(d.entries.length - 1);
    }
  }, [data]);

  const activeEntry = formData.entries[activeEntryIndex] || formData.entries[formData.entries.length - 1];

  const handleDimensionChange = (dimension: DimensionKey, value: number) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[activeEntryIndex] = {
      ...activeEntry,
      [dimension]: value
    };
    const updated = { entries: updatedEntries, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const handleNotesChange = (notes: string) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[activeEntryIndex] = { ...activeEntry, notes };
    const updated = { entries: updatedEntries, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const handleDateChange = (date: string) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[activeEntryIndex] = { ...activeEntry, date };
    const updated = { entries: updatedEntries, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const addNewEntry = () => {
    const newEntry = createEmptyEntry();
    const updated = {
      entries: [...formData.entries, newEntry],
      lastUpdated: Date.now()
    };
    setFormData(updated);
    setActiveEntryIndex(updated.entries.length - 1);
    onUpdate?.(updated);
  };

  const deleteEntry = (index: number) => {
    if (formData.entries.length <= 1) return;
    const updatedEntries = formData.entries.filter((_, i) => i !== index);
    const updated = { entries: updatedEntries, lastUpdated: Date.now() };
    setFormData(updated);
    setActiveEntryIndex(Math.min(activeEntryIndex, updatedEntries.length - 1));
    onUpdate?.(updated);
  };

  // Calculate current entry score
  const currentScore = useMemo(() => {
    const sum = dimensions.reduce((acc, d) => acc + (activeEntry[d.key] as number), 0);
    return Math.round(sum / dimensions.length);
  }, [activeEntry]);

  // Radar chart data for current entry
  const radarData = useMemo(() =>
    dimensions.map(d => ({
      dimension: d.label.replace(' ', '\n'),
      value: activeEntry[d.key] as number,
      fullMark: 100
    })),
    [activeEntry]
  );

  // Trend data for line chart
  const trendData = useMemo(() => {
    return formData.entries
      .map(entry => ({
        date: entry.date,
        average: Math.round(
          dimensions.reduce((acc, d) => acc + (entry[d.key] as number), 0) / dimensions.length
        ),
        ...dimensions.reduce((acc, d) => ({ ...acc, [d.key]: entry[d.key] }), {})
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [formData.entries]);

  const getEQLevel = (score: number) => {
    if (score >= 80) return { label: 'Exceptional', variant: 'success' as const };
    if (score >= 60) return { label: 'Strong', variant: 'success' as const };
    if (score >= 40) return { label: 'Developing', variant: 'warning' as const };
    return { label: 'Emerging', variant: 'warning' as const };
  };

  const level = getEQLevel(currentScore);

  return (
    <div className="space-y-6">
      {/* Entry Selector */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Assessment Entries</h3>
            <p className="text-sm text-gray-500">
              Track your emotional intelligence over time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeEntryIndex}
              onChange={(e) => setActiveEntryIndex(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm"
              disabled={readonly}
            >
              {formData.entries.map((entry, i) => (
                <option key={entry.id} value={i}>
                  {new Date(entry.date).toLocaleDateString()}
                </option>
              ))}
            </select>

            {!readonly && (
              <Button variant="primary" size="sm" onClick={addNewEntry}>
                + New Entry
              </Button>
            )}
          </div>
        </div>

        {/* Entry date editor */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm text-gray-600">Assessment Date:</label>
          <input
            type="date"
            value={activeEntry.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-md border-gray-300 text-sm"
            disabled={readonly}
          />

          {formData.entries.length > 1 && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteEntry(activeEntryIndex)}
              className="text-red-600 hover:text-red-700"
            >
              Delete Entry
            </Button>
          )}
        </div>
      </Card>

      {/* Summary with Radar and Overall Score */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Business EQ Score</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold">{currentScore}%</span>
              <Badge variant={level.variant}>{level.label}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Your emotional intelligence in business contexts, covering self-awareness,
              regulation, and interpersonal dynamics.
            </p>

            {formData.entries.length > 1 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  📊 {formData.entries.length} entries tracked over time
                </span>
              </div>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 10 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="EQ Score"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Trend Chart (show if multiple entries) */}
      {formData.entries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>EQ Trend Over Time</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Overall EQ"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Dimension Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>EQ Dimensions</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          {dimensions.map(dim => (
            <SliderInput
              key={dim.key}
              label={dim.label}
              description={dim.description}
              value={activeEntry[dim.key] as number}
              min={0}
              max={100}
              step={5}
              onChange={(v) => handleDimensionChange(dim.key, v)}
              disabled={readonly}
            />
          ))}
        </div>
      </Card>

      {/* Notes for this entry */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Notes</CardTitle>
        </CardHeader>
        <TextArea
          label=""
          value={activeEntry.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="What prompted this assessment? Any specific situations or feedback that influenced your scores?"
          rows={4}
          disabled={readonly}
        />
      </Card>

      {/* Actions */}
      {!readonly && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => {
            setFormData(defaultData);
            setActiveEntryIndex(0);
            onUpdate?.(defaultData);
          }}>
            Reset All
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
export function validateBusinessEQ(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as BusinessEQData;

  if (!d.entries || d.entries.length === 0) {
    errors.push('At least one assessment entry is required');
    return { valid: false, errors, warnings };
  }

  d.entries.forEach((entry, i) => {
    dimensions.forEach(dim => {
      const val = entry[dim.key as keyof EQEntry];
      if (typeof val !== 'number' || val < 0 || val > 100) {
        errors.push(`Entry ${i + 1}: ${dim.label} must be 0-100`);
      }
    });

    if (!entry.date) {
      errors.push(`Entry ${i + 1}: Date is required`);
    }
  });

  // Check for trend direction
  if (d.entries.length >= 3) {
    const averages = d.entries.map(entry =>
      dimensions.reduce((acc, dim) => acc + (entry[dim.key as keyof EQEntry] as number), 0) / dimensions.length
    );
    const trend = averages[averages.length - 1] - averages[0];
    if (trend < -20) {
      warnings.push('EQ scores show significant decline - consider what factors may be contributing');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportBusinessEQToPDF(data: unknown): PDFSection {
  const d = data as BusinessEQData;
  const latestEntry = d.entries[d.entries.length - 1];
  const avgScore = Math.round(
    dimensions.reduce((acc, dim) => acc + (latestEntry[dim.key as keyof EQEntry] as number), 0) / dimensions.length
  );

  // Calculate trend if multiple entries
  let trendInsight = '';
  if (d.entries.length > 1) {
    const firstAvg = dimensions.reduce((acc, dim) =>
      acc + (d.entries[0][dim.key as keyof EQEntry] as number), 0
    ) / dimensions.length;
    const diff = avgScore - firstAvg;
    trendInsight = diff > 5 ? 'EQ trending upward' :
                   diff < -5 ? 'EQ trending downward' :
                   'EQ relatively stable';
  }

  return {
    title: 'Business Emotional Intelligence',
    summary: `Latest EQ Score: ${avgScore}% | Entries: ${d.entries.length}${trendInsight ? ` | ${trendInsight}` : ''}`,
    charts: [
      {
        type: 'radar',
        data: dimensions.map(dim => ({
          label: dim.label,
          value: latestEntry[dim.key as keyof EQEntry] as number
        }))
      },
      ...(d.entries.length > 1 ? [{
        type: 'line' as const,
        data: d.entries.map(entry => ({
          label: entry.date,
          value: Math.round(
            dimensions.reduce((acc, dim) => acc + (entry[dim.key as keyof EQEntry] as number), 0) / dimensions.length
          )
        }))
      }] : [])
    ],
    tables: [{
      headers: ['Dimension', 'Score', 'Level'],
      rows: dimensions.map(dim => {
        const val = latestEntry[dim.key as keyof EQEntry] as number;
        return [
          dim.label,
          `${val}%`,
          val >= 70 ? 'Strong' : val >= 40 ? 'Developing' : 'Emerging'
        ];
      })
    }],
    insights: [
      `Business EQ assessment based on ${d.entries.length} entry/entries`,
      ...dimensions
        .filter(dim => (latestEntry[dim.key as keyof EQEntry] as number) < 40)
        .map(dim => `${dim.label} identified as growth area`),
      trendInsight || undefined,
      latestEntry.notes ? `Latest notes: ${latestEntry.notes}` : undefined
    ].filter(Boolean) as string[],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'business-eq',
    name: 'Business Emotional Intelligence',
    description: 'Track your business emotional intelligence over time across 6 key dimensions',
    category: 'assessment',
    order: 3,
    estimatedTime: 10
  },
  component: BusinessEQTool,
  validate: validateBusinessEQ,
  exportToPDF: exportBusinessEQToPDF,
  getDefaultData: () => defaultData
});
