/**
 * Narrative Framework Type Definitions
 *
 * Types for the template-based narrative generation engine
 * that produces consultant-voice content for VWCG reports.
 */

import type { DerivedMetrics } from '@/engine/derived-metrics.ts';
import type { Insight } from '@/engine/types.ts';

/**
 * Full context object passed to every narrative template and condition function.
 * Contains workspace data, computed metrics, synthesis insights, and client identity.
 */
export interface NarrativeContext {
  workspace: Record<string, any>;
  metrics: DerivedMetrics;
  insights: Insight[];
  clientName: string;
}

/**
 * A single section of generated narrative text with optional conditional rendering.
 * When `condition` returns false, the section is omitted from output.
 */
export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
  condition?: (ctx: NarrativeContext) => boolean;
}

/**
 * A complete narrative template composed of ordered sections.
 * Each template targets a specific area of the report.
 */
export interface NarrativeTemplate {
  id: string;
  sections: NarrativeSection[];
}

/**
 * Result of the banned-phrase scan. Identifies which phrases were found
 * and where, enabling targeted replacement before output.
 */
export interface BannedPhraseMatch {
  phrase: string;
  replacement: string;
  index: number;
}

/**
 * Voice quality assessment returned by the voice checker.
 * Reports whether generated text meets consultant-voice standards.
 */
export interface VoiceQualityResult {
  passesActiveVoice: boolean;
  passesSpecificity: boolean;
  passesQuantification: boolean;
  passesParagraphDiscipline: boolean;
  overallPass: boolean;
  issues: string[];
}

/**
 * Output from the narrative generator for a single template.
 * Contains the rendered sections (after conditional filtering)
 * and any voice-quality warnings.
 */
export interface GeneratedNarrative {
  templateId: string;
  sections: NarrativeSection[];
  voiceIssues: string[];
}
