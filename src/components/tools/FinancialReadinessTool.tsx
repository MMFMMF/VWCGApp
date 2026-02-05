import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
  Card,
  CardHeader,
  CardTitle,
  SliderInput,
  Button,
  Badge
} from '@components/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface FinancialReadinessData {
  indicators: {
    cashFlow: number;         // 0-100: positive cash flow health
    runway: number;           // 0-100: months of runway normalized
    debtToEquity: number;     // 0-100: lower is better (inverted)
    profitMargin: number;     // 0-100: gross margin percentage
    revenueGrowth: number;    // 0-100: YoY growth normalized
    customerConcentration: number; // 0-100: diversification (higher = better)
    recurringRevenue: number; // 0-100: % of recurring vs one-time
    collectionDays: number;   // 0-100: faster collection = higher score
  };
  notes: string;
  lastUpdated: number;
}

const indicatorConfig = [
  {
    key: 'cashFlow',
    label: 'Cash Flow Health',
    description: 'Positive operating cash flow and cash management',
    weight: 15
  },
  {
    key: 'runway',
    label: 'Financial Runway',
    description: 'Months of operating expenses covered by reserves',
    weight: 15
  },
  {
    key: 'debtToEquity',
    label: 'Debt Management',
    description: 'Healthy debt-to-equity ratio and manageable obligations',
    weight: 10
  },
  {
    key: 'profitMargin',
    label: 'Profit Margins',
    description: 'Gross and net profit margin health',
    weight: 15
  },
  {
    key: 'revenueGrowth',
    label: 'Revenue Growth',
    description: 'Year-over-year revenue growth trajectory',
    weight: 15
  },
  {
    key: 'customerConcentration',
    label: 'Customer Diversification',
    description: 'Revenue spread across customer base',
    weight: 10
  },
  {
    key: 'recurringRevenue',
    label: 'Revenue Predictability',
    description: 'Percentage of recurring vs one-time revenue',
    weight: 10
  },
  {
    key: 'collectionDays',
    label: 'Collection Efficiency',
    description: 'Speed of receivables collection',
    weight: 10
  }
] as const;

type IndicatorKey = typeof indicatorConfig[number]['key'];

const defaultData: FinancialReadinessData = {
  indicators: {
    cashFlow: 50,
    runway: 50,
    debtToEquity: 50,
    profitMargin: 50,
    revenueGrowth: 50,
    customerConcentration: 50,
    recurringRevenue: 50,
    collectionDays: 50
  },
  notes: '',
  lastUpdated: Date.now()
};

