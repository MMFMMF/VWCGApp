/**
 * Edge Case Detector
 *
 * Detects extreme score patterns and content quality issues in workspace
 * data, then produces content transformations that adjust report framing
 * to match the assessment reality. Runs during PDF generation to ensure
 * reports provide honest, actionable guidance rather than generic output.
 */

import type { NarrativeSection, GeneratedNarrative } from '@/report/narrative/types.ts';
import { getVaguenessRatio, detectVagueEntries } from './VagueEntryDetector.ts';
import type { VagueEntryResult } from './VagueEntryDetector.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EdgeCaseType =
  | 'all-high'        // All scores > 80%
  | 'all-low'         // All scores < 40%
  | 'vague-swot'      // Generic/short SWOT entries
  | 'missing-modules' // Incomplete assessments
  | 'extreme-spread'  // Some very high + some very low
  | 'none';           // No edge cases

export interface EdgeCaseResult {
  type: EdgeCaseType;
  details: string;
  framingAdvice: string;
  affectedSections: string[];
}

export interface ContentTransformation {
  sectionId: string;
  prefix?: string;    // Text to prepend to section
  suffix?: string;    // Text to append to section
  replaceTone?: 'optimization' | 'triage' | 'caution';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The 6 primary assessment tools whose completion is tracked.
 * SOP sub-tools and the report center are excluded — they are
 * output/management tools rather than assessment inputs.
 */
const ASSESSMENT_TOOL_IDS = [
  'leadership-dna',
  'ai-readiness',
  'advisor-readiness',
  'swot',
  'vision-canvas',
  'roadmap',
] as const;

/** Leadership DNA dimension keys (current_ prefix, 0-10 scale). */
const LEADERSHIP_DIMENSIONS = [
  'Vision',
  'Execution',
  'Empowerment',
  'Decisiveness',
  'Adaptability',
  'Integrity',
] as const;

/** AI Readiness dimension keys (0-100 scale). */
const AI_READINESS_DIMENSIONS = [
  'Strategy',
  'Data',
  'Infrastructure',
  'Talent',
  'Governance',
  'Culture',
] as const;

/** SWOT quadrant keys. */
const SWOT_QUADRANTS = [
  'strengths',
  'weaknesses',
  'opportunities',
  'threats',
] as const;

/** Human-friendly tool names for report messaging. */
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'leadership-dna': 'Leadership DNA',
  'ai-readiness': 'AI Readiness',
  'advisor-readiness': 'Advisor Readiness',
  'swot': 'SWOT Analysis',
  'vision-canvas': 'Vision Canvas',
  'roadmap': '90-Day Roadmap',
};

// ---------------------------------------------------------------------------
// Score extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract all leadership-dna current scores normalized to 0-100.
 * Returns empty array when no data is present.
 */
function getLeadershipScores(tools: Record<string, unknown>): number[] {
  const dna = tools['leadership-dna'] as Record<string, unknown> | undefined;
  if (!dna) return [];

  const scores: number[] = [];
  for (const dim of LEADERSHIP_DIMENSIONS) {
    const value = dna[`current_${dim}`];
    if (typeof value === 'number' && value > 0) {
      // Normalize 0-10 to 0-100
      scores.push(value * 10);
    }
  }
  return scores;
}

/**
 * Extract all AI readiness scores (already 0-100).
 * Returns empty array when no data is present.
 */
function getAiReadinessScores(tools: Record<string, unknown>): number[] {
  const ai = tools['ai-readiness'] as Record<string, unknown> | undefined;
  if (!ai) return [];

  const scores: number[] = [];
  for (const dim of AI_READINESS_DIMENSIONS) {
    const value = ai[dim];
    if (typeof value === 'number' && value > 0) {
      scores.push(value);
    }
  }
  return scores;
}

/**
 * Extract advisor readiness answer scores normalized to 0-100.
 * Original scale is 1-5; we map to 0-100 via ((value - 1) / 4) * 100.
 * Returns empty array when no data is present.
 */
