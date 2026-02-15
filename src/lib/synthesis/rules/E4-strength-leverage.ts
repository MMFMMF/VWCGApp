import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E4-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E4 — Strength Leverage
 * Triggers when high-confidence strengths aren't connected to strategic pillars
 */
const E4StrengthLeverageRule: SynthesisRule = {
  id: 'E4-strength-leverage',
  name: 'Untapped Strength Opportunity',
  description: 'Identifies high-confidence strengths not leveraged in strategy',
  requiredTools: ['swot-analysis', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      strengths?: { id: string; text: string; confidence: number }[];
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      pillars?: { id: string; title: string; description: string }[];
      coreValues?: string[];
    } | undefined;

    if (!swotData?.strengths || !visionData?.pillars) {
      return insights;
    }

    // Get high-confidence strengths
    const highConfidenceStrengths = swotData.strengths.filter(s => s.confidence >= 4);

    // Combine all strategic text for matching
    const pillarText = visionData.pillars
      .map(p => `${p.title} ${p.description || ''}`)
      .join(' ')
      .toLowerCase();

    const valuesText = (visionData.coreValues || []).join(' ').toLowerCase();
    const strategicText = `${pillarText} ${valuesText}`;

    for (const strength of highConfidenceStrengths) {
      // Extract keywords from strength
      const keywords = strength.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4);

      const isLeveraged = keywords.some(keyword => strategicText.includes(keyword));

      if (!isLeveraged) {
        insights.push({
          id: generateInsightId(),
          ruleId: 'E4-strength-leverage',
          type: 'opportunity',
          severity: 3,
          title: 'Untapped Strength',
          description: `High-confidence strength "${strength.text}" (${strength.confidence}/5) doesn't appear to be reflected in your strategic pillars or core values.`,
          recommendation: 'Consider how this strength could inform a strategic pillar, differentiate your value proposition, or accelerate existing initiatives.',
          affectedTools: ['swot-analysis', 'vision-canvas'],
          data: {
            strengthText: strength.text,
            strengthConfidence: strength.confidence,
            strengthId: strength.id
          }
        });
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E4StrengthLeverageRule);
export default E4StrengthLeverageRule;
