import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E10-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E10 — Opportunity-Capability Match
 * Identifies when high-confidence opportunities align with existing strengths
 */
const E10OpportunityMatchRule: SynthesisRule = {
  id: 'E10-opportunity-capability-match',
  name: 'Opportunity-Capability Alignment',
  description: 'Finds opportunities that align with existing strengths',
  requiredTools: ['swot-analysis'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      strengths?: { id: string; text: string; confidence: number }[];
      opportunities?: { id: string; text: string; confidence: number }[];
    } | undefined;

    if (!swotData?.strengths || !swotData?.opportunities) {
      return insights;
    }

    const highConfidenceOpps = swotData.opportunities.filter(o => o.confidence >= 4);
    const highConfidenceStrengths = swotData.strengths.filter(s => s.confidence >= 4);

    for (const opportunity of highConfidenceOpps) {
      const oppKeywords = opportunity.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);

      for (const strength of highConfidenceStrengths) {
        const strengthKeywords = strength.text
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 3);

        // Check for keyword overlap
        const overlap = oppKeywords.filter(k =>
          strengthKeywords.some(sk => sk.includes(k) || k.includes(sk))
        );

        if (overlap.length > 0) {
          insights.push({
            id: generateInsightId(),
            ruleId: 'E10-opportunity-capability-match',
            type: 'opportunity',
            severity: 2,
            title: 'Strategic Alignment Found',
            description: `Your strength "${strength.text}" aligns well with opportunity "${opportunity.text}". This combination has high potential for success.`,
            recommendation: 'Consider prioritizing this opportunity since you have an existing capability advantage. Build a specific initiative around this alignment.',
            affectedTools: ['swot-analysis'],
            data: {
              strengthText: strength.text,
              opportunityText: opportunity.text,
              alignmentKeywords: overlap
            }
          });
        }
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E10OpportunityMatchRule);
export default E10OpportunityMatchRule;
