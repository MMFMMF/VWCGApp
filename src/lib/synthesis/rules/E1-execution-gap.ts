import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E1-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E1 — Execution Capability Gap
 * Triggers when Leadership Execution score < 6 AND Vision Canvas has more pillars than capacity suggests
 */
const E1ExecutionGapRule: SynthesisRule = {
  id: 'E1-execution-capability-gap',
  name: 'Execution Capability Gap',
  description: 'Detects mismatch between execution capability and strategic ambition',
  requiredTools: ['leadership-dna', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const leadershipData = context.tools['leadership-dna'] as {
      dimensions?: { execution?: { current: number } };
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      pillars?: { id: string; title: string }[];
    } | undefined;

    if (!leadershipData?.dimensions?.execution || !visionData?.pillars) {
      return insights;
    }

    const executionScore = leadershipData.dimensions.execution.current;
    const pillarCount = visionData.pillars.length;

    // Dynamic limit: higher execution = can handle more pillars
    // Execution 10 → 6 pillars, Execution 5 → 3 pillars, Execution 1 → 1 pillar
    const pillarLimit = Math.max(1, Math.floor(executionScore * 0.6));

    if (executionScore < 6 && pillarCount > pillarLimit) {
      insights.push({
        id: generateInsightId(),
        ruleId: 'E1-execution-capability-gap',
        type: 'gap',
        severity: 4,
        title: 'Execution Capability Gap',
        description: `Your current execution capability score (${executionScore}/10) may not support ${pillarCount} strategic pillars. With current execution strength, ${pillarLimit} pillars would be more manageable.`,
        recommendation: `Consider: (1) Prioritize to ${pillarLimit} pillars for near-term focus, (2) Invest in execution capabilities before expanding scope, or (3) Delegate pillar ownership to reduce personal execution load.`,
        affectedTools: ['leadership-dna', 'vision-canvas'],
        data: {
          executionScore,
          pillarCount,
          recommendedPillars: pillarLimit,
          gap: pillarCount - pillarLimit
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E1ExecutionGapRule);
export default E1ExecutionGapRule;
