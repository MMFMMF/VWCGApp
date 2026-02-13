/**
 * Synthesis Engine - Central Export
 * Provides unified access to synthesis, derived metrics, and keyword analysis
 */

// Core synthesis
export { runSynthesis, registerRule } from './synthesis.ts';

// Derived metrics
export { computeDerivedMetrics } from './derived-metrics.ts';
export type { DerivedMetrics, LeadershipArchetype, RevenueRiskEstimate } from './derived-metrics.ts';

// SWOT keyword analysis
export { scanSwotText, hasKeywordMatches, getKeywordFrequency } from './swot-keywords.ts';
export type { SwotAnalysis, SwotKeywordMatch } from './swot-keywords.ts';

// Types
export type { Insight, InsightType, InsightSeverity, SynthesisRule } from './types.ts';
