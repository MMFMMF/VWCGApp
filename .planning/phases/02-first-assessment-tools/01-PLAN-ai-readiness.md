---
wave: 1
depends_on: []
files_modified:
  - src/components/tools/AIReadinessTool.tsx
  - src/lib/tools/index.ts
autonomous: true
---

# Plan: AI Readiness Assessment Tool

## Objective

Implement the AI Readiness Assessment tool (AST-01) - a 6-dimension slider-based assessment with radar chart visualization. This is the first production assessment tool and establishes the radar chart pattern for subsequent tools.

## Tasks

### Task 1: Create AI Readiness Tool Component

**Action:** Create the AI Readiness assessment component following the established tool pattern
**Files:** src/components/tools/AIReadinessTool.tsx
**Details:**

```typescript
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
  Tooltip
} from 'recharts';

// Data structure for AI Readiness Assessment
interface AIReadinessData {
  // 6 dimensions from ROADMAP
  strategy: number;      // AI Strategy & Vision
  data: number;          // Data Readiness
  infrastructure: number; // Technical Infrastructure
  talent: number;        // Talent & Skills
  governance: number;    // Governance & Ethics
  culture: number;       // Culture & Change Readiness
  notes: string;
  lastUpdated: number;
}

const defaultData: AIReadinessData = {
  strategy: 50,
  data: 50,
  infrastructure: 50,
  talent: 50,
  governance: 50,
  culture: 50,
  notes: '',
  lastUpdated: Date.now()
};

const dimensions = [
  { key: 'strategy', label: 'AI Strategy', description: 'Clarity of AI vision and strategic alignment' },
  { key: 'data', label: 'Data Readiness', description: 'Quality, accessibility, and governance of data assets' },
  { key: 'infrastructure', label: 'Infrastructure', description: 'Technical capabilities and scalability' },
  { key: 'talent', label: 'Talent & Skills', description: 'AI expertise and learning culture' },
  { key: 'governance', label: 'Governance', description: 'Ethics, compliance, and risk management' },
  { key: 'culture', label: 'Culture', description: 'Organizational readiness for AI-driven change' }
] as const;

export default function AIReadinessTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<AIReadinessData>(
    (data as AIReadinessData) || defaultData
  );

  useEffect(() => {
    if (data) setFormData(data as AIReadinessData);
  }, [data]);

  const handleChange = <K extends keyof AIReadinessData>(field: K, value: AIReadinessData[K]) => {
    const updated = { ...formData, [field]: value, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate overall AI readiness score
  const overallScore = useMemo(() => {
    const sum = dimensions.reduce((acc, d) => acc + formData[d.key as keyof AIReadinessData] as number, 0);
    return Math.round(sum / dimensions.length);
  }, [formData]);

  // Prepare radar chart data
  const chartData = useMemo(() =>
    dimensions.map(d => ({
      dimension: d.label,
      value: formData[d.key as keyof AIReadinessData] as number,
      fullMark: 100
    })),
    [formData]
  );

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'AI-Ready', variant: 'success' as const };
    if (score >= 60) return { label: 'Progressing', variant: 'success' as const };
    if (score >= 40) return { label: 'Developing', variant: 'warning' as const };
    if (score >= 20) return { label: 'Early Stage', variant: 'warning' as const };
    return { label: 'Not Started', variant: 'danger' as const };
  };

  const readiness = getReadinessLevel(overallScore);

  return (
    <div className="space-y-6">
      {/* Summary Card with Radar Chart */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">AI Readiness Score</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold">{overallScore}%</span>
              <Badge variant={readiness.variant}>{readiness.label}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Your organization's overall readiness to adopt and scale AI initiatives,
              based on 6 key dimensions.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="AI Readiness"
                  dataKey="value"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Dimension Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Dimensions</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          {dimensions.map(dim => (
            <SliderInput
              key={dim.key}
              label={dim.label}
              description={dim.description}
              value={formData[dim.key as keyof AIReadinessData] as number}
              min={0}
              max={100}
              step={5}
              onChange={(v) => handleChange(dim.key as keyof AIReadinessData, v)}
              disabled={readonly}
            />
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes & Context</CardTitle>
        </CardHeader>
        <TextArea
          label=""
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add context about your organization's AI journey, current initiatives, or specific challenges..."
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
export function validateAIReadiness(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as AIReadinessData;

  // Check all dimensions have valid values
  dimensions.forEach(dim => {
    const val = d[dim.key as keyof AIReadinessData];
    if (typeof val !== 'number' || val < 0 || val > 100) {
      errors.push(`${dim.label} must be between 0 and 100`);
    }
  });

  // Warnings for imbalanced scores
  const values = dimensions.map(dim => d[dim.key as keyof AIReadinessData] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max - min > 50) {
    warnings.push('Large variation between dimensions - consider addressing gaps');
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg < 30) {
    warnings.push('Overall readiness is low - AI initiatives may face significant challenges');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportAIReadinessToPDF(data: unknown): PDFSection {
  const d = data as AIReadinessData;
  const avg = Math.round(dimensions.reduce((acc, dim) =>
    acc + (d[dim.key as keyof AIReadinessData] as number), 0
  ) / dimensions.length);

  return {
    title: 'AI Readiness Assessment',
    summary: `Overall AI Readiness Score: ${avg}%`,
    charts: [{
      type: 'radar',
      data: dimensions.map(dim => ({
        label: dim.label,
        value: d[dim.key as keyof AIReadinessData] as number
      }))
    }],
    tables: [{
      headers: ['Dimension', 'Score', 'Status'],
      rows: dimensions.map(dim => {
        const val = d[dim.key as keyof AIReadinessData] as number;
        return [
          dim.label,
          `${val}%`,
          val >= 70 ? 'Strong' : val >= 40 ? 'Developing' : 'Needs Attention'
        ];
      })
    }],
    insights: [
      avg >= 70 ? 'Organization is well-positioned for AI adoption' :
      avg >= 40 ? 'Foundation exists but gaps need addressing' :
      'Significant preparation needed before AI initiatives',
      d.notes ? `Context: ${d.notes}` : undefined
    ].filter(Boolean) as string[],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'ai-readiness',
    name: 'AI Readiness Assessment',
    description: 'Evaluate your organization\'s readiness for AI adoption across 6 key dimensions',
    category: 'assessment',
    order: 1,
    estimatedTime: 10
  },
  component: AIReadinessTool,
  validate: validateAIReadiness,
  exportToPDF: exportAIReadinessToPDF,
  getDefaultData: () => defaultData
});
```

