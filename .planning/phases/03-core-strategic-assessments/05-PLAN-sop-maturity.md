---
wave: 3
depends_on:
  - 03-PLAN-advisor-readiness
  - 04-PLAN-financial-readiness
files_modified:
  - src/components/tools/SOPMaturityTool.tsx
  - src/lib/tools/index.ts
autonomous: true
---

# Plan: SOP Maturity Assessment Tool

## Objective

Implement the SOP Maturity Assessment tool (SOP-01, SOP-02, SOP-03) - evaluating current process maturity (0-5 scale), identifying top 3 critical SOPs needed, and providing template suggestions.

## Tasks

### Task 1: Create SOP Maturity Tool Component

**Action:** Create the SOP Maturity assessment with maturity evaluation, gap identification, and templates
**Files:** src/components/tools/SOPMaturityTool.tsx
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

interface SOPArea {
  id: string;
  name: string;
  category: string;
  description: string;
  maturity: number; // 0-5
  importance: number; // 1-5 (how critical is this SOP)
  hasDocumentation: boolean;
}

interface SOPMaturityData {
  areas: SOPArea[];
  notes: string;
  lastUpdated: number;
}

// Predefined SOP areas organized by category
const sopAreasConfig = [
  // Operations
  { id: 'ops-onboarding', name: 'Employee Onboarding', category: 'Operations', description: 'New hire orientation and training process' },
  { id: 'ops-offboarding', name: 'Employee Offboarding', category: 'Operations', description: 'Exit procedures and knowledge transfer' },
  { id: 'ops-procurement', name: 'Procurement & Purchasing', category: 'Operations', description: 'Vendor selection and purchase approvals' },
  { id: 'ops-inventory', name: 'Inventory Management', category: 'Operations', description: 'Stock tracking and reorder processes' },

  // Customer
  { id: 'cust-sales', name: 'Sales Process', category: 'Customer', description: 'Lead to close workflow' },
  { id: 'cust-support', name: 'Customer Support', category: 'Customer', description: 'Issue resolution and escalation' },
  { id: 'cust-onboard', name: 'Customer Onboarding', category: 'Customer', description: 'New customer setup and training' },
  { id: 'cust-feedback', name: 'Feedback Collection', category: 'Customer', description: 'Customer feedback and NPS processes' },

  // Finance
  { id: 'fin-invoicing', name: 'Invoicing & Billing', category: 'Finance', description: 'Invoice generation and collections' },
  { id: 'fin-expenses', name: 'Expense Management', category: 'Finance', description: 'Expense submission and approval' },
  { id: 'fin-reporting', name: 'Financial Reporting', category: 'Finance', description: 'Monthly/quarterly financial reports' },

  // Quality
  { id: 'qa-review', name: 'Quality Review', category: 'Quality', description: 'Product/service quality checks' },
  { id: 'qa-incident', name: 'Incident Response', category: 'Quality', description: 'Issue identification and resolution' },
  { id: 'qa-compliance', name: 'Compliance Checks', category: 'Quality', description: 'Regulatory compliance verification' }
];

const maturityLevels = [
  { level: 0, label: 'Non-existent', description: 'No process defined' },
  { level: 1, label: 'Ad-hoc', description: 'Process exists but inconsistent' },
  { level: 2, label: 'Defined', description: 'Process documented but not followed' },
  { level: 3, label: 'Managed', description: 'Process followed and measured' },
  { level: 4, label: 'Optimized', description: 'Process continuously improved' },
  { level: 5, label: 'Automated', description: 'Process automated where possible' }
];

const templateSuggestions: Record<string, string[]> = {
  'Employee Onboarding': ['First Day Checklist', 'Training Schedule Template', '30-60-90 Day Plan'],
  'Employee Offboarding': ['Exit Checklist', 'Knowledge Transfer Document', 'Equipment Return Form'],
  'Sales Process': ['Discovery Call Script', 'Proposal Template', 'Contract Checklist'],
  'Customer Support': ['Ticket Triage Guide', 'Escalation Matrix', 'Response Templates'],
  'Customer Onboarding': ['Welcome Email Sequence', 'Setup Checklist', 'Training Agenda'],
  'Invoicing & Billing': ['Invoice Template', 'Payment Terms Document', 'Collection Timeline'],
  'Expense Management': ['Expense Policy', 'Approval Workflow', 'Reimbursement Form'],
  'Quality Review': ['QA Checklist', 'Review Criteria', 'Sign-off Form'],
  'Incident Response': ['Severity Classification', 'Response Playbook', 'Post-mortem Template']
};

