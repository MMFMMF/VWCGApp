---
wave: 1
depends_on: []
files_modified:
  - src/components/tools/VisionCanvasTool.tsx
  - src/lib/tools/index.ts
autonomous: true
---

# Plan: Vision Canvas Tool

## Objective

Implement the Vision Canvas tool (AST-05) - capturing North Star metric, strategic pillars (max 6), and core values list with visual canvas display.

## Tasks

### Task 1: Create Vision Canvas Tool Component

**Action:** Create the Vision Canvas component with North Star, pillars, and values
**Files:** src/components/tools/VisionCanvasTool.tsx
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
  Badge,
  TextInput,
  TextArea
} from '@components/shared';

interface Pillar {
  id: string;
  title: string;
  description: string;
}

interface VisionCanvasData {
  northStar: {
    metric: string;
    target: string;
    timeframe: string;
  };
  pillars: Pillar[];
  coreValues: string[];
  missionStatement: string;
  notes: string;
  lastUpdated: number;
}

const defaultData: VisionCanvasData = {
  northStar: { metric: '', target: '', timeframe: '' },
  pillars: [],
  coreValues: [],
  missionStatement: '',
  notes: '',
  lastUpdated: Date.now()
};

const MAX_PILLARS = 6;
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function VisionCanvasTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<VisionCanvasData>(
    (data as VisionCanvasData) || defaultData
  );
  const [newPillar, setNewPillar] = useState({ title: '', description: '' });
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (data) setFormData(data as VisionCanvasData);
  }, [data]);

  const updateField = <K extends keyof VisionCanvasData>(field: K, value: VisionCanvasData[K]) => {
    const updated = { ...formData, [field]: value, lastUpdated: Date.now() };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const updateNorthStar = (field: keyof VisionCanvasData['northStar'], value: string) => {
    const updated = {
      ...formData,
      northStar: { ...formData.northStar, [field]: value },
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const addPillar = () => {
    if (!newPillar.title.trim() || formData.pillars.length >= MAX_PILLARS) return;
    const updated = {
      ...formData,
      pillars: [...formData.pillars, { id: generateId(), ...newPillar }],
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
    setNewPillar({ title: '', description: '' });
  };

  const removePillar = (id: string) => {
    const updated = {
      ...formData,
      pillars: formData.pillars.filter(p => p.id !== id),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const addValue = () => {
    if (!newValue.trim()) return;
    const updated = {
      ...formData,
      coreValues: [...formData.coreValues, newValue.trim()],
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
    setNewValue('');
  };

  const removeValue = (index: number) => {
    const updated = {
      ...formData,
      coreValues: formData.coreValues.filter((_, i) => i !== index),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate completeness
  const completeness = useMemo(() => {
    let score = 0;
    if (formData.northStar.metric) score += 20;
    if (formData.northStar.target) score += 15;
    if (formData.northStar.timeframe) score += 15;
    if (formData.pillars.length >= 3) score += 25;
    if (formData.coreValues.length >= 3) score += 15;
    if (formData.missionStatement) score += 10;
    return score;
  }, [formData]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Vision Canvas</h3>
            <p className="text-sm text-gray-500">
              Define your strategic direction and guiding principles
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{completeness}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </Card>

      {/* North Star Metric */}
      <Card className="border-l-4 border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⭐ North Star Metric
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 mb-4">
          The single most important metric that defines success
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
            <input
              type="text"
              value={formData.northStar.metric}
              onChange={(e) => updateNorthStar('metric', e.target.value)}
              placeholder="e.g., Monthly Recurring Revenue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              disabled={readonly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
            <input
              type="text"
              value={formData.northStar.target}
              onChange={(e) => updateNorthStar('target', e.target.value)}
              placeholder="e.g., $100K"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              disabled={readonly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <input
              type="text"
              value={formData.northStar.timeframe}
              onChange={(e) => updateNorthStar('timeframe', e.target.value)}
              placeholder="e.g., By Dec 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              disabled={readonly}
            />
          </div>
        </div>
      </Card>

      {/* Strategic Pillars */}
      <Card className="border-l-4 border-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Strategic Pillars
            <Badge size="sm" variant={formData.pillars.length >= 3 ? 'success' : 'warning'}>
              {formData.pillars.length}/{MAX_PILLARS}
            </Badge>
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 mb-4">
          Key focus areas that support your North Star (3-6 recommended)
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {formData.pillars.map((pillar, index) => (
            <div key={pillar.id} className="p-3 bg-indigo-50 rounded-lg relative group">
              <div className="font-medium text-indigo-900">{pillar.title}</div>
              {pillar.description && (
                <div className="text-sm text-indigo-700 mt-1">{pillar.description}</div>
              )}
              {!readonly && (
                <button
                  onClick={() => removePillar(pillar.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {!readonly && formData.pillars.length < MAX_PILLARS && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newPillar.title}
              onChange={(e) => setNewPillar(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Pillar name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={newPillar.description}
              onChange={(e) => setNewPillar(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description (optional)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              onKeyDown={(e) => e.key === 'Enter' && addPillar()}
            />
            <Button onClick={addPillar}>Add</Button>
          </div>
        )}
      </Card>

      {/* Core Values */}
      <Card className="border-l-4 border-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Core Values
            <Badge size="sm" variant={formData.coreValues.length >= 3 ? 'success' : 'warning'}>
              {formData.coreValues.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 mb-4">
          Guiding principles that define how you operate (3-5 recommended)
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {formData.coreValues.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
            >
              {value}
              {!readonly && (
                <button onClick={() => removeValue(index)} className="text-emerald-600 hover:text-emerald-800">
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        {!readonly && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addValue()}
              placeholder="Add a core value..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button onClick={addValue}>Add</Button>
          </div>
        )}
      </Card>

      {/* Mission Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Statement</CardTitle>
        </CardHeader>
        <textarea
          value={formData.missionStatement}
          onChange={(e) => updateField('missionStatement', e.target.value)}
          placeholder="A clear, concise statement of your organization's purpose and goals..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
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
            Save Canvas
          </Button>
        </div>
      )}
    </div>
  );
}

// Validation
export function validateVisionCanvas(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as VisionCanvasData;

  if (!d.northStar.metric) {
    warnings.push('North Star metric not defined');
  }
  if (d.pillars.length === 0) {
    warnings.push('No strategic pillars defined');
  }
  if (d.pillars.length > MAX_PILLARS) {
    errors.push(`Maximum ${MAX_PILLARS} pillars allowed`);
  }
  if (d.coreValues.length === 0) {
    warnings.push('No core values defined');
  }
  if (d.coreValues.length > 7) {
    warnings.push('Too many core values may dilute focus (3-5 recommended)');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportVisionCanvasToPDF(data: unknown): PDFSection {
  const d = data as VisionCanvasData;

  return {
    title: 'Vision Canvas',
    summary: d.northStar.metric
      ? `North Star: ${d.northStar.metric} → ${d.northStar.target} (${d.northStar.timeframe})`
      : 'North Star not defined',
    tables: [{
      headers: ['Element', 'Details'],
      rows: [
        ['North Star Metric', d.northStar.metric || 'Not defined'],
        ['Target', d.northStar.target || 'Not set'],
        ['Timeframe', d.northStar.timeframe || 'Not set'],
        ['Strategic Pillars', d.pillars.map(p => p.title).join(', ') || 'None'],
        ['Core Values', d.coreValues.join(', ') || 'None']
      ]
    }],
    insights: [
      d.missionStatement ? `Mission: ${d.missionStatement}` : 'Mission statement not defined',
      `${d.pillars.length} strategic pillars defined`,
      `${d.coreValues.length} core values identified`
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'vision-canvas',
    name: 'Vision Canvas',
    description: 'Define your North Star metric, strategic pillars, and core values',
    category: 'assessment',
    order: 5,
    estimatedTime: 15
  },
  component: VisionCanvasTool,
  validate: validateVisionCanvas,
  exportToPDF: exportVisionCanvasToPDF,
  getDefaultData: () => defaultData
});
```

### Task 2: Update Tool Registry Index

**Action:** Import the Vision Canvas tool
**Files:** src/lib/tools/index.ts
**Details:**

```typescript
import '../../components/tools/VisionCanvasTool';
```

### Task 3: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Vision Canvas tool renders with North Star, Pillars, and Values sections
- [ ] North Star metric has metric, target, and timeframe fields
- [ ] Strategic pillars allow adding up to 6 with title and description
- [ ] Core values can be added as tags
- [ ] Completeness percentage calculates correctly
- [ ] Data persists after refresh
- [ ] Tool appears in navigation at position 5
- [ ] Build completes successfully

## Must-Haves

- North Star metric (name, target, timeframe) (AST-05)
- Strategic pillars (max 6) with descriptions (AST-05)
- Core values list (AST-05)
- Completeness indicator
- Self-registering tool pattern
