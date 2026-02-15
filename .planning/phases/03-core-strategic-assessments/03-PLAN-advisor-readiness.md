---
wave: 2
depends_on:
  - 01-PLAN-swot-analysis
  - 02-PLAN-vision-canvas
files_modified:
  - src/components/tools/AdvisorReadinessTool.tsx
  - src/lib/tools/index.ts
autonomous: true
---

# Plan: Advisor Readiness Assessment Tool

## Objective

Implement the Advisor Readiness Assessment tool (AST-06) - a 20-question assessment across 4 categories with 1-5 scale ratings and maturity percentage calculation.

## Tasks

### Task 1: Create Advisor Readiness Tool Component

**Action:** Create the Advisor Readiness assessment with 20 questions
**Files:** src/components/tools/AdvisorReadinessTool.tsx
**Details:**

```typescript
import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
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

interface AdvisorReadinessData {
  answers: Record<string, number>;
  notes: string;
  lastUpdated: number;
}

// 4 categories with 5 questions each = 20 questions
const categories = [
  {
    key: 'strategic',
    label: 'Strategic Alignment',
    description: 'Clarity of vision and strategic direction',
    questions: [
      { id: 'sa1', text: 'We have a clearly defined 3-5 year strategic vision' },
      { id: 'sa2', text: 'Our team understands and can articulate our strategic priorities' },
      { id: 'sa3', text: 'We regularly review and adjust our strategy based on market changes' },
      { id: 'sa4', text: 'Our strategic goals are measurable and tracked' },
      { id: 'sa5', text: 'Leadership is aligned on strategic direction' }
    ]
  },
  {
    key: 'operational',
    label: 'Operational Maturity',
    description: 'Process efficiency and documentation',
    questions: [
      { id: 'om1', text: 'Our core processes are documented and standardized' },
      { id: 'om2', text: 'We have clear metrics for operational performance' },
      { id: 'om3', text: 'Team members know their roles and responsibilities' },
      { id: 'om4', text: 'We have systems to identify and resolve bottlenecks' },
      { id: 'om5', text: 'Our operations can scale without proportional headcount increase' }
    ]
  },
  {
    key: 'financial',
    label: 'Financial Health',
    description: 'Financial stability and planning',
    questions: [
      { id: 'fh1', text: 'We have a clear understanding of our unit economics' },
      { id: 'fh2', text: 'Cash flow is predictable and well-managed' },
      { id: 'fh3', text: 'We have financial reserves for unexpected challenges' },
      { id: 'fh4', text: 'Our financial reporting is timely and accurate' },
      { id: 'fh5', text: 'We have a clear path to profitability or sustainable growth' }
    ]
  },
  {
    key: 'cultural',
    label: 'Cultural Readiness',
    description: 'Team dynamics and change capacity',
    questions: [
      { id: 'cr1', text: 'Our team embraces feedback and continuous improvement' },
      { id: 'cr2', text: 'We have a culture of accountability and ownership' },
      { id: 'cr3', text: 'Team members are comfortable raising concerns or ideas' },
      { id: 'cr4', text: 'We successfully navigate change and uncertainty' },
      { id: 'cr5', text: 'Leadership models the behaviors we expect from the team' }
    ]
  }
];

const defaultAnswers: Record<string, number> = {};
categories.forEach(cat => {
  cat.questions.forEach(q => {
    defaultAnswers[q.id] = 3; // Default to neutral
  });
});

const defaultData: AdvisorReadinessData = {
  answers: defaultAnswers,
  notes: '',
  lastUpdated: Date.now()
};

export default function AdvisorReadinessTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<AdvisorReadinessData>(
    (data as AdvisorReadinessData) || defaultData
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0].key);

  useEffect(() => {
    if (data) setFormData(data as AdvisorReadinessData);
  }, [data]);

  const handleAnswerChange = (questionId: string, value: number) => {
    const updated = {
      ...formData,
      answers: { ...formData.answers, [questionId]: value },
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate scores
  const scores = useMemo(() => {
    const categoryScores: Record<string, { score: number; max: number; percentage: number }> = {};

    categories.forEach(cat => {
      const catQuestions = cat.questions;
      const sum = catQuestions.reduce((acc, q) => acc + (formData.answers[q.id] || 3), 0);
      const max = catQuestions.length * 5;
      categoryScores[cat.key] = {
        score: sum,
        max,
        percentage: Math.round((sum / max) * 100)
      };
    });

    const totalScore = Object.values(categoryScores).reduce((a, b) => a + b.score, 0);
    const totalMax = Object.values(categoryScores).reduce((a, b) => a + b.max, 0);
    const overallPercentage = Math.round((totalScore / totalMax) * 100);

    return { categoryScores, overallPercentage };
  }, [formData.answers]);

  // Radar chart data
  const chartData = useMemo(() =>
    categories.map(cat => ({
      category: cat.label.split(' ')[0], // Shortened label
      value: scores.categoryScores[cat.key].percentage,
      fullMark: 100
    })),
    [scores]
  );

  const getMaturityLevel = (percentage: number) => {
    if (percentage >= 80) return { label: 'Advisor-Ready', variant: 'success' as const };
    if (percentage >= 60) return { label: 'Developing', variant: 'success' as const };
    if (percentage >= 40) return { label: 'Emerging', variant: 'warning' as const };
    return { label: 'Foundational', variant: 'danger' as const };
  };

  const maturity = getMaturityLevel(scores.overallPercentage);

  return (
    <div className="space-y-6">
      {/* Summary with Radar */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Advisor Readiness Score</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold">{scores.overallPercentage}%</span>
              <Badge variant={maturity.variant}>{maturity.label}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your overall readiness to work effectively with an advisor or consultant,
              based on 20 questions across 4 key categories.
            </p>

            {/* Category breakdown */}
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.key} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-32">{cat.label}:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${scores.categoryScores[cat.key].percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {scores.categoryScores[cat.key].percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Readiness"
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

      {/* Questions by Category */}
      <div className="space-y-4">
        {categories.map(cat => (
          <Card key={cat.key}>
            <button
              onClick={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
              className="w-full flex items-center justify-between p-0"
            >
              <div>
                <h4 className="font-semibold text-left">{cat.label}</h4>
                <p className="text-sm text-gray-500 text-left">{cat.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={scores.categoryScores[cat.key].percentage >= 60 ? 'success' : 'warning'}>
                  {scores.categoryScores[cat.key].percentage}%
                </Badge>
                <span className="text-gray-400">
                  {expandedCategory === cat.key ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {expandedCategory === cat.key && (
              <div className="mt-4 space-y-4">
                {cat.questions.map((q, idx) => (
                  <div key={q.id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                    <p className="text-sm text-gray-700 mb-2">
                      {idx + 1}. {q.text}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Disagree</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => !readonly && handleAnswerChange(q.id, level)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              formData.answers[q.id] === level
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${readonly ? 'cursor-not-allowed' : ''}`}
                            disabled={readonly}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">Agree</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

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
export function validateAdvisorReadiness(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as AdvisorReadinessData;

  // Check for unchanged defaults
  const defaultCount = Object.values(d.answers).filter(v => v === 3).length;
  if (defaultCount > 10) {
    warnings.push('Many questions are at default value - consider reviewing your answers');
  }

  // Check for extreme answers
  const extremeCount = Object.values(d.answers).filter(v => v === 1 || v === 5).length;
  if (extremeCount > 15) {
    warnings.push('Many extreme ratings - ensure answers reflect accurate self-assessment');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportAdvisorReadinessToPDF(data: unknown): PDFSection {
  const d = data as AdvisorReadinessData;

  const categoryScores = categories.map(cat => {
    const sum = cat.questions.reduce((acc, q) => acc + (d.answers[q.id] || 3), 0);
    return {
      category: cat.label,
      score: sum,
      max: cat.questions.length * 5,
      percentage: Math.round((sum / (cat.questions.length * 5)) * 100)
    };
  });

  const overall = categoryScores.reduce((a, b) => a + b.percentage, 0) / categoryScores.length;

  return {
    title: 'Advisor Readiness Assessment',
    summary: `Overall Readiness: ${Math.round(overall)}%`,
    charts: [{
      type: 'radar',
      data: categoryScores.map(c => ({ label: c.category, value: c.percentage }))
    }],
    tables: [{
      headers: ['Category', 'Score', 'Percentage', 'Status'],
      rows: categoryScores.map(c => [
        c.category,
        `${c.score}/${c.max}`,
        `${c.percentage}%`,
        c.percentage >= 60 ? 'Ready' : 'Developing'
      ])
    }],
    insights: [
      `Overall advisor readiness: ${Math.round(overall)}%`,
      ...categoryScores
        .filter(c => c.percentage < 50)
        .map(c => `${c.category} needs attention (${c.percentage}%)`)
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'advisor-readiness',
    name: 'Advisor Readiness',
    description: 'Assess your readiness to work with advisors across 20 questions in 4 categories',
    category: 'assessment',
    order: 6,
    estimatedTime: 10
  },
  component: AdvisorReadinessTool,
  validate: validateAdvisorReadiness,
  exportToPDF: exportAdvisorReadinessToPDF,
  getDefaultData: () => defaultData
});
```

### Task 2: Update Tool Registry Index

**Action:** Import the Advisor Readiness tool
**Files:** src/lib/tools/index.ts
**Details:**

```typescript
import '../../components/tools/AdvisorReadinessTool';
```

### Task 3: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Advisor Readiness tool renders with 4 collapsible categories
- [ ] Each category has 5 questions with 1-5 scale
- [ ] Overall percentage calculates correctly
- [ ] Category percentages calculate correctly
- [ ] Radar chart displays 4 category scores
- [ ] Data persists after refresh
- [ ] Tool appears in navigation at position 6
- [ ] Build completes successfully

## Must-Haves

- 20 questions across 4 categories (AST-06)
- 1-5 scale for each question (AST-06)
- Maturity percentage calculation (AST-06)
- Category breakdown visualization
- Self-registering tool pattern
