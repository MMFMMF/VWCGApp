// Export registry
export { synthesisRuleRegistry } from './ruleRegistry';

// Export types
export type {
  SynthesisRule,
  SynthesisContext,
  SynthesisResult,
  Insight
} from './types';

// Import rules to auto-register them
// Each rule file auto-registers itself when imported
import './rules/test-rule';
import './rules/exampleRule';

// Production rules will be imported here as they are created:
// import './rules/executionCapabilityGap';
// import './rules/unmitigatedThreat';
// import './rules/burnoutRisk';
