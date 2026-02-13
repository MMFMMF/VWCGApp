/**
 * Narrative Generator
 *
 * Processes NarrativeTemplates against a NarrativeContext to produce
 * final report narratives. The generator:
 *
 * 1. Evaluates conditional sections (omits sections whose conditions return false)
 * 2. Applies banned-phrase sanitization to every section
 * 3. Runs voice-quality checks and collects warnings
 * 4. Returns the assembled GeneratedNarrative with clean text
 */

import type {
  NarrativeContext,
  NarrativeTemplate,
  NarrativeSection,
  GeneratedNarrative,
} from './types.ts';
import { enforceVoice, sanitizeText, checkVoiceQuality } from './voice.ts';
import { buildReportTemplate, interpretMetric } from './templates.ts';

// ---------------------------------------------------------------------------
// Core generation
// ---------------------------------------------------------------------------

/**
 * Generate a complete narrative from a template and context.
 *
 * Processing steps per section:
 * 1. Evaluate the `condition` function (if present). Skip the section when false.
 * 2. Pass section content through the voice enforcement pipeline:
 *    a. Replace banned phrases with approved alternatives
 *    b. Run voice-quality checks (active voice, specificity, quantification, paragraph discipline)
 * 3. Collect all voice issues as warnings (non-blocking).
 */
export function generateNarrative(
  template: NarrativeTemplate,
  ctx: NarrativeContext
): GeneratedNarrative {
  const renderedSections: NarrativeSection[] = [];
  const allIssues: string[] = [];

  for (const section of template.sections) {
    // Step 1: Evaluate condition
    if (section.condition && !section.condition(ctx)) {
      continue;
    }

    // Step 2: Enforce voice standards on content
    const enforced = enforceVoice(section.content);

    // Collect issues with section attribution
    for (const issue of enforced.issues) {
      allIssues.push(`[${section.id}] ${issue}`);
    }

    // Step 3: Store sanitized section
    renderedSections.push({
      id: section.id,
      title: section.title,
      content: enforced.text,
      // Conditions have already been evaluated; omit from output
    });
  }

  return {
    templateId: template.id,
    sections: renderedSections,
    voiceIssues: allIssues,
  };
}

// ---------------------------------------------------------------------------
// Metric interpretation
// ---------------------------------------------------------------------------

/**
 * Generate a single sentence of business-context interpretation for a metric.
 *
 * This wraps the template-system's `interpretMetric` function with
 * banned-phrase sanitization so the output is always voice-compliant.
 */
export function generateMetricInterpretation(
  metricName: string,
  value: number | string,
  ctx: NarrativeContext
): string {
  const raw = interpretMetric(metricName, value, ctx);
  return sanitizeText(raw);
}

// ---------------------------------------------------------------------------
// Convenience: full-report generation
// ---------------------------------------------------------------------------

/**
 * One-call entry point: build the full report template from context,
 * then generate the narrative with voice enforcement.
 */
export function generateFullReport(ctx: NarrativeContext): GeneratedNarrative {
  const template = buildReportTemplate(ctx);
  return generateNarrative(template, ctx);
}

// ---------------------------------------------------------------------------
// Narrative context factory
// ---------------------------------------------------------------------------

/**
 * Build a NarrativeContext from the raw workspace store state.
 *
 * This is the bridge between the Zustand store and the narrative engine.
 * Callers pass the workspace state, pre-computed DerivedMetrics, and insights;
 * this function packages them into the shape expected by templates.
 */
export function createNarrativeContext(
  workspace: Record<string, any>,
  metrics: import('@/engine/derived-metrics.ts').DerivedMetrics,
  insights: import('@/engine/types.ts').Insight[],
  clientName?: string
): NarrativeContext {
  const resolvedName =
    clientName ??
    workspace.metadata?.name ??
    'Your Organization';

  return {
    workspace,
    metrics,
    insights,
    clientName: resolvedName,
  };
}

// ---------------------------------------------------------------------------
// Utility: post-generation quality report
// ---------------------------------------------------------------------------

/**
 * Run a standalone voice-quality audit on already-generated narrative text.
 * Useful for CI or preview validation without regenerating the full template.
 */
export function auditNarrativeQuality(
  narrative: GeneratedNarrative
): { sectionId: string; issues: string[] }[] {
  const results: { sectionId: string; issues: string[] }[] = [];

  for (const section of narrative.sections) {
    const quality = checkVoiceQuality(section.content);
    if (!quality.overallPass) {
      results.push({
        sectionId: section.id,
        issues: quality.issues,
      });
    }
  }

  return results;
}
