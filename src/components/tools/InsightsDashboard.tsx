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

    return synthesisResult.insights.filter((insight: Insight) => {
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
      return { total: 0, byType: { gap: 0, warning: 0, opportunity: 0, strength: 0 }, bySeverity: { critical: 0, medium: 0, low: 0 }, critical: 0 };
    }

    const activeInsights = synthesisResult.insights.filter(
      (i: Insight) => !formData.dismissedInsights.includes(i.id)
    );

    return {
      total: activeInsights.length,
      byType: {
        gap: activeInsights.filter((i: Insight) => i.type === 'gap').length,
        warning: activeInsights.filter((i: Insight) => i.type === 'warning').length,
        opportunity: activeInsights.filter((i: Insight) => i.type === 'opportunity').length,
        strength: activeInsights.filter((i: Insight) => i.type === 'strength').length
      },
      bySeverity: {
        critical: activeInsights.filter((i: Insight) => i.severity >= 4).length,
        medium: activeInsights.filter((i: Insight) => i.severity === 3).length,
        low: activeInsights.filter((i: Insight) => i.severity <= 2).length
      },
      critical: activeInsights.filter((i: Insight) => i.severity >= 4).length
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
          filteredInsights.map((insight: Insight) => {
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
                        {insight.affectedTools.map((toolId: string) => (
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
