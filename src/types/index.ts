// Export workspace types
export * from './workspace';

// Export tool types
export * from './tool';

// Re-export synthesis types for convenience
export type {
  SynthesisRule,
  SynthesisContext,
  SynthesisResult,
  Insight
} from '../lib/synthesis/types';