const defaultAreas: SOPArea[] = sopAreasConfig.map(area => ({
  ...area,
  maturity: 1,
  importance: 3,
  hasDocumentation: false
}));

const defaultData: SOPMaturityData = {
  areas: defaultAreas,
  notes: '',
  lastUpdated: Date.now()
};

export default function SOPMaturityTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<SOPMaturityData>(
    (data as SOPMaturityData) || defaultData
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (data) setFormData(data as SOPMaturityData);
  }, [data]);

  const updateArea = (areaId: string, updates: Partial<SOPArea>) => {
    const updated = {
      ...formData,
      areas: formData.areas.map(a =>
        a.id === areaId ? { ...a, ...updates } : a
      ),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate overall maturity and identify gaps
  const analysis = useMemo(() => {
    const avgMaturity = formData.areas.reduce((a, b) => a + b.maturity, 0) / formData.areas.length;

    // Gap score = importance * (5 - maturity) - higher means more critical gap
    const gaps = formData.areas
      .map(area => ({
        ...area,
        gapScore: area.importance * (5 - area.maturity)
      }))
      .filter(a => a.maturity < 3) // Only consider immature processes
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 3);

    const categories = [...new Set(formData.areas.map(a => a.category))];
    const categoryScores = categories.map(cat => ({
      category: cat,
      avgMaturity: formData.areas
        .filter(a => a.category === cat)
        .reduce((sum, a) => sum + a.maturity, 0) / formData.areas.filter(a => a.category === cat).length
    }));

    return { avgMaturity, gaps, categoryScores };
  }, [formData.areas]);

  const getMaturityColor = (level: number) => {
    if (level >= 4) return 'success';
    if (level >= 3) return 'success';
    if (level >= 2) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">SOP Maturity Score</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold">{analysis.avgMaturity.toFixed(1)}</span>
              <span className="text-gray-500">/ 5.0</span>
              <Badge variant={getMaturityColor(analysis.avgMaturity)}>
                {maturityLevels.find(l => l.level === Math.round(analysis.avgMaturity))?.label || 'Developing'}
              </Badge>
            </div>

            {/* Category breakdown */}
            <div className="space-y-2">
              {analysis.categoryScores.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                  className={`w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 ${
                    selectedCategory === cat.category ? 'bg-indigo-50' : ''
                  }`}
                >
                  <span className="text-sm">{cat.category}</span>
                  <Badge size="sm" variant={getMaturityColor(cat.avgMaturity)}>
                    {cat.avgMaturity.toFixed(1)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Critical Gaps (SOP-02) */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              🎯 Top 3 Critical SOPs Needed
            </h4>
            <div className="space-y-2">
              {analysis.gaps.map((gap, idx) => (
                <div key={gap.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{gap.name}</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">{gap.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-gray-500">Current: Level {gap.maturity}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Importance: {gap.importance}/5</span>
                  </div>

                  {/* Template Suggestions (SOP-03) */}
                  {templateSuggestions[gap.name] && (
                    <div className="mt-2 pt-2 border-t border-amber-200">
                      <span className="text-xs font-medium text-amber-800">Suggested Templates:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {templateSuggestions[gap.name].map(template => (
                          <span key={template} className="text-xs px-2 py-0.5 bg-amber-100 rounded">
                            {template}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {analysis.gaps.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  All processes are at acceptable maturity levels (3+)
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* SOP Area Assessment (SOP-01) */}
      <Card>
        <CardHeader>
          <CardTitle>Process Maturity Assessment</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 mb-4">
          Rate each process area's current maturity level (0-5) and importance to your business.
        </p>

        <div className="space-y-4">
          {formData.areas
            .filter(area => !selectedCategory || area.category === selectedCategory)
            .map(area => (
              <div key={area.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium">{area.name}</h5>
                    <p className="text-sm text-gray-500">{area.description}</p>
                    <span className="text-xs text-gray-400">{area.category}</span>
                  </div>
                  <Badge size="sm" variant={area.hasDocumentation ? 'success' : 'warning'}>
                    {area.hasDocumentation ? 'Documented' : 'Undocumented'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  {/* Maturity Level */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Maturity Level</label>
                    <div className="flex gap-1">
                      {maturityLevels.map(level => (
                        <button
                          key={level.level}
                          onClick={() => !readonly && updateArea(area.id, { maturity: level.level })}
                          className={`flex-1 py-2 text-xs rounded transition-colors ${
                            area.maturity === level.level
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          disabled={readonly}
                          title={`${level.label}: ${level.description}`}
                        >
                          {level.level}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {maturityLevels[area.maturity]?.label}: {maturityLevels[area.maturity]?.description}
                    </div>
                  </div>

                  {/* Importance */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Business Importance</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => !readonly && updateArea(area.id, { importance: level })}
                          className={`flex-1 py-2 text-xs rounded transition-colors ${
                            area.importance === level
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          disabled={readonly}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {area.importance <= 2 ? 'Low' : area.importance >= 4 ? 'Critical' : 'Moderate'} importance
                    </div>
                  </div>
                </div>

                {/* Has documentation toggle */}
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={area.hasDocumentation}
                      onChange={(e) => !readonly && updateArea(area.id, { hasDocumentation: e.target.checked })}
                      disabled={readonly}
                      className="rounded"
                    />
                    <span className="text-sm">Has existing documentation</span>
                  </label>
                </div>
              </div>
            ))}
        </div>
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
export function validateSOPMaturity(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as SOPMaturityData;

  const lowMaturity = d.areas.filter(a => a.maturity < 2 && a.importance >= 4);
  if (lowMaturity.length > 0) {
    warnings.push(`${lowMaturity.length} critical processes have very low maturity`);
  }

  const undocumented = d.areas.filter(a => !a.hasDocumentation && a.importance >= 3);
  if (undocumented.length > 5) {
    warnings.push(`${undocumented.length} important processes lack documentation`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportSOPMaturityToPDF(data: unknown): PDFSection {
  const d = data as SOPMaturityData;

  const avgMaturity = d.areas.reduce((a, b) => a + b.maturity, 0) / d.areas.length;
  const gaps = d.areas
    .map(area => ({ ...area, gapScore: area.importance * (5 - area.maturity) }))
    .filter(a => a.maturity < 3)
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 3);

  return {
    title: 'SOP Maturity Assessment',
    summary: `Average Maturity: ${avgMaturity.toFixed(1)}/5.0`,
    tables: [{
      headers: ['SOP Area', 'Category', 'Maturity', 'Importance', 'Documented'],
      rows: d.areas.map(a => [
        a.name,
        a.category,
        `${a.maturity}/5`,
        `${a.importance}/5`,
        a.hasDocumentation ? 'Yes' : 'No'
      ])
    }],
    insights: [
      `Overall SOP maturity: ${avgMaturity.toFixed(1)}/5.0`,
      `Top 3 critical gaps: ${gaps.map(g => g.name).join(', ') || 'None identified'}`,
      ...gaps.map(g => `${g.name}: Consider templates - ${(templateSuggestions[g.name] || []).join(', ')}`)
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'sop-maturity',
    name: 'SOP Maturity',
    description: 'Evaluate process maturity and identify critical SOP gaps with template suggestions',
    category: 'assessment',
    order: 8,
    estimatedTime: 15
  },
  component: SOPMaturityTool,
  validate: validateSOPMaturity,
  exportToPDF: exportSOPMaturityToPDF,
  getDefaultData: () => defaultData
});
```

### Task 2: Update Tool Registry Index

**Action:** Import the SOP Maturity tool
**Files:** src/lib/tools/index.ts
**Details:**

```typescript
import '../../components/tools/SOPMaturityTool';
```

### Task 3: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] SOP Maturity tool renders with all SOP areas grouped by category
- [ ] Each area has maturity level selector (0-5)
- [ ] Each area has importance selector (1-5)
- [ ] Documentation toggle works for each area
- [ ] Top 3 critical SOPs identified correctly (importance × gap)
- [ ] Template suggestions display for identified gaps
- [ ] Category filtering works
- [ ] Overall maturity score calculates correctly
- [ ] Data persists after refresh
- [ ] Tool appears in navigation at position 8
- [ ] Build completes successfully

## Must-Haves

- SOP-01: Current process maturity evaluation (0-5 scale) for 14 process areas
- SOP-02: Identification of top 3 critical SOPs based on importance × maturity gap
- SOP-03: Template suggestions for identified SOP gaps
- Category breakdown visualization
- Self-registering tool pattern
