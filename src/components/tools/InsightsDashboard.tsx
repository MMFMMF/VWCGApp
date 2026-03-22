import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import { useWorkspaceStore } from '../../store/workspaceStore';
import type { Insight as EngineInsight } from '../../engine/types';
import {
  Card,
  Button,
  Badge
} from '@components/shared';

// Normalize Architecture A insight shape to the UI display shape
interface DisplayInsight {
  id: string;
  type: 'gap' | 'warning' | 'opportunity' | 'strength';
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  recommendation: string;
  affectedTools: string[];
}

function adaptInsight(insight: EngineInsight): DisplayInsight {
  // Map Architecture A types to display types
  const typeMap: Record<EngineInsight['type'], DisplayInsight['type']> = {
    risk: 'warning',
    conflict: 'gap',
    opportunity: 'opportunity',
    strength: 'strength'
  };
  // Map string severity to numeric severity
  const severityMap: Record<EngineInsight['severity'], DisplayInsight['severity']> = {
    high: 5,
    medium: 3,
    low: 1
  };
  return {
    id: insight.id,
    type: typeMap[insight.type],
    severity: severityMap[insight.severity],
    title: insight.title,
    description: insight.message,
    recommendation: insight.recommendation,
    affectedTools: insight.relatedTools
  };
}

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
  const [filterType, setFilterType] = useState<DisplayInsight['type'] | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<number | 'all'>('all');

  const rawInsights = useWorkspaceStore(state => state.insights);
  const tools = useWorkspaceStore(state => state.tools);
  const refreshInsights = useWorkspaceStore(state => state.refreshInsights);

  // Normalize engine insights to display shape
  const insights: DisplayInsight[] = useMemo(() => rawInsights.map(adaptInsight), [rawInsights]);

  useEffect(() => {
    if (data) setFormData(data as InsightsDashboardData);
  }, [data]);

  // Trigger synthesis on mount if insights are empty but tools exist
  useEffect(() => {
    if (rawInsights.length === 0 && Object.keys(tools).length > 0) {
      refreshInsights();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Count completed tools for status messaging
  const completedToolCount = Object.keys(tools).length;

  // Filter insights
  const filteredInsights = useMemo(() => {
    return insights.filter((insight: DisplayInsight) => {
      // Filter out dismissed
      if (formData.dismissedInsights.includes(insight.id)) return false;

      // Apply type filter
      if (filterType !== 'all' && insight.type !== filterType) return false;

      // Apply severity filter
      if (filterSeverity !== 'all' && insight.severity !== filterSeverity) return false;

      return true;
    });
  }, [insights, formData.dismissedInsights, filterType, filterSeverity]);

  // Statistics
  const stats = useMemo(() => {
    const activeInsights = insights.filter(
      (i: DisplayInsight) => !formData.dismissedInsights.includes(i.id)
    );

    return {
      total: activeInsights.length,
      byType: {
        gap: activeInsights.filter((i: DisplayInsight) => i.type === 'gap').length,
        warning: activeInsights.filter((i: DisplayInsight) => i.type === 'warning').length,
        opportunity: activeInsights.filter((i: DisplayInsight) => i.type === 'opportunity').length,
        strength: activeInsights.filter((i: DisplayInsight) => i.type === 'strength').length
      },
      bySeverity: {
        critical: activeInsights.filter((i: DisplayInsight) => i.severity >= 4).length,
        medium: activeInsights.filter((i: DisplayInsight) => i.severity === 3).length,
        low: activeInsights.filter((i: DisplayInsight) => i.severity <= 2).length
      },
      critical: activeInsights.filter((i: DisplayInsight) => i.severity >= 4).length
    };
  }, [insights, formData.dismissedInsights]);

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
              {stats.total} active insights • {completedToolCount} tool{completedToolCount !== 1 ? 's' : ''} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={refreshInsights}>
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
              onClick={() => setFilterType(filterType === type ? 'all' : type as DisplayInsight['type'])}
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
              {insights.length === 0 ? (
                <>
                  <p className="text-lg mb-2">No insights generated yet</p>
                  <p className="text-sm">
                    {completedToolCount === 0
                      ? 'Complete at least two assessments to enable cross-tool analysis.'
                      : completedToolCount === 1
                      ? 'Complete at least one more assessment to enable cross-tool analysis.'
                      : 'No patterns detected yet. Complete additional assessments or click Refresh.'}
                  </p>
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
          filteredInsights.map((insight: DisplayInsight) => {
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

      {/* Tool completion hint */}
      {completedToolCount > 0 && completedToolCount < 2 && insights.length === 0 && (
        <Card className="bg-gray-50">
          <div className="flex items-start gap-2">
            <span>ℹ️</span>
            <div>
              <h4 className="font-medium text-sm">
                Cross-tool analysis requires at least 2 completed assessments
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                You have {completedToolCount} assessment completed. Finish one more to unlock synthesis insights.
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
  // Pull live insights from Architecture A store at export time
  const storeInsights = useWorkspaceStore.getState().insights;
  const adapted = storeInsights.map(adaptInsight);

  const insightLines = adapted.length > 0
    ? adapted.map(i => `[${i.type.toUpperCase()} | Severity ${i.severity}] ${i.title}: ${i.description} — Recommendation: ${i.recommendation}`)
    : ['No synthesis insights generated. Complete at least two assessments to enable cross-tool analysis.'];

  return {
    title: 'Synthesis Insights',
    summary: `${adapted.length} insight${adapted.length !== 1 ? 's' : ''} generated from cross-tool analysis`,
    tables: [],
    insights: insightLines,
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
