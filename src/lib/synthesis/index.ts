// Export registry
export { synthesisRuleRegistry } from './ruleRegistry';

// Export types
export type {
  SynthesisRule,
  SynthesisContext,
  SynthesisResult,
  Insight
} from './types';

// Production synthesis rules (E1-E11)
import './rules';
