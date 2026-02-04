// Export registry
export { synthesisRuleRegistry } from './ruleRegistry';

// Export types
export type {
  SynthesisRule,
  SynthesisContext,
  SynthesisResult,
  Insight
} from './types';

// Rules will be imported here as they are created
// Each rule file auto-registers itself when imported
// Example:
// import './rules/executionCapabilityGap';
// import './rules/unmitigatedThreat';
// import './rules/burnoutRisk';