function getAdvisorScores(tools: Record<string, unknown>): number[] {
  const advisor = tools['advisor-readiness'] as
    | { answers?: Record<string, number> }
    | undefined;
  if (!advisor?.answers) return [];

  const scores: number[] = [];
  const answers = advisor.answers;
  for (const key of Object.keys(answers)) {
    const value = answers[key];
    if (typeof value === 'number' && value > 0) {
      scores.push(((value - 1) / 4) * 100);
    }
  }
  return scores;
}

/**
 * Collect ALL numeric scores from all scoreable assessment tools,
 * normalized to the 0-100 range.
 */
function getAllScores(tools: Record<string, unknown>): number[] {
  return [
    ...getLeadershipScores(tools),
    ...getAiReadinessScores(tools),
    ...getAdvisorScores(tools),
  ];
}

/**
 * Compute per-tool averages (normalized to 0-100) for tools that
 * have numeric scores. Returns a map of toolId -> average.
 */
function getPerToolAverages(
  tools: Record<string, unknown>
): Map<string, number> {
  const averages = new Map<string, number>();

  const leadershipScores = getLeadershipScores(tools);
  if (leadershipScores.length > 0) {
    const avg =
      leadershipScores.reduce((sum, s) => sum + s, 0) /
      leadershipScores.length;
    averages.set('leadership-dna', avg);
  }

  const aiScores = getAiReadinessScores(tools);
  if (aiScores.length > 0) {
    const avg = aiScores.reduce((sum, s) => sum + s, 0) / aiScores.length;
    averages.set('ai-readiness', avg);
  }

  const advisorScores = getAdvisorScores(tools);
  if (advisorScores.length > 0) {
    const avg =
      advisorScores.reduce((sum, s) => sum + s, 0) / advisorScores.length;
    averages.set('advisor-readiness', avg);
  }

  return averages;
}

/**
 * Collect all SWOT entry texts across all four quadrants.
 */
function getSwotEntryTexts(
  tools: Record<string, unknown>
): string[] {
  const swot = tools['swot'] as Record<string, unknown> | undefined;
  if (!swot) return [];

  const texts: string[] = [];
  for (const quadrant of SWOT_QUADRANTS) {
    const items = swot[quadrant];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (
          item &&
          typeof item === 'object' &&
          'text' in item &&
          typeof (item as Record<string, unknown>).text === 'string'
        ) {
          texts.push((item as Record<string, unknown>).text as string);
        }
      }
    }
  }
  return texts;
}

/**
 * Determine which assessment tools have meaningful data.
 * A tool "has data" if its key exists in `tools` and contains
 * at least one non-empty field.
 */
function getCompletedToolIds(
  tools: Record<string, unknown>
): string[] {
  const completed: string[] = [];

  for (const toolId of ASSESSMENT_TOOL_IDS) {
    const data = tools[toolId];
    if (!data || typeof data !== 'object') continue;

    const record = data as Record<string, unknown>;

    if (toolId === 'leadership-dna') {
      // Has data if at least one current_ dimension is set above 0
      const hasScores = LEADERSHIP_DIMENSIONS.some((dim) => {
        const val = record[`current_${dim}`];
        return typeof val === 'number' && val > 0;
      });
      if (hasScores) completed.push(toolId);
    } else if (toolId === 'ai-readiness') {
      const hasScores = AI_READINESS_DIMENSIONS.some((dim) => {
        const val = record[dim];
        return typeof val === 'number' && val > 0;
      });
      if (hasScores) completed.push(toolId);
    } else if (toolId === 'advisor-readiness') {
      const answers = (record as { answers?: Record<string, unknown> }).answers;
      if (answers && Object.keys(answers).length > 0) {
        completed.push(toolId);
      }
    } else if (toolId === 'swot') {
      const hasEntries = SWOT_QUADRANTS.some((q) => {
        const items = record[q];
        return Array.isArray(items) && items.length > 0;
      });
      if (hasEntries) completed.push(toolId);
    } else if (toolId === 'vision-canvas') {
      const vc = record as {
        northStar?: string;
        pillars?: unknown[];
        values?: unknown[];
      };
      if (
        (vc.northStar && vc.northStar.trim().length > 0) ||
        (Array.isArray(vc.pillars) && vc.pillars.length > 0) ||
        (Array.isArray(vc.values) && vc.values.length > 0)
      ) {
        completed.push(toolId);
      }
    } else if (toolId === 'roadmap') {
      const rm = record as { tasks?: unknown[] };
      if (Array.isArray(rm.tasks) && rm.tasks.length > 0) {
        completed.push(toolId);
      }
    }
  }

  return completed;
}

