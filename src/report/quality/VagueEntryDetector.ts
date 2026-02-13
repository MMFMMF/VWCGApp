/**
 * Vague Entry Detector
 *
 * Specialized analysis for identifying SWOT entries that lack the
 * specificity needed for actionable report insights. Detects entries
 * that are too short, use generic phrases, or lack concrete details.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VagueEntryResult {
  entryText: string;
  reason: 'too-short' | 'generic-phrase' | 'no-specifics';
  suggestion: string;
}

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

/**
 * Matches entries that consist entirely of a single generic word or phrase.
 * Case-insensitive, anchored to start/end with optional surrounding whitespace.
 */
const GENERIC_PHRASE_PATTERN =
  /^\s*(good|bad|ok|okay|fine|great|poor|excellent|terrible|average|decent|strong|weak|needs?\s*improvement|n\/?a|none|nothing|idk|unknown|tbd|yes|no|maybe|same|other)\s*$/i;

/**
 * Minimum character length for a meaningful entry.
 * Entries shorter than this are flagged as too-short.
 */
const MIN_ENTRY_LENGTH = 15;

/**
 * Patterns that indicate an entry contains concrete, specific information.
 * An entry must match at least one of these to avoid the no-specifics flag.
 *
 * - Numbers (including percentages, dollar amounts, dates)
 * - Capitalized proper nouns (two or more consecutive capitalized words mid-sentence)
 * - Action verbs commonly used in strategic context
 */
const SPECIFICITY_INDICATORS: RegExp[] = [
  // Numbers, percentages, dollar amounts
  /\d+/,
  // Proper nouns: sequences of capitalized words (min 2 chars each, not at sentence start)
  /(?:^|[.!?]\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/,
  // Action verbs in strategic/business context
  /\b(implement|deploy|migrate|integrate|launch|redesign|automate|consolidate|restructure|develop|expand|reduce|increase|eliminate|streamline|outsource|invest|acquire|partner|hire|train|audit|measure|track|optimize|negotiate|transition|establish|formalize|centralize|decentralize)\b/i,
];

// ---------------------------------------------------------------------------
// Suggestion templates by reason
// ---------------------------------------------------------------------------

const SUGGESTIONS: Record<VagueEntryResult['reason'], string> = {
  'too-short':
    'Expand this entry with specific details about what, where, and why. For example, instead of "good team" write "Engineering team consistently delivers sprint goals with <5% defect rate."',
  'generic-phrase':
    'Replace this generic assessment with a concrete observation. Describe the specific capability, metric, or situation you are evaluating.',
  'no-specifics':
    'Add measurable details, named initiatives, or specific actions. Strong entries reference numbers, named systems, teams, or concrete outcomes.',
};

// ---------------------------------------------------------------------------
// Core detection function
// ---------------------------------------------------------------------------

/**
 * Analyze a single text entry for vagueness.
 *
 * Detection priority (first match wins):
 * 1. Generic phrase — entire entry is a single known vague term
 * 2. Too short — entry is below minimum character threshold
 * 3. No specifics — entry lacks numbers, proper nouns, or action verbs
 *
 * Returns `null` when the entry is considered sufficiently specific.
 */
export function detectVagueEntry(text: string): VagueEntryResult | null {
  const trimmed = text.trim();

  // Empty entries are trivially vague
  if (trimmed.length === 0) {
    return {
      entryText: text,
      reason: 'too-short',
      suggestion: SUGGESTIONS['too-short'],
    };
  }

  // 1. Generic phrase check (highest confidence match)
  if (GENERIC_PHRASE_PATTERN.test(trimmed)) {
    return {
      entryText: text,
      reason: 'generic-phrase',
      suggestion: SUGGESTIONS['generic-phrase'],
    };
  }

  // 2. Too-short check
  if (trimmed.length < MIN_ENTRY_LENGTH) {
    return {
      entryText: text,
      reason: 'too-short',
      suggestion: SUGGESTIONS['too-short'],
    };
  }

  // 3. No-specifics check: must match at least one specificity indicator
  const hasSpecifics = SPECIFICITY_INDICATORS.some((pattern) =>
    pattern.test(trimmed)
  );

  if (!hasSpecifics) {
    return {
      entryText: text,
      reason: 'no-specifics',
      suggestion: SUGGESTIONS['no-specifics'],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Batch analysis
// ---------------------------------------------------------------------------

/**
 * Analyze an array of text entries and return results for all vague ones.
 */
export function detectVagueEntries(entries: string[]): VagueEntryResult[] {
  const results: VagueEntryResult[] = [];

  for (const entry of entries) {
    const result = detectVagueEntry(entry);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Calculate the vagueness ratio for a set of entries.
 * Returns a number between 0 and 1 representing the proportion of vague entries.
 * Returns 0 when no entries are provided.
 */
export function getVaguenessRatio(entries: string[]): number {
  if (entries.length === 0) return 0;

  const vagueCount = entries.filter(
    (entry) => detectVagueEntry(entry) !== null
  ).length;

  return vagueCount / entries.length;
}
