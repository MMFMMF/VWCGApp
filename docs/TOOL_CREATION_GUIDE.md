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
