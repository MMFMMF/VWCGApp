---
wave: 3
depends_on:
  - 01-PLAN-90day-roadmap
  - 02-PLAN-synthesis-rules
files_modified:
  - src/components/tools/InsightsDashboard.tsx
  - src/stores/workspaceStore.ts
  - src/lib/tools/index.ts
autonomous: true
---

# Plan: Synthesis Integration (Auto-Synthesis & Insight Display)

## Objective

Implement automatic synthesis triggering on state changes and a comprehensive insights dashboard displaying synthesized findings with severity badges and recommendations.

## Tasks

### Task 1: Update Workspace Store for Auto-Synthesis

**Action:** Add synthesis result storage and auto-synthesis trigger
**Files:** src/stores/workspaceStore.ts
**Details:**

Add to the workspace store:

```typescript
// Add to state interface
synthesisResult: SynthesisResult | null;

// Add to actions
runSynthesis: () => void;

// Implementation
runSynthesis: () => {
  const state = get();
  const { synthesisRuleRegistry } = await import('@lib/synthesis/rules');

  const context: SynthesisContext = {
    tools: state.currentWorkspace?.toolData || {},
    meta: {
      companyName: state.currentWorkspace?.name || '',
      assessmentDate: new Date().toISOString()
    }
  };

  const result = synthesisRuleRegistry.evaluateAll(context);

  set(state => ({
    ...state,
    synthesisResult: result
  }));
}

// Modify updateToolData to trigger synthesis after update
updateToolData: (toolId, data) => {
  set(state => {
    // ... existing update logic
  });

  // Trigger synthesis after state update (debounced)
  setTimeout(() => get().runSynthesis(), 500);
}
```

### Task 2: Create Insights Dashboard Component

**Action:** Create comprehensive insights display with severity badges
**Files:** src/components/tools/InsightsDashboard.tsx
**Details:**

