/**
 * Quality & Edge Cases — Public API
 *
 * Re-exports edge case detection, content transformation,
 * and vague entry analysis for use during PDF report generation.
 */

// Edge case detection and transformation
export type {
  EdgeCaseType,
  EdgeCaseResult,
  ContentTransformation,
} from './EdgeCaseDetector.ts';

export {
  detectEdgeCases,
  getContentTransformations,
  applyTransformations,
} from './EdgeCaseDetector.ts';

// Vague entry detection
export type { VagueEntryResult } from './VagueEntryDetector.ts';

export {
  detectVagueEntry,
  detectVagueEntries,
  getVaguenessRatio,
} from './VagueEntryDetector.ts';
