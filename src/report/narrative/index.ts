/**
 * Narrative Framework — Public API
 *
 * Re-exports all types and functions needed by report components
 * to generate consultant-voice narrative content.
 */

// Types
export type {
  NarrativeContext,
  NarrativeSection,
  NarrativeTemplate,
  BannedPhraseMatch,
  VoiceQualityResult,
  GeneratedNarrative,
} from './types.ts';

// Voice enforcement
export {
  scanBannedPhrases,
  containsBannedPhrases,
  sanitizeText,
  checkVoiceQuality,
  enforceVoice,
} from './voice.ts';

// Templates
export {
  interpretMetric,
  buildReportTemplate,
  buildSectionTemplate,
  getAvailableSectionIds,
} from './templates.ts';

// Generator
export {
  generateNarrative,
  generateMetricInterpretation,
  generateFullReport,
  createNarrativeContext,
  auditNarrativeQuality,
} from './generator.ts';