```typescript
import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import { useWorkspaceStore } from '@stores/workspaceStore';
import type { Insight, SynthesisResult } from '@lib/synthesis/types';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';

interface InsightsDashboardData {
  lastViewed: number;
  dismissedInsights: string[];
}

const defaultData: InsightsDashboardData = {
  lastViewed: Date.now(),
  dismissedInsights: []
};

const insightTypeConfig = {
  gap: {
    label: 'Gap',
    icon: '⚠️',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  warning: {
    label: 'Warning',
    icon: '🚨',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  opportunity: {
    label: 'Opportunity',
    icon: '💡',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  strength: {
    label: 'Strength',
    icon: '✨',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};

const severityConfig = {
  5: { label: 'Critical', variant: 'danger' as const, bgColor: 'bg-red-600' },
  4: { label: 'High', variant: 'danger' as const, bgColor: 'bg-red-500' },
  3: { label: 'Medium', variant: 'warning' as const, bgColor: 'bg-amber-500' },
  2: { label: 'Low', variant: 'success' as const, bgColor: 'bg-blue-500' },
  1: { label: 'Info', variant: 'success' as const, bgColor: 'bg-green-500' }
};

export default function InsightsDashboard({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<InsightsDashboardData>(
    (data as InsightsDashboardData) || defaultData
  );
  const [filterType, setFilterType] = useState<Insight['type'] | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<number | 'all'>('all');

  const synthesisResult = useWorkspaceStore(state => state.synthesisResult);
  const runSynthesis = useWorkspaceStore(state => state.runSynthesis);

  useEffect(() => {
    if (data) setFormData(data as InsightsDashboardData);
  }, [data]);

  // Trigger synthesis on mount if no results
  useEffect(() => {
    if (!synthesisResult) {
      runSynthesis();
    }
  }, [synthesisResult, runSynthesis]);

  // Filter insights
  const filteredInsights = useMemo(() => {
    if (!synthesisResult?.insights) return [];

    return synthesisResult.insights.filter(insight => {
      // Filter out dismissed
      if (formData.dismissedInsights.includes(insight.id)) return false;

      // Apply type filter
      if (filterType !== 'all' && insight.type !== filterType) return false;

      // Apply severity filter
      if (filterSeverity !== 'all' && insight.severity !== filterSeverity) return false;

      return true;
    });
  }, [synthesisResult, formData.dismissedInsights, filterType, filterSeverity]);

  // Statistics
  const stats = useMemo(() => {
    if (!synthesisResult?.insights) {
      return { total: 0, byType: {}, bySeverity: {}, critical: 0 };
    }

    const activeInsights = synthesisResult.insights.filter(
      i => !formData.dismissedInsights.includes(i.id)
    );

    return {
      total: activeInsights.length,
      byType: {
        gap: activeInsights.filter(i => i.type === 'gap').length,
        warning: activeInsights.filter(i => i.type === 'warning').length,
        opportunity: activeInsights.filter(i => i.type === 'opportunity').length,
        strength: activeInsights.filter(i => i.type === 'strength').length
      },
      bySeverity: {
        critical: activeInsights.filter(i => i.severity >= 4).length,
        medium: activeInsights.filter(i => i.severity === 3).length,
        low: activeInsights.filter(i => i.severity <= 2).length
      },
      critical: activeInsights.filter(i => i.severity >= 4).length
    };
  }, [synthesisResult, formData.dismissedInsights]);

  const dismissInsight = (insightId: string) => {
    const updated = {
      ...formData,
      dismissedInsights: [...formData.dismissedInsights, insightId]
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const restoreAllInsights = () => {
    const updated = {
      ...formData,
      dismissedInsights: []
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Synthesis Insights</h3>
            <p className="text-sm text-gray-500">
              {stats.total} active insights • {synthesisResult?.rulesEvaluated || 0} rules evaluated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={runSynthesis}>
              Refresh
            </Button>
            {formData.dismissedInsights.length > 0 && (
              <Button size="sm" variant="secondary" onClick={restoreAllInsights}>
                Restore ({formData.dismissedInsights.length})
              </Button>
            )}
          </div>
        </div>

        {/* Type Summary */}
        <div className="flex gap-4 mt-4">
          {Object.entries(insightTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type as Insight['type'])}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filterType === type
                  ? `${config.bgColor} ${config.borderColor} border-2`
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
              <Badge size="sm" variant={stats.byType[type as keyof typeof stats.byType] > 0 ? 'warning' : 'secondary'}>
                {stats.byType[type as keyof typeof stats.byType] || 0}
              </Badge>
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 mt-4">
          <span className="text-sm text-gray-500 self-center">Severity:</span>
          <Button
            size="sm"
            variant={filterSeverity === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterSeverity('all')}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map(sev => (
            <Button
              key={sev}
              size="sm"
              variant={filterSeverity === sev ? 'primary' : 'secondary'}
              onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
            >
              {severityConfig[sev as keyof typeof severityConfig].label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Critical Alerts Banner */}
      {stats.critical > 0 && (
        <Card className="bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h4 className="font-semibold text-red-800">
                {stats.critical} Critical Finding{stats.critical !== 1 ? 's' : ''} Require Attention
              </h4>
              <p className="text-sm text-red-600">
                Review high-severity insights below to address important gaps and risks.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Insights List (SYN-09) */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              {synthesisResult?.insights.length === 0 ? (
                <>
                  <p className="text-lg mb-2">No insights generated yet</p>
                  <p className="text-sm">Complete more assessments to enable cross-tool analysis.</p>
                </>
              ) : filterType !== 'all' || filterSeverity !== 'all' ? (
                <>
                  <p className="text-lg mb-2">No matching insights</p>
                  <p className="text-sm">Try adjusting your filters.</p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">All insights dismissed</p>
                  <p className="text-sm">Click "Restore" to view dismissed insights.</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          filteredInsights.map(insight => {
            const typeConfig = insightTypeConfig[insight.type];
            const sevConfig = severityConfig[insight.severity as keyof typeof severityConfig];

            return (
              <Card
                key={insight.id}
                className={`${typeConfig.bgColor} ${typeConfig.borderColor} border-l-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{typeConfig.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant={sevConfig.variant} size="sm">
                          {sevConfig.label}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>

                      {/* Recommendation */}
                      <div className="bg-white bg-opacity-50 rounded p-3 mb-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">Recommendation</div>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>

                      {/* Affected Tools */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Related tools:</span>
                        {insight.affectedTools.map(toolId => (
                          <Badge key={toolId} variant="secondary" size="sm">
                            {toolId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!readonly && (
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                      title="Dismiss this insight"
                    >
                      ×
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Skipped Rules Info */}
      {synthesisResult && synthesisResult.rulesSkipped.length > 0 && (
        <Card className="bg-gray-50">
          <div className="flex items-start gap-2">
            <span>ℹ️</span>
            <div>
              <h4 className="font-medium text-sm">
                {synthesisResult.rulesSkipped.length} rule(s) skipped due to missing data
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Complete more assessments to enable additional synthesis rules:
                {synthesisResult.rulesSkipped.slice(0, 3).join(', ')}
                {synthesisResult.rulesSkipped.length > 3 && ` and ${synthesisResult.rulesSkipped.length - 3} more`}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Validation
export function validateInsightsDashboard(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // No validation needed for this tool - it's read-only synthesis output
  return { valid: true, errors, warnings };
}

// PDF Export
export function exportInsightsToPDF(data: unknown): PDFSection {
  // This will be enhanced to include synthesis results
  return {
    title: 'Synthesis Insights',
    summary: 'Cross-tool analysis findings',
    tables: [],
    insights: ['Complete assessments to generate synthesis insights'],
    rawData: data
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'insights-dashboard',
    name: 'Insights Dashboard',
    description: 'View synthesized insights from cross-tool analysis',
    category: 'synthesis',
    order: 10,
    estimatedTime: 5
  },
  component: InsightsDashboard,
  validate: validateInsightsDashboard,
  exportToPDF: exportInsightsToPDF,
  getDefaultData: () => defaultData
});
```

### Task 3: Update Tool Registry Index

**Action:** Import the Insights Dashboard and synthesis rules
**Files:** src/lib/tools/index.ts
**Details:**

Add at end of file:
```typescript
import '../../components/tools/InsightsDashboard';
import '../synthesis/rules'; // Trigger rule registration
```

### Task 4: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Synthesis triggers automatically after tool data updates
- [ ] Insights Dashboard displays all generated insights
- [ ] Severity badges show correctly (Critical/High/Medium/Low/Info)
- [ ] Type icons and colors display correctly (Gap/Warning/Opportunity/Strength)
- [ ] Filter by type works
- [ ] Filter by severity works
- [ ] Dismiss insight works and persists
- [ ] Restore dismissed insights works
- [ ] Refresh button triggers new synthesis
- [ ] Skipped rules message shows correctly
- [ ] Build completes successfully

## Must-Haves

- SYN-08: Automatic synthesis on every state update
- SYN-09: Insight display with severity badges, recommendations, related tools
- Type filtering (gap/warning/opportunity/strength)
- Severity filtering (1-5)
- Dismiss/restore functionality
- Critical alerts banner for high-severity findings
- Self-registering tool pattern
