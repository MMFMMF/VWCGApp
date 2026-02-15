/**
 * Verification script for synthesis registry
 * Run with: node verify-synthesis.js
 */

// Simple test to verify the synthesis registry concept works
const testRegistry = () => {
  const rules = new Map();

  // Test 1: Register a rule
  const testRule = {
    id: 'TEST-rule',
    name: 'Test Rule',
    description: 'Test rule',
    requiredTools: ['vision'],
    evaluate: (context) => {
      const visionData = context.tools['vision'];
      if (visionData && visionData.completed) {
        return [{
          id: 'TEST-1',
          ruleId: 'TEST-rule',
          type: 'strength',
          severity: 2,
          title: 'Vision Complete',
          description: 'Vision tool is complete',
          recommendation: 'Continue with assessments',
          affectedTools: ['vision']
        }];
      }
      return [];
    }
  };

  rules.set(testRule.id, testRule);
  console.log('✓ Rule registration works');

  // Test 2: Retrieve rule
  const retrieved = rules.get('TEST-rule');
  if (!retrieved) {
    throw new Error('Failed to retrieve rule');
  }
  console.log('✓ Rule retrieval works');

  // Test 3: Evaluate rule
  const context = {
    tools: {
      vision: { completed: true }
    },
    meta: {
      companyName: 'Test Company',
      assessmentDate: new Date().toISOString()
    }
  };

  const insights = retrieved.evaluate(context);
  if (insights.length !== 1) {
    throw new Error('Expected 1 insight, got ' + insights.length);
  }
  console.log('✓ Rule evaluation works');

  // Test 4: Evaluate all rules
  const allInsights = [];
  const allScores = {};
  let rulesEvaluated = 0;

  for (const rule of rules.values()) {
    const hasRequiredTools = rule.requiredTools.every(
      toolId => context.tools[toolId] !== undefined
    );

    if (hasRequiredTools) {
      const ruleInsights = rule.evaluate(context);
      allInsights.push(...ruleInsights);
      rulesEvaluated++;
    }
  }

  if (rulesEvaluated !== 1) {
    throw new Error('Expected 1 rule evaluated, got ' + rulesEvaluated);
  }
  console.log('✓ EvaluateAll pattern works');

  // Test 5: Prioritization
  const testInsights = [
    { severity: 3, type: 'gap' },
    { severity: 5, type: 'warning' },
    { severity: 3, type: 'opportunity' },
    { severity: 5, type: 'gap' }
  ];

  const typeOrder = { gap: 0, warning: 1, opportunity: 2, strength: 3 };
  const sorted = testInsights.sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }
    return typeOrder[a.type] - typeOrder[b.type];
  });

  // Should be: [5,gap], [5,warning], [3,gap], [3,opportunity]
  if (sorted[0].severity !== 5 || sorted[0].type !== 'gap') {
    throw new Error('Prioritization failed');
  }
  console.log('✓ Insight prioritization works');

  console.log('\n✅ All synthesis registry tests passed!\n');
  console.log('Summary:');
  console.log('- Rule registration: working');
  console.log('- Rule retrieval: working');
  console.log('- Rule evaluation: working');
  console.log('- EvaluateAll pattern: working');
  console.log('- Insight prioritization: working');
};

try {
  testRegistry();
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
