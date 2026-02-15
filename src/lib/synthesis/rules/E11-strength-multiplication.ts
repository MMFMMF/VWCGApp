import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E11-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E11 — Strength Multiplication
 * Identifies when multiple assessment areas show compounding strength
 */
const E11StrengthMultiplicationRule: SynthesisRule = {
  id: 'E11-strength-multiplication',
  name: 'Compounding Advantage',
  description: 'Detects multiplicative advantages across multiple dimensions',
  requiredTools: ['leadership-dna', 'ai-readiness', 'business-eq'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const leadershipData = context.tools['leadership-dna'] as {
      dimensions?: Record<string, { current: number }>;
    } | undefined;

    const aiData = context.tools['ai-readiness'] as {
      dimensions?: Record<string, number>;
    } | undefined;

    const eqData = context.tools['business-eq'] as {
      entries?: Array<{ dimensions: Record<string, number> }>;
    } | undefined;

    // Calculate strength indicators
    const strengths: { area: string; score: number }[] = [];

    // Leadership: check for high scores (>= 7)
    if (leadershipData?.dimensions) {
      Object.entries(leadershipData.dimensions).forEach(([key, val]) => {
        if (val.current >= 7) {
          strengths.push({ area: `Leadership: ${key}`, score: val.current });
        }
      });
    }

    // AI Readiness: check for high scores (>= 70)
    if (aiData?.dimensions) {
      Object.entries(aiData.dimensions).forEach(([key, val]) => {
        if (val >= 70) {
          strengths.push({ area: `AI: ${key}`, score: val });
        }
      });
    }

    // Business EQ: check latest entry for high scores (>= 70)
    if (eqData?.entries && eqData.entries.length > 0) {
      const latestEntry = eqData.entries[eqData.entries.length - 1];
      Object.entries(latestEntry.dimensions).forEach(([key, val]) => {
        if (val >= 70) {
          strengths.push({ area: `EQ: ${key}`, score: val });
        }
      });
    }

    // If 5+ high-scoring areas, it's a multiplicative advantage
    if (strengths.length >= 5) {
      const topStrengths = strengths
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      insights.push({
        id: generateInsightId(),
        ruleId: 'E11-strength-multiplication',
        type: 'strength',
        severity: 1,
        title: 'Compounding Advantages Detected',
        description: `You have ${strengths.length} areas scoring in the top tier across leadership, AI readiness, and emotional intelligence. These create multiplicative advantages: ${topStrengths.map(s => s.area).join(', ')}.`,
        recommendation: 'Leverage these compounding strengths by taking on more ambitious strategic initiatives. Your multi-dimensional strength position is rare and valuable.',
        affectedTools: ['leadership-dna', 'ai-readiness', 'business-eq'],
        data: {
          totalHighScores: strengths.length,
          topStrengths
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E11StrengthMultiplicationRule);
export default E11StrengthMultiplicationRule;