// ---------------------------------------------------------------------------
// Edge case detection
// ---------------------------------------------------------------------------

/**
 * Scan workspace data and return all detected edge cases.
 *
 * Checks performed (in order):
 * 1. all-high — global average of all numeric scores > 80%
 * 2. all-low — global average of all numeric scores < 40%
 * 3. vague-swot — more than 50% of SWOT entries flagged as vague
 * 4. missing-modules — fewer than 3 of 6 assessment tools have data
 * 5. extreme-spread — highest tool average > 80% AND lowest < 30%
 *
 * Returns an empty array when no edge cases are found.
 */
export function detectEdgeCases(
  workspace: Record<string, unknown>
): EdgeCaseResult[] {
  const tools = (workspace.tools ?? {}) as Record<string, unknown>;
  const results: EdgeCaseResult[] = [];

  // -----------------------------------------------------------------------
  // 1 & 2: All-high / All-low
  // -----------------------------------------------------------------------
  const allScores = getAllScores(tools);

  if (allScores.length > 0) {
    const globalAverage =
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

    if (globalAverage > 80) {
      results.push({
        type: 'all-high',
        details: `Global assessment average is ${globalAverage.toFixed(1)}% across ${allScores.length} data points. All scores are uniformly strong.`,
        framingAdvice:
          'Frame report content around optimization opportunities rather than generic praise. Replace celebratory language with specific areas to push from good to exceptional.',
        affectedSections: [
          'executive-headline',
          'strengths-summary',
          'recommendations',
        ],
      });
    } else if (globalAverage < 40) {
      results.push({
        type: 'all-low',
        details: `Global assessment average is ${globalAverage.toFixed(1)}% across ${allScores.length} data points. Scores indicate significant gaps across multiple dimensions.`,
        framingAdvice:
          'Structure report as a triage guide with a clear starting point. Resist listing everything that needs fixing — prioritize ruthlessly and mark a single #1 action.',
        affectedSections: [
          'executive-headline',
          'recommendations',
          'gap-analysis',
        ],
      });
    }
  }

  // -----------------------------------------------------------------------
  // 3: Vague SWOT
  // -----------------------------------------------------------------------
  const swotTexts = getSwotEntryTexts(tools);

  if (swotTexts.length > 0) {
    const vaguenessRatio = getVaguenessRatio(swotTexts);

    if (vaguenessRatio > 0.5) {
      const vagueEntries = detectVagueEntries(swotTexts);
      const exampleEntries = vagueEntries
        .slice(0, 3)
        .map((v: VagueEntryResult) => `"${v.entryText}"`)
        .join(', ');

      results.push({
        type: 'vague-swot',
        details: `${Math.round(vaguenessRatio * 100)}% of SWOT entries (${vagueEntries.length} of ${swotTexts.length}) lack specificity. Examples: ${exampleEntries}`,
        framingAdvice:
          'Add a note to the SWOT section explaining that vague entries limit analytical value. Suggest the client revisit with more detailed entries.',
        affectedSections: ['swot-analysis', 'swot-summary'],
      });
    }
  }

  // -----------------------------------------------------------------------
  // 4: Missing modules
  // -----------------------------------------------------------------------
  const completedIds = getCompletedToolIds(tools);
  const totalAssessmentTools = ASSESSMENT_TOOL_IDS.length; // 6

  if (completedIds.length < 3) {
    const missingIds = ASSESSMENT_TOOL_IDS.filter(
      (id) => !completedIds.includes(id)
    );
    const missingNames = missingIds.map(
      (id) => TOOL_DISPLAY_NAMES[id] ?? id
    );

    results.push({
      type: 'missing-modules',
      details: `Only ${completedIds.length} of ${totalAssessmentTools} assessment modules have data. Missing: ${missingNames.join(', ')}.`,
      framingAdvice:
        'Mark affected report sections with [Limited Data] notation. Add an executive-level note explaining the restricted analytical scope.',
      affectedSections: [
        'executive-headline',
        ...missingIds.map((id) => `${id}-section`),
      ],
    });
  }

  // -----------------------------------------------------------------------
  // 5: Extreme spread
  // -----------------------------------------------------------------------
  const toolAverages = getPerToolAverages(tools);

  if (toolAverages.size >= 2) {
    const averageValues = Array.from(toolAverages.values());
    const highest = Math.max(...averageValues);
    const lowest = Math.min(...averageValues);

    if (highest > 80 && lowest < 30) {
      const highTool = Array.from(toolAverages.entries()).find(
        ([_, v]) => v === highest
      );
      const lowTool = Array.from(toolAverages.entries()).find(
        ([_, v]) => v === lowest
      );

      const highName = highTool
        ? TOOL_DISPLAY_NAMES[highTool[0]] ?? highTool[0]
        : 'Unknown';
      const lowName = lowTool
        ? TOOL_DISPLAY_NAMES[lowTool[0]] ?? lowTool[0]
        : 'Unknown';

      results.push({
        type: 'extreme-spread',
        details: `Extreme score variance detected. ${highName} averages ${highest.toFixed(1)}% while ${lowName} averages ${lowest.toFixed(1)}%. This ${(highest - lowest).toFixed(0)}-point spread suggests isolated capability pockets.`,
        framingAdvice:
          'Highlight the imbalance as a key finding. Strong areas cannot compensate for critical gaps — the report should frame this as an integration challenge.',
        affectedSections: [
          'executive-headline',
          'gap-analysis',
          'recommendations',
        ],
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Content transformations
// ---------------------------------------------------------------------------

/**
 * Generate content transformations based on detected edge cases.
 * Each transformation targets a specific report section with prefix/suffix
 * text and optional tone adjustments.
 */
export function getContentTransformations(
  edgeCases: EdgeCaseResult[]
): ContentTransformation[] {
  const transformations: ContentTransformation[] = [];

  for (const edgeCase of edgeCases) {
    switch (edgeCase.type) {
      case 'all-high':
        transformations.push({
          sectionId: 'strengths-summary',
          prefix:
            'Your assessment scores are uniformly strong. Rather than celebrating what\'s working, this section focuses on where to push from good to exceptional.',
          replaceTone: 'optimization',
        });
        transformations.push({
          sectionId: 'recommendations',
          prefix:
            'With scores consistently above 80%, the opportunity lies not in fixing problems but in compounding advantages. The following recommendations target the 20% improvement that separates strong organizations from industry-leading ones.',
          replaceTone: 'optimization',
        });
        transformations.push({
          sectionId: 'executive-headline',
          suffix:
            'The uniformly high scores indicate strong foundational capabilities. This report focuses on optimization vectors rather than remediation.',
        });
        break;

      case 'all-low':
        transformations.push({
          sectionId: 'executive-headline',
          prefix:
            'This assessment reveals significant gaps across multiple dimensions. The analysis below is structured as a triage guide \u2014 start with the item marked #1 and resist the temptation to tackle everything simultaneously.',
          replaceTone: 'triage',
        });
        transformations.push({
          sectionId: 'recommendations',
          prefix:
            'With limited capacity and multiple gaps, sequencing matters more than comprehensiveness. The recommendations below are ordered by impact-to-effort ratio. Begin with #1 and do not advance until it shows measurable progress.',
          replaceTone: 'triage',
        });
        transformations.push({
          sectionId: 'gap-analysis',
          suffix:
            'Given the breadth of gaps identified, the priority is establishing a single beachhead of competence rather than incremental improvement across all dimensions.',
          replaceTone: 'triage',
        });
        break;

      case 'vague-swot':
        transformations.push({
          sectionId: 'swot-analysis',
          suffix:
            'Several SWOT entries lack the specificity needed for actionable analysis. For example, entries like "good team" or "needs improvement" don\'t tell us what\'s specifically strong or what specifically needs to change. Consider revisiting the SWOT assessment with more detailed entries for a significantly more useful report.',
          replaceTone: 'caution',
        });
        transformations.push({
          sectionId: 'swot-summary',
          suffix:
            'Note: The quality of this analysis is constrained by the specificity of the input entries. More detailed SWOT entries would yield more targeted recommendations.',
          replaceTone: 'caution',
        });
        break;

      case 'missing-modules': {
        // Extract module count and list from the details string
        const completedMatch = edgeCase.details.match(/^Only (\d+) of (\d+)/);
        const completedCount = completedMatch ? completedMatch[1] : '?';
        const totalCount = completedMatch ? completedMatch[2] : '6';

        // Extract missing module names from the details
        const missingMatch = edgeCase.details.match(/Missing: (.+)\.$/);
        const missingList = missingMatch ? missingMatch[1] : 'unknown modules';

        transformations.push({
          sectionId: 'executive-headline',
          prefix:
            `This analysis is based on ${completedCount} of ${totalCount} available assessment modules. Sections marked [Limited Data] should be interpreted with caution. Complete the remaining modules (${missingList}) for a comprehensive view.`,
          replaceTone: 'caution',
        });

        // Mark each missing module's section
        for (const sectionId of edgeCase.affectedSections) {
          if (sectionId !== 'executive-headline') {
            transformations.push({
              sectionId,
              prefix: '[Limited Data] ',
              replaceTone: 'caution',
            });
          }
        }
        break;
      }

      case 'extreme-spread':
        transformations.push({
          sectionId: 'executive-headline',
          suffix:
            'A significant capability imbalance was detected across assessment dimensions. Strong performance in isolated areas cannot compensate for critical gaps elsewhere \u2014 this report highlights where integration and balance are most needed.',
        });
        transformations.push({
          sectionId: 'gap-analysis',
          prefix:
            'The extreme variance between your strongest and weakest assessment areas is itself a key finding. Organizations with this pattern often over-invest in existing strengths while under-resourcing foundational gaps.',
        });
        transformations.push({
          sectionId: 'recommendations',
          prefix:
            'Given the significant spread between high-performing and low-performing dimensions, the recommendations below prioritize bridging the gap over amplifying existing strengths.',
        });
        break;

      case 'none':
        // No transformations needed
        break;
    }
  }

  return transformations;
}

// ---------------------------------------------------------------------------
// Transformation application
// ---------------------------------------------------------------------------

/**
 * Tone replacement map. When a transformation specifies `replaceTone`,
 * these word substitutions are applied to the section content.
 */
const TONE_REPLACEMENTS: Record<
  NonNullable<ContentTransformation['replaceTone']>,
  Array<{ from: RegExp; to: string }>
> = {
  optimization: [
    { from: /\bfix\b/gi, to: 'optimize' },
    { from: /\bfixes\b/gi, to: 'optimizations' },
    { from: /\bfixing\b/gi, to: 'optimizing' },
    { from: /\bproblem\b/gi, to: 'opportunity' },
    { from: /\bproblems\b/gi, to: 'opportunities' },
    { from: /\bweakness\b/gi, to: 'growth area' },
    { from: /\bweaknesses\b/gi, to: 'growth areas' },
    { from: /\bdeficiency\b/gi, to: 'refinement area' },
    { from: /\bdeficiencies\b/gi, to: 'refinement areas' },
    { from: /\binadequate\b/gi, to: 'developing' },
    { from: /\bremedy\b/gi, to: 'refine' },
    { from: /\bremediate\b/gi, to: 'enhance' },
  ],
  triage: [
    { from: /\bconsider\b/gi, to: 'prioritize' },
    { from: /\bmay want to\b/gi, to: 'must' },
    { from: /\bcould\b/gi, to: 'should' },
    { from: /\bwhen possible\b/gi, to: 'immediately' },
    { from: /\bover time\b/gi, to: 'within 30 days' },
    { from: /\bgradually\b/gi, to: 'urgently' },
    { from: /\boptional\b/gi, to: 'essential' },
  ],
  caution: [
    { from: /\bdefinitely\b/gi, to: 'likely' },
    { from: /\bclearly\b/gi, to: 'appears to' },
    { from: /\bwithout question\b/gi, to: 'based on available data' },
    { from: /\bundoubtedly\b/gi, to: 'based on current indicators' },
    { from: /\bcertain\b/gi, to: 'probable' },
  ],
};

/**
 * Apply tone-specific word replacements to a text string.
 */
function applyToneReplacements(
  text: string,
  tone: NonNullable<ContentTransformation['replaceTone']>
): string {
  const replacements = TONE_REPLACEMENTS[tone];
  let result = text;
  for (const { from, to } of replacements) {
    result = result.replace(from, to);
  }
  return result;
}

/**
 * Apply content transformations to a generated narrative.
 *
 * For each transformation:
 * - Finds the matching section by `sectionId`
 * - Prepends `prefix` text (separated by double newline)
 * - Appends `suffix` text (separated by double newline)
 * - Applies tone word replacements when `replaceTone` is specified
 *
 * Returns a new `GeneratedNarrative` — the original is not mutated.
 */
export function applyTransformations(
  narrative: GeneratedNarrative,
  transformations: ContentTransformation[]
): GeneratedNarrative {
  if (transformations.length === 0) return narrative;

  // Group transformations by section for efficient single-pass application
  const transformsBySection = new Map<string, ContentTransformation[]>();
  for (const t of transformations) {
    const existing = transformsBySection.get(t.sectionId) ?? [];
    existing.push(t);
    transformsBySection.set(t.sectionId, existing);
  }

  const transformedSections: NarrativeSection[] = narrative.sections.map(
    (section) => {
      const sectionTransforms = transformsBySection.get(section.id);
      if (!sectionTransforms) return section;

      let content = section.content;

      // Collect all prefixes and suffixes
      const prefixes: string[] = [];
      const suffixes: string[] = [];
      const tones = new Set<NonNullable<ContentTransformation['replaceTone']>>();

      for (const transform of sectionTransforms) {
        if (transform.prefix) prefixes.push(transform.prefix);
        if (transform.suffix) suffixes.push(transform.suffix);
        if (transform.replaceTone) tones.add(transform.replaceTone);
      }

      // Apply tone replacements to original content
      for (const tone of tones) {
        content = applyToneReplacements(content, tone);
      }

      // Assemble final content with prefixes and suffixes
      const parts: string[] = [];
      if (prefixes.length > 0) parts.push(prefixes.join('\n\n'));
      parts.push(content);
      if (suffixes.length > 0) parts.push(suffixes.join('\n\n'));
      content = parts.join('\n\n');

      return {
        ...section,
        content,
      };
    }
  );

  return {
    ...narrative,
    sections: transformedSections,
  };
}
