/**
 * TEMPLATE: Copy this file to create a new synthesis rule
 *
 * Naming convention: {code}-{descriptive-name}.ts
 * Example: E1-execution-capability-gap.ts
 */

import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

/**
 * Rule: [Name]
 * Code: [E1-E11]
 *
 * Description: [What this rule detects]
 *
 * Triggers when:
 * - [Condition 1]
 * - [Condition 2]
 *
 * Required tools:
 * - [tool-id-1] - [what data is used]
 * - [tool-id-2] - [what data is used]
 */
const exampleRule: SynthesisRule = {
  id: 'EXAMPLE-rule-name',
  name: 'Example Rule Name',
  description: 'Detects [specific condition] across [relevant tools]',
  requiredTools: ['tool-id-1', 'tool-id-2'],

  evaluate: (context: SynthesisContext): Insight[] => {
    const tool1Data = context.tools['tool-id-1'] as any;
    const tool2Data = context.tools['tool-id-2'] as any;

    const insights: Insight[] = [];

    // TODO: Implement rule logic
    // Example:
    // const metricValue = tool1Data?.someMetric || 0;
    // const threshold = 6;
    //
    // if (metricValue < threshold) {
    //   insights.push({
    //     id: `EXAMPLE-${Date.now()}`,
    //     ruleId: 'EXAMPLE-rule-name',
    //     type: 'gap',
    //     severity: 4,
    //     title: 'Gap Detected',
    //     description: `Metric value (${metricValue}) is below threshold (${threshold}).`,
    //     recommendation: 'Take action X to improve metric.',
    //     affectedTools: ['tool-id-1', 'tool-id-2'],
    //     data: { metricValue, threshold }
    //   });
    // }

    return insights;
  },

  // Optional: Calculate scores for synthesis dashboard
  calculateScores: (context: SynthesisContext) => {
    // const tool1Data = context.tools['tool-id-1'] as any;
    // return {
    //   exampleScore: tool1Data?.someMetric || 0
    // };
    return {};
  }
};

// Auto-register when this module is imported
synthesisRuleRegistry.register(exampleRule);

export default exampleRule;
