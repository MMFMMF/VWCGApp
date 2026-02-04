import { useState, useEffect } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
  SliderInput,
  TextArea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';

// ============================================
// 1. Define the tool's data structure
// ============================================

interface ExampleToolData {
  dimension1: number;
  dimension2: number;
  dimension3: number;
  category: string;
  notes: string;
  lastUpdated: number;
}

const defaultData: ExampleToolData = {
  dimension1: 50,
  dimension2: 50,
  dimension3: 50,
  category: '',
  notes: '',
  lastUpdated: Date.now()
};

const categoryOptions = [
  { value: 'startup', label: 'Startup (0-2 years)' },
  { value: 'growth', label: 'Growth (2-5 years)' },
  { value: 'mature', label: 'Mature (5+ years)' }
];

// ============================================
// 2. Define the tool component
// ============================================

export default function ExampleTool({
  data,
  onUpdate,
  readonly = false
}: ToolProps) {
  // Initialize local state from props or defaults
  const [formData, setFormData] = useState<ExampleToolData>(
    (data as ExampleToolData) || defaultData
  );

  // Sync with incoming data changes
  useEffect(() => {
    if (data) {
      setFormData(data as ExampleToolData);
    }
  }, [data]);

  // Handle field changes
  const handleChange = <K extends keyof ExampleToolData>(
    field: K,
    value: ExampleToolData[K]
  ) => {
    const updated = {
      ...formData,
      [field]: value,
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate overall score
  const overallScore = Math.round(
    (formData.dimension1 + formData.dimension2 + formData.dimension3) / 3
  );

  // Determine score badge variant
  const getBadgeVariant = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Overall Score</h3>
            <p className="text-sm text-gray-500">
              Based on 3 assessment dimensions
            </p>
          </div>
          <Badge variant={getBadgeVariant(overallScore)} className="text-lg px-4 py-2">
            {overallScore}%
          </Badge>
        </div>
      </Card>

      {/* Assessment Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Dimensions</CardTitle>
        </CardHeader>

        <div className="space-y-6">
          <SliderInput
            label="Dimension 1: Strategy Alignment"
            value={formData.dimension1}
            min={0}
            max={100}
            onChange={(v) => handleChange('dimension1', v)}
            disabled={readonly}
          />

          <SliderInput
            label="Dimension 2: Operational Readiness"
            value={formData.dimension2}
            min={0}
            max={100}
            onChange={(v) => handleChange('dimension2', v)}
            disabled={readonly}
          />

          <SliderInput
            label="Dimension 3: Resource Capacity"
            value={formData.dimension3}
            min={0}
            max={100}
            onChange={(v) => handleChange('dimension3', v)}
            disabled={readonly}
          />
        </div>
      </Card>

      {/* Additional Context */}
      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          <Select
            label="Business Stage"
            value={formData.category}
            options={categoryOptions}
            onChange={(v) => handleChange('category', v)}
            placeholder="Select your business stage..."
            disabled={readonly}
          />

          <TextArea
            label="Notes & Observations"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any relevant notes about your assessment..."
            disabled={readonly}
          />
        </div>
      </Card>

      {/* Actions */}
      {!readonly && (
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setFormData(defaultData);
              onUpdate?.(defaultData);
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={() => onUpdate?.(formData)}>
            Save Assessment
          </Button>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {import.meta.env.DEV && (
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Debug: View raw data
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// ============================================
// 3. Define validation function
// ============================================

export function validateExampleTool(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const toolData = data as ExampleToolData;

  // Required field validation
  if (!toolData.category) {
    errors.push('Business stage is required');
  }

  // Range validation
  if (toolData.dimension1 < 0 || toolData.dimension1 > 100) {
    errors.push('Dimension 1 must be between 0 and 100');
  }

  // Warning for low scores
  const avgScore = (toolData.dimension1 + toolData.dimension2 + toolData.dimension3) / 3;
  if (avgScore < 30) {
    warnings.push('Overall score is quite low - consider reviewing your inputs');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================
// 4. Define PDF export function
// ============================================

export function exportExampleToolToPDF(data: unknown): PDFSection {
  const toolData = data as ExampleToolData;
  const avgScore = Math.round(
    (toolData.dimension1 + toolData.dimension2 + toolData.dimension3) / 3
  );

  return {
    title: 'Example Assessment Results',
    summary: `Overall score: ${avgScore}% (${toolData.category || 'No stage selected'})`,
    charts: [
      {
        type: 'bar',
        data: [
          { label: 'Strategy Alignment', value: toolData.dimension1 },
          { label: 'Operational Readiness', value: toolData.dimension2 },
          { label: 'Resource Capacity', value: toolData.dimension3 }
        ]
      }
    ],
    tables: [
      {
        headers: ['Dimension', 'Score', 'Status'],
        rows: [
          ['Strategy Alignment', `${toolData.dimension1}%`, toolData.dimension1 >= 70 ? 'Good' : 'Needs Work'],
          ['Operational Readiness', `${toolData.dimension2}%`, toolData.dimension2 >= 70 ? 'Good' : 'Needs Work'],
          ['Resource Capacity', `${toolData.dimension3}%`, toolData.dimension3 >= 70 ? 'Good' : 'Needs Work']
        ]
      }
    ],
    insights: [
      avgScore >= 70
        ? 'Strong overall readiness for strategic initiatives'
        : 'Consider addressing gaps before major initiatives',
      toolData.notes ? `Notes: ${toolData.notes}` : undefined
    ].filter(Boolean) as string[],
    rawData: toolData
  };
}

// ============================================
// 5. Register the tool
// ============================================

toolRegistry.register({
  metadata: {
    id: 'example-tool',
    name: 'Example Assessment',
    description: 'A template assessment tool demonstrating the standardized pattern',
    category: 'assessment',
    order: 99, // Last in order (example tool)
    estimatedTime: 5
  },
  component: ExampleTool,
  validate: validateExampleTool,
  exportToPDF: exportExampleToolToPDF,
  getDefaultData: () => defaultData
});
