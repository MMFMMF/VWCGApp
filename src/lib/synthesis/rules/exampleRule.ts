/**
 * Example Synthesis Rule
 *
 * Demonstrates how to create a synthesis rule that analyzes
 * data from the example tool.
 *
 * This is a reference implementation - replace with real business
 * logic rules in production.
 */

import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

interface ExampleToolData {
  dimension1: number;
  dimension2: number;
  dimension3: number;
  category: string;
}

const exampleSynthesisRule: SynthesisRule = {
  id: 'EXAMPLE-low-readiness-alert',
  name: 'Low Readiness Alert',
  description: 'Detects when overall readiness score falls below threshold',
  requiredTools: ['example-tool'],

  evaluate: (context: SynthesisContext): Insight[] => {
    const exampleData = context.tools['example-tool'] as ExampleToolData | undefined;

    if (!exampleData) {
      return [];
    }

    const insights: Insight[] = [];
    const avgScore = (exampleData.dimension1 + exampleData.dimension2 + exampleData.dimension3) / 3;

    // Rule: Alert when average score is below 40%
    if (avgScore < 40) {
      insights.push({
        id: `EXAMPLE-low-readiness-${Date.now()}`,
        ruleId: 'EXAMPLE-low-readiness-alert',
        type: 'warning',
        severity: avgScore < 20 ? 5 : 4,
        title: 'Low Overall Readiness Score',
        description: `Your overall readiness score (${Math.round(avgScore)}%) indicates significant gaps in preparation. ${
          avgScore < 20
            ? 'Critical attention needed before proceeding.'
            : 'Consider addressing key areas before major initiatives.'
        }`,
        recommendation: `Focus on improving your lowest scoring dimension: ${
          exampleData.dimension1 <= exampleData.dimension2 && exampleData.dimension1 <= exampleData.dimension3
            ? 'Strategy Alignment'
            : exampleData.dimension2 <= exampleData.dimension3
            ? 'Operational Readiness'
            : 'Resource Capacity'
        }.`,
        affectedTools: ['example-tool'],
        data: {
          avgScore: Math.round(avgScore),
          dimension1: exampleData.dimension1,
          dimension2: exampleData.dimension2,
          dimension3: exampleData.dimension3
        }
      });
    }

    // Rule: Alert for imbalanced dimensions (one is much lower than others)
    const scores = [exampleData.dimension1, exampleData.dimension2, exampleData.dimension3];
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    if (maxScore - minScore > 40) {
      insights.push({
        id: `EXAMPLE-imbalance-${Date.now()}`,
        ruleId: 'EXAMPLE-low-readiness-alert',
        type: 'gap',
        severity: 3,
        title: 'Dimension Imbalance Detected',
        description: `There's a significant gap (${maxScore - minScore} points) between your strongest and weakest dimensions. This imbalance may limit overall effectiveness.`,
        recommendation: 'Consider balancing your focus across all dimensions for sustainable progress.',
        affectedTools: ['example-tool'],
        data: {
          maxScore,
          minScore,
          gap: maxScore - minScore
        }
      });
    }

    return insights;
  },

  calculateScores: (context: SynthesisContext) => {
    const exampleData = context.tools['example-tool'] as ExampleToolData | undefined;

    if (!exampleData) {
      return {};
    }

    return {
      overallReadiness: Math.round(
        (exampleData.dimension1 + exampleData.dimension2 + exampleData.dimension3) / 3
      ),
      strategyAlignment: exampleData.dimension1,
      operationalReadiness: exampleData.dimension2,
      resourceCapacity: exampleData.dimension3
    };
  }
};

// Auto-register
synthesisRuleRegistry.register(exampleSynthesisRule);

export default exampleSynthesisRule;
