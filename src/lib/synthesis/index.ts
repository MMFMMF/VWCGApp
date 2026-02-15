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

// Production synthesis rules (SYN-01 to SYN-07)
import './rules';
