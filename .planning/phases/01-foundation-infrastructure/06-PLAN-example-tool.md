---
wave: 3
depends_on:
  - 03-PLAN-tool-registry
  - 04-PLAN-shared-components
  - 05-PLAN-synthesis-registry
files_modified:
  - src/components/tools/ExampleTool.tsx
  - src/lib/tools/index.ts
  - docs/TOOL_CREATION_GUIDE.md
autonomous: true
---

# Plan: Example Tool Implementation

## Objective

Create a fully-functional example assessment tool that demonstrates the standardized tool pattern. This tool serves as both a working example and documentation for adding new tools, fulfilling requirement ARC-04 (documented tool creation pattern for adding new tools).

## Tasks

### Task 1: Create Example Tool Component

**Action:** Build a complete example tool demonstrating all patterns
**Files:** src/components/tools/ExampleTool.tsx
**Details:**

```typescript
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
```

### Task 2: Update Tool Registry Index

**Action:** Import the example tool to trigger registration
**Files:** src/lib/tools/index.ts
**Details:**

```typescript
// Re-export registry
export { toolRegistry } from './toolRegistry';
export type { ToolDefinition, ToolProps, ToolMetadata } from '@types/tool';

// Import tools to trigger auto-registration
// Each tool file registers itself when imported
import '../../components/tools/ExampleTool';

// Future tools will be added here:
// import '../../components/tools/AIReadinessTool';
// import '../../components/tools/LeadershipDNATool';
// etc.
```

### Task 3: Create Tool Creation Guide

**Action:** Write comprehensive documentation for adding new tools
**Files:** docs/TOOL_CREATION_GUIDE.md
**Details:**

```markdown
# Tool Creation Guide

This guide explains how to add new assessment tools to VWCGApp following the standardized pattern.

## Overview

Each tool in VWCGApp is a self-contained module that:
1. Defines its data structure
2. Implements a React component
3. Provides validation (optional)
4. Provides PDF export (optional)
5. Self-registers with the tool registry

## Quick Start

1. Copy the example tool: `src/components/tools/ExampleTool.tsx`
2. Rename to your tool: `src/components/tools/YourToolName.tsx`
3. Update the tool ID, name, and description
4. Define your data structure
5. Implement your UI
6. Add import to `src/lib/tools/index.ts`

## Step-by-Step Guide

### Step 1: Define Your Data Structure

```typescript
interface YourToolData {
  // Define all fields your tool needs
  field1: number;
  field2: string;
  items: Array<{ id: string; value: number }>;
  lastUpdated: number;
}

const defaultData: YourToolData = {
  field1: 0,
  field2: '',
  items: [],
  lastUpdated: Date.now()
};
```

### Step 2: Implement the Component

Your component receives three props:

```typescript
interface ToolProps {
  data?: Record<string, unknown>;  // Current data from store
  onUpdate?: (data: Record<string, unknown>) => void;  // Save callback
  readonly?: boolean;  // Disable editing (for reports)
}
```

Pattern:
```typescript
export default function YourTool({ data, onUpdate, readonly }: ToolProps) {
  const [formData, setFormData] = useState<YourToolData>(
    (data as YourToolData) || defaultData
  );

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(updated);  // Auto-save to Zustand
  };

  return (
    <div>
      {/* Your UI using shared components */}
    </div>
  );
}
```

### Step 3: Add Validation (Optional)

```typescript
export function validateYourTool(data: unknown): ValidationResult {
  const errors: string[] = [];
  const toolData = data as YourToolData;

  if (!toolData.field1) {
    errors.push('Field 1 is required');
  }

  return { valid: errors.length === 0, errors };
}
```

### Step 4: Add PDF Export (Optional)

```typescript
export function exportYourToolToPDF(data: unknown): PDFSection {
  const toolData = data as YourToolData;

  return {
    title: 'Your Tool Results',
    summary: `Summary of ${toolData.field2}`,
    charts: [...],
    tables: [...],
    insights: [...],
    rawData: toolData
  };
}
```

### Step 5: Register the Tool

```typescript
import { toolRegistry } from '@lib/tools';

