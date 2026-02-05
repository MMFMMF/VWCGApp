import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E2-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E2 — Unmitigated Threat
 * Triggers when high-confidence threats exist but no roadmap tasks address them
 */
const E2UnmitigatedThreatRule: SynthesisRule = {
  id: 'E2-unmitigated-threat',
  name: 'Unmitigated Threat Warning',
  description: 'Identifies high-confidence threats without corresponding action plans',
  requiredTools: ['swot-analysis', '90day-roadmap'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      threats?: { id: string; text: string; confidence: number }[];
    } | undefined;

    const roadmapData = context.tools['90day-roadmap'] as {
      tasks?: { id: string; title: string; notes: string }[];
    } | undefined;

    if (!swotData?.threats || !roadmapData?.tasks) {
      return insights;
    }

    // Find high-confidence threats (4 or 5)
    const highConfidenceThreats = swotData.threats.filter(t => t.confidence >= 4);

    // Check if any roadmap task addresses the threat (simple keyword matching)
    const taskTexts = roadmapData.tasks
      .map(t => `${t.title} ${t.notes || ''}`.toLowerCase())
      .join(' ');

    for (const threat of highConfidenceThreats) {
      // Extract keywords from threat text (words > 4 chars)
      const keywords = threat.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4);

      const isAddressed = keywords.some(keyword => taskTexts.includes(keyword));

      if (!isAddressed) {
        insights.push({
          id: generateInsightId(),
          ruleId: 'E2-unmitigated-threat',
          type: 'warning',
          severity: threat.confidence >= 5 ? 5 : 4,
          title: 'Unmitigated Threat',
          description: `High-confidence threat "${threat.text}" (confidence: ${threat.confidence}/5) has no corresponding action item in your 90-day roadmap.`,
          recommendation: 'Add a specific task to your roadmap to address this threat. Consider: mitigation strategies, contingency planning, or risk monitoring.',
          affectedTools: ['swot-analysis', '90day-roadmap'],
          data: {
            threatText: threat.text,
            threatConfidence: threat.confidence,
            threatId: threat.id
          }
        });
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E2UnmitigatedThreatRule);
export default E2UnmitigatedThreatRule;