export default function FinancialReadinessTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<FinancialReadinessData>(
    (data as FinancialReadinessData) || defaultData
  );

  useEffect(() => {
    if (data) setFormData(data as FinancialReadinessData);
  }, [data]);

  const handleIndicatorChange = (key: IndicatorKey, value: number) => {
    const updated = {
      ...formData,
      indicators: { ...formData.indicators, [key]: value },
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Calculate weighted risk score
  const { riskScore, indicatorScores } = useMemo(() => {
    let weightedSum = 0;
    let totalWeight = 0;

    const scores = indicatorConfig.map(ind => {
      const value = formData.indicators[ind.key];
      weightedSum += value * ind.weight;
      totalWeight += ind.weight;
      return { ...ind, value };
    });

    return {
      riskScore: 100 - Math.round(weightedSum / totalWeight), // Invert for risk
      indicatorScores: scores
    };
  }, [formData.indicators]);

  // Chart data
  const chartData = useMemo(() =>
    indicatorConfig.map(ind => ({
      name: ind.label.split(' ')[0],
      value: formData.indicators[ind.key],
      fullName: ind.label
    })),
    [formData.indicators]
  );

  const getRiskLevel = (score: number) => {
    if (score <= 20) return { label: 'Low Risk', variant: 'success' as const, color: '#10B981' };
    if (score <= 40) return { label: 'Moderate', variant: 'success' as const, color: '#34D399' };
    if (score <= 60) return { label: 'Elevated', variant: 'warning' as const, color: '#F59E0B' };
    if (score <= 80) return { label: 'High Risk', variant: 'danger' as const, color: '#EF4444' };
    return { label: 'Critical', variant: 'danger' as const, color: '#DC2626' };
  };

  const risk = getRiskLevel(riskScore);

  const getBarColor = (value: number) => {
    if (value >= 70) return '#10B981';
    if (value >= 50) return '#34D399';
    if (value >= 30) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Financial Risk Score</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold">{riskScore}</span>
              <Badge variant={risk.variant}>{risk.label}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Lower scores indicate better financial health.
              Based on 8 weighted indicators.
            </p>

            {/* Risk meter */}
            <div className="relative h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-gray-800 rounded"
                style={{ left: `calc(${riskScore}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Health Score']}
                  labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Indicators</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 mb-6">
          Rate each indicator from 0 (poor) to 100 (excellent) based on your current financial position.
        </p>

        <div className="space-y-6">
          {indicatorConfig.map(ind => (
            <SliderInput
              key={ind.key}
              label={ind.label}
              description={ind.description}
              value={formData.indicators[ind.key]}
              min={0}
              max={100}
              step={5}
              onChange={(v) => handleIndicatorChange(ind.key, v)}
              disabled={readonly}
            />
          ))}
        </div>
      </Card>

      {/* Key Concerns */}
      <Card>
        <CardHeader>
          <CardTitle>Areas Needing Attention</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {indicatorScores
            .filter(ind => ind.value < 40)
            .sort((a, b) => a.value - b.value)
            .map(ind => (
              <div key={ind.key} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                <Badge variant="danger" size="sm">{ind.value}%</Badge>
                <span className="text-sm text-red-800">{ind.label}</span>
                <span className="text-xs text-red-600 ml-auto">{ind.description}</span>
              </div>
            ))}
          {indicatorScores.filter(ind => ind.value < 40).length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No critical concerns identified. All indicators above 40%.
            </p>
          )}
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
export function validateFinancialReadiness(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as FinancialReadinessData;

  // Check for all defaults
  const allDefaults = Object.values(d.indicators).every(v => v === 50);
  if (allDefaults) {
    warnings.push('All indicators at default - please assess each area');
  }

  // Check for critical indicators
  const critical = Object.entries(d.indicators)
    .filter(([_, v]) => v < 25)
    .map(([k]) => indicatorConfig.find(i => i.key === k)?.label);

  if (critical.length > 0) {
    warnings.push(`Critical concerns: ${critical.join(', ')}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportFinancialReadinessToPDF(data: unknown): PDFSection {
  const d = data as FinancialReadinessData;

  let weightedSum = 0;
  let totalWeight = 0;
  indicatorConfig.forEach(ind => {
    weightedSum += d.indicators[ind.key] * ind.weight;
    totalWeight += ind.weight;
  });
  const riskScore = 100 - Math.round(weightedSum / totalWeight);

  return {
    title: 'Financial Readiness Assessment',
    summary: `Risk Score: ${riskScore}/100 (${riskScore <= 40 ? 'Healthy' : riskScore <= 60 ? 'Moderate' : 'Elevated'})`,
    charts: [{
      type: 'bar',
      data: indicatorConfig.map(ind => ({
        label: ind.label,
        value: d.indicators[ind.key]
      }))
    }],
    tables: [{
      headers: ['Indicator', 'Score', 'Weight', 'Status'],
      rows: indicatorConfig.map(ind => [
        ind.label,
        `${d.indicators[ind.key]}%`,
        `${ind.weight}%`,
        d.indicators[ind.key] >= 60 ? 'Healthy' : d.indicators[ind.key] >= 40 ? 'Monitor' : 'Concern'
      ])
    }],
    insights: [
      `Overall financial risk score: ${riskScore}/100`,
      ...indicatorConfig
        .filter(ind => d.indicators[ind.key] < 40)
        .map(ind => `${ind.label} needs attention (${d.indicators[ind.key]}%)`)
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'financial-readiness',
    name: 'Financial Readiness',
    description: 'Evaluate financial health across 8 key indicators with risk score',
    category: 'assessment',
    order: 7,
    estimatedTime: 10
  },
  component: FinancialReadinessTool,
  validate: validateFinancialReadiness,
  exportToPDF: exportFinancialReadinessToPDF,
  getDefaultData: () => defaultData
});