toolRegistry.register({
  metadata: {
    id: 'your-tool-id',           // URL-safe, unique
    name: 'Your Tool Name',        // Display name
    description: 'What this tool does',
    category: 'assessment',        // assessment | planning | sop | synthesis
    order: 10,                     // Display order in navigation
    estimatedTime: 15              // Minutes to complete
  },
  component: YourTool,
  validate: validateYourTool,      // Optional
  exportToPDF: exportYourToolToPDF,// Optional
  getDefaultData: () => defaultData
});
```

### Step 6: Import in Registry Index

Add to `src/lib/tools/index.ts`:

```typescript
import '../../components/tools/YourToolName';
```

## Available Shared Components

Use these components for consistent UI:

### Form Components
- `SliderInput` - For 0-100 or 0-10 scale ratings
- `TextInput` - For single-line text
- `TextArea` - For multi-line text
- `Select` - For dropdown selections

### UI Components
- `Card` - Container with shadow and padding
- `CardHeader`, `CardTitle` - Card headings
- `Button` - Action buttons (primary, secondary, ghost, danger)
- `Badge` - Status indicators (success, warning, danger, info)
- `Modal` - Dialog overlays

### Example Usage

```typescript
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
```

## Best Practices

1. **Auto-save**: Call `onUpdate(data)` whenever data changes
2. **Default data**: Always provide sensible defaults
3. **Readonly mode**: Respect the `readonly` prop for report views
4. **Validation**: Validate before PDF export
5. **TypeScript**: Define explicit interfaces for your data
6. **Accessibility**: Use proper labels and keyboard navigation

## Synthesis Integration

If your tool should contribute to synthesis rules:

1. Use consistent field names that rules can reference
2. Document your data structure for rule authors
3. Consider adding a `calculateScores` function to your registration

## Testing Your Tool

1. Run `npm run dev`
2. Navigate to `/app/tools/your-tool-id`
3. Verify data persists after page refresh (localStorage)
4. Test readonly mode by viewing in report
5. Export workspace and verify your tool data is included
```

### Task 4: Create Example Synthesis Rule

**Action:** Create a synthesis rule that uses the example tool
**Files:** src/lib/synthesis/rules/exampleRule.ts
**Details:**