### Task 2: Update Tool Registry Index

**Action:** Import the AI Readiness tool to auto-register
**Files:** src/lib/tools/index.ts
**Details:**

Add import to the tools index file:
```typescript
// Import tools to auto-register them
import '../../components/tools/ExampleTool';
import '../../components/tools/AIReadinessTool';
```

### Task 3: Add Description Prop to SliderInput

**Action:** Update SliderInput component to support description text
**Files:** src/components/shared/forms/SliderInput.tsx
**Details:**

Add optional `description` prop to display helper text below the label.

### Task 4: Verify Build and Functionality

**Action:** Run build to ensure no TypeScript errors
**Files:** N/A
**Details:**

```bash
npm run build
```

Verify:
- Component renders without errors
- Radar chart displays correctly
- Sliders update state
- Data persists to localStorage

## Verification

- [ ] AI Readiness tool renders with 6 dimension sliders
- [ ] Radar chart displays current values for all 6 dimensions
- [ ] Overall score calculates correctly as average of all dimensions
- [ ] Readiness level badge updates based on score
- [ ] Data persists after page refresh
- [ ] Tool appears in navigation at position 1
- [ ] PDF export includes radar chart data and insights
- [ ] Validation catches out-of-range values
- [ ] Build completes successfully

## Must-Haves

- 6 dimensions: Strategy, Data, Infrastructure, Talent, Governance, Culture (AST-01)
- 0-100% sliders per dimension (AST-01)
- Radar chart visualization (AST-01)
- Self-registering tool pattern (ARC-02, ARC-03)
- Validation and PDF export functions (ARC-03)
