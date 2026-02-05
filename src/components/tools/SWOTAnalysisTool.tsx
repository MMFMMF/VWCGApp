import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  TextInput
} from '@components/shared';

interface SWOTItem {
  id: string;
  text: string;
  confidence: number; // 1-5
}

interface SWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  notes: string;
  lastUpdated: number;
}

const defaultData: SWOTData = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
  notes: '',
  lastUpdated: Date.now()
};

const quadrantConfig = [
  { key: 'strengths', label: 'Strengths', color: 'emerald', description: 'Internal positive attributes' },
  { key: 'weaknesses', label: 'Weaknesses', color: 'red', description: 'Internal areas for improvement' },
  { key: 'opportunities', label: 'Opportunities', color: 'blue', description: 'External favorable conditions' },
  { key: 'threats', label: 'Threats', color: 'amber', description: 'External challenges to address' }
] as const;

type QuadrantKey = typeof quadrantConfig[number]['key'];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function SWOTAnalysisTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<SWOTData>(
    (data as SWOTData) || defaultData
  );
  const [newItems, setNewItems] = useState<Record<QuadrantKey, string>>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  });

  useEffect(() => {
    if (data) setFormData(data as SWOTData);
  }, [data]);

  const addItem = (quadrant: QuadrantKey) => {
    if (!newItems[quadrant].trim()) return;

    const updated = {
      ...formData,
      [quadrant]: [
        ...formData[quadrant],
        { id: generateId(), text: newItems[quadrant].trim(), confidence: 3 }
      ],
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
    setNewItems(prev => ({ ...prev, [quadrant]: '' }));
  };

  const removeItem = (quadrant: QuadrantKey, id: string) => {
    const updated = {
      ...formData,
      [quadrant]: formData[quadrant].filter(item => item.id !== id),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const updateConfidence = (quadrant: QuadrantKey, id: string, confidence: number) => {
    const updated = {
      ...formData,
      [quadrant]: formData[quadrant].map(item =>
        item.id === id ? { ...item, confidence } : item
      ),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = formData.strengths.length + formData.weaknesses.length +
                  formData.opportunities.length + formData.threats.length;
    const highConfidence = [...formData.strengths, ...formData.weaknesses,
                           ...formData.opportunities, ...formData.threats]
                          .filter(item => item.confidence >= 4).length;
    return { total, highConfidence };
  }, [formData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return 'success';
    if (confidence >= 3) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SWOT Analysis</h3>
            <p className="text-sm text-gray-500">
              {stats.total} items identified • {stats.highConfidence} high confidence
            </p>
          </div>
          <Badge variant={stats.total >= 12 ? 'success' : 'warning'}>
            {stats.total >= 12 ? 'Comprehensive' : 'Add more items'}
          </Badge>
        </div>
      </Card>

      {/* 4-Quadrant Matrix */}
      <div className="grid md:grid-cols-2 gap-4">
        {quadrantConfig.map(quadrant => (
          <Card key={quadrant.key} className={`border-l-4 border-${quadrant.color}-500`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{quadrant.label}</span>
                <Badge size="sm">{formData[quadrant.key].length}</Badge>
              </CardTitle>
            </CardHeader>
            <p className="text-xs text-gray-500 mb-3">{quadrant.description}</p>

            {/* Items list */}
            <div className="space-y-2 mb-3">
              {formData[quadrant.key].map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1 text-sm">{item.text}</span>

                  {/* Confidence selector */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => !readonly && updateConfidence(quadrant.key, item.id, level)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                          item.confidence >= level
                            ? `bg-${quadrant.color}-500 text-white`
                            : 'bg-gray-200 text-gray-500'
                        } ${readonly ? 'cursor-not-allowed' : 'hover:opacity-80'}`}
                        disabled={readonly}
                        title={`Confidence: ${level}/5`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  {!readonly && (
                    <button
                      onClick={() => removeItem(quadrant.key, item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new item */}
            {!readonly && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItems[quadrant.key]}
                  onChange={(e) => setNewItems(prev => ({ ...prev, [quadrant.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addItem(quadrant.key)}
                  placeholder={`Add ${quadrant.label.toLowerCase().slice(0, -1)}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <Button size="sm" onClick={() => addItem(quadrant.key)}>Add</Button>
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
            Clear All
          </Button>
          <Button variant="primary" onClick={() => onUpdate?.(formData)}>
            Save Analysis
          </Button>
        </div>
      )}
    </div>
  );
}

// Validation
export function validateSWOTAnalysis(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as SWOTData;

  // Check for minimum items
  const total = d.strengths.length + d.weaknesses.length +
                d.opportunities.length + d.threats.length;
  if (total < 4) {
    warnings.push('Add at least one item per quadrant for a complete analysis');
  }

  // Check for empty quadrants
  if (d.strengths.length === 0) warnings.push('No strengths identified');
  if (d.weaknesses.length === 0) warnings.push('No weaknesses identified');
  if (d.opportunities.length === 0) warnings.push('No opportunities identified');
  if (d.threats.length === 0) warnings.push('No threats identified');

  // Check for low confidence items
  const lowConfidence = [...d.strengths, ...d.weaknesses, ...d.opportunities, ...d.threats]
    .filter(item => item.confidence <= 2);
  if (lowConfidence.length > 3) {
    warnings.push('Several items have low confidence - consider validating them');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportSWOTToPDF(data: unknown): PDFSection {
  const d = data as SWOTData;

  const formatQuadrant = (items: SWOTItem[]) =>
    items.map(i => `${i.text} (${i.confidence}/5)`).join('; ') || 'None identified';

  return {
    title: 'SWOT Analysis',
    summary: `${d.strengths.length}S / ${d.weaknesses.length}W / ${d.opportunities.length}O / ${d.threats.length}T`,
    tables: [{
      headers: ['Quadrant', 'Items', 'Avg Confidence'],
      rows: [
        ['Strengths', d.strengths.length.toString(),
         d.strengths.length ? (d.strengths.reduce((a, i) => a + i.confidence, 0) / d.strengths.length).toFixed(1) : 'N/A'],
        ['Weaknesses', d.weaknesses.length.toString(),
         d.weaknesses.length ? (d.weaknesses.reduce((a, i) => a + i.confidence, 0) / d.weaknesses.length).toFixed(1) : 'N/A'],
        ['Opportunities', d.opportunities.length.toString(),
         d.opportunities.length ? (d.opportunities.reduce((a, i) => a + i.confidence, 0) / d.opportunities.length).toFixed(1) : 'N/A'],
        ['Threats', d.threats.length.toString(),
         d.threats.length ? (d.threats.reduce((a, i) => a + i.confidence, 0) / d.threats.length).toFixed(1) : 'N/A']
      ]
    }],
    insights: [
      `Strengths: ${formatQuadrant(d.strengths)}`,
      `Weaknesses: ${formatQuadrant(d.weaknesses)}`,
      `Opportunities: ${formatQuadrant(d.opportunities)}`,
      `Threats: ${formatQuadrant(d.threats)}`
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Identify strengths, weaknesses, opportunities, and threats with confidence ratings',
    category: 'assessment',
    order: 4,
    estimatedTime: 15
  },
  component: SWOTAnalysisTool,
  validate: validateSWOTAnalysis,
  exportToPDF: exportSWOTToPDF,
  getDefaultData: () => defaultData
});