```typescript
/**
 * Example Synthesis Rule
 *
 * Demonstrates how to create a synthesis rule that analyzes
 * data from the example tool.
 *
 * This is a reference implementation - replace with real business
 * logic rules in production.
 */

import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

interface ExampleToolData {
  dimension1: number;
  dimension2: number;
  dimension3: number;
  category: string;
}

const exampleSynthesisRule: SynthesisRule = {
  id: 'EXAMPLE-low-readiness-alert',
  name: 'Low Readiness Alert',
  description: 'Detects when overall readiness score falls below threshold',
  requiredTools: ['example-tool'],

  evaluate: (context: SynthesisContext): Insight[] => {
    const exampleData = context.tools['example-tool'] as ExampleToolData | undefined;

    if (!exampleData) {
      return [];
    }

    const insights: Insight[] = [];
    const avgScore = (exampleData.dimension1 + exampleData.dimension2 + exampleData.dimension3) / 3;

    // Rule: Alert when average score is below 40%
    if (avgScore < 40) {
      insights.push({
        id: `EXAMPLE-low-readiness-${Date.now()}`,
        ruleId: 'EXAMPLE-low-readiness-alert',
        type: 'warning',
        severity: avgScore < 20 ? 5 : 4,
        title: 'Low Overall Readiness Score',
        description: `Your overall readiness score (${Math.round(avgScore)}%) indicates significant gaps in preparation. ${
          avgScore < 20
            ? 'Critical attention needed before proceeding.'
            : 'Consider addressing key areas before major initiatives.'
        }`,
        recommendation: `Focus on improving your lowest scoring dimension: ${
          exampleData.dimension1 <= exampleData.dimension2 && exampleData.dimension1 <= exampleData.dimension3
            ? 'Strategy Alignment'
            : exampleData.dimension2 <= exampleData.dimension3
            ? 'Operational Readiness'
            : 'Resource Capacity'
        }.`,
        affectedTools: ['example-tool'],
        data: {
          avgScore: Math.round(avgScore),
          dimension1: exampleData.dimension1,
          dimension2: exampleData.dimension2,
          dimension3: exampleData.dimension3
        }
      });
    }

    // Rule: Alert for imbalanced dimensions (one is much lower than others)
    const scores = [exampleData.dimension1, exampleData.dimension2, exampleData.dimension3];
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    if (maxScore - minScore > 40) {
      insights.push({
        id: `EXAMPLE-imbalance-${Date.now()}`,
        ruleId: 'EXAMPLE-low-readiness-alert',
        type: 'gap',
        severity: 3,
        title: 'Dimension Imbalance Detected',
        description: `There's a significant gap (${maxScore - minScore} points) between your strongest and weakest dimensions. This imbalance may limit overall effectiveness.`,
        recommendation: 'Consider balancing your focus across all dimensions for sustainable progress.',
        affectedTools: ['example-tool'],
        data: {
          maxScore,
          minScore,
          gap: maxScore - minScore
        }
      });
    }

    return insights;
  },

  calculateScores: (context: SynthesisContext) => {
    const exampleData = context.tools['example-tool'] as ExampleToolData | undefined;

    if (!exampleData) {
      return {};
    }

    return {
      overallReadiness: Math.round(
        (exampleData.dimension1 + exampleData.dimension2 + exampleData.dimension3) / 3
      ),
      strategyAlignment: exampleData.dimension1,
      operationalReadiness: exampleData.dimension2,
      resourceCapacity: exampleData.dimension3
    };
  }
};

// Auto-register
synthesisRuleRegistry.register(exampleSynthesisRule);

export default exampleSynthesisRule;
```

### Task 5: Update Synthesis Index to Include Example Rule

**Action:** Import the example rule to trigger registration
**Files:** src/lib/synthesis/index.ts
**Details:**

```typescript
// Export registry
export { synthesisRuleRegistry } from './ruleRegistry';

// Export types
export type {
  SynthesisRule,
  SynthesisContext,
  SynthesisResult,
  Insight
} from './types';

// Import rules to trigger auto-registration
import './rules/exampleRule';

// Future rules will be added here:
// import './rules/executionCapabilityGap';  // E1
// import './rules/unmitigatedThreat';       // E2
// import './rules/burnoutRisk';             // E3
// etc.
```

## Verification

- [ ] Example tool renders at `/app/tools/example-tool`
- [ ] Sliders update and show current values
- [ ] Select dropdown works for business stage
- [ ] TextArea accepts notes input
- [ ] Changes auto-save to Zustand (persist in localStorage)
- [ ] Page refresh preserves all entered data
- [ ] Reset button clears to default values
- [ ] Readonly mode disables all inputs
- [ ] Debug panel shows raw data in dev mode
- [ ] Tool appears in dashboard tool list
- [ ] Tool appears in sidebar navigation
- [ ] Validation function catches missing required fields
- [ ] PDF export function generates correct structure
- [ ] Example synthesis rule triggers on low scores
- [ ] TOOL_CREATION_GUIDE.md is clear and complete
- [ ] Following the guide produces a working tool

## Must-Haves

- Working example tool demonstrating all patterns (ARC-04)
- Documented tool creation pattern for adding new tools (ARC-04)
- Example uses all shared form components
- Example includes validation function
- Example includes PDF export function
- Example synthesis rule shows cross-tool analysis
- Clear step-by-step documentation
