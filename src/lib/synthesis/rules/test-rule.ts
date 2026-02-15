/**
 * TEST RULE: Simple rule for testing the synthesis system
 * This rule will be removed in production
 */

import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const testRule: SynthesisRule = {
  id: 'TEST-basic-rule',
  name: 'Test Basic Rule',
  description: 'A simple rule to verify the synthesis system works',
  requiredTools: ['vision'],

  evaluate: (context: SynthesisContext): Insight[] => {
    const visionData = context.tools['vision'] as any;
    const insights: Insight[] = [];

    // If vision tool exists and has data
    if (visionData && Object.keys(visionData).length > 0) {
      insights.push({
        id: `TEST-${Date.now()}`,
        ruleId: 'TEST-basic-rule',
        type: 'strength',
        severity: 2,
        title: 'Vision Tool Completed',
        description: 'The vision tool has been completed successfully.',
        recommendation: 'Continue with other assessment tools.',
        affectedTools: ['vision'],
        data: { toolData: visionData }
      });
    } else {
      insights.push({
        id: `TEST-${Date.now()}`,
        ruleId: 'TEST-basic-rule',
        type: 'gap',
        severity: 3,
        title: 'Vision Tool Not Started',
        description: 'The vision tool has not been completed yet.',
        recommendation: 'Complete the vision tool to establish strategic direction.',
        affectedTools: ['vision']
      });
    }

    return insights;
  },

  calculateScores: (context: SynthesisContext) => {
    const visionData = context.tools['vision'] as any;
    return {
      visionComplete: visionData && Object.keys(visionData).length > 0 ? 100 : 0
    };
  }
};

// Auto-register when this module is imported
synthesisRuleRegistry.register(testRule);

export default testRule;
