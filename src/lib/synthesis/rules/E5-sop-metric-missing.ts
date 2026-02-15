import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E5-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E5 — SOP Metric Missing
 * Triggers when trying to track metrics without proper process documentation
 */
const E5SOPMetricMissingRule: SynthesisRule = {
  id: 'E5-sop-metric-missing',
  name: 'SOP Foundation Missing',
  description: 'Identifies areas where metrics cannot be trusted due to immature processes',
  requiredTools: ['sop-maturity', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const sopData = context.tools['sop-maturity'] as {
      areas?: { id: string; name: string; maturity: number; importance: number }[];
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      northStar?: { metric: string; target: string };
    } | undefined;

    if (!sopData?.areas || !visionData?.northStar?.metric) {
      return insights;
    }

    // Check if critical processes are immature
    const criticalImmatureSOPs = sopData.areas.filter(
      area => area.importance >= 4 && area.maturity < 3
    );

    if (criticalImmatureSOPs.length > 0) {
      const sopNames = criticalImmatureSOPs.map(s => s.name).join(', ');

      insights.push({
        id: generateInsightId(),
        ruleId: 'E5-sop-metric-missing',
        type: 'warning',
        severity: 4,
        title: 'Unreliable Metrics Risk',
        description: `You're tracking "${visionData.northStar.metric}" as your North Star, but ${criticalImmatureSOPs.length} critical process(es) lack mature SOPs: ${sopNames}. Without standardized processes, metrics may be inconsistent or misleading.`,
        recommendation: 'Prioritize documenting and standardizing these critical processes before heavily relying on metrics. Immature processes produce unreliable data.',
        affectedTools: ['sop-maturity', 'vision-canvas'],
        data: {
          northStarMetric: visionData.northStar.metric,
          immatureProcesses: criticalImmatureSOPs.map(s => ({
            name: s.name,
            maturity: s.maturity,
            importance: s.importance
          }))
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E5SOPMetricMissingRule);
export default E5SOPMetricMissingRule;
