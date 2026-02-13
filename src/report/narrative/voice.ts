/**
 * Consultant Voice Enforcement Module
 *
 * Ensures all generated narrative text adheres to the VWCG consultant voice:
 * - Direct and specific, not vague or aspirational
 * - Quantified wherever possible
 * - Active voice, not passive
 * - One idea per paragraph
 * - Free of banned corporate jargon
 */

import type { BannedPhraseMatch, VoiceQualityResult } from './types.ts';

// ---------------------------------------------------------------------------
// Banned Phrases Registry
// ---------------------------------------------------------------------------

/**
 * Phrases explicitly banned from all narrative output.
 * Each entry maps the banned phrase to a preferred replacement.
 * Matching is case-insensitive. "leverage" is banned only as a verb
 * (followed by a noun phrase), not when used as a noun ("financial leverage").
 */
const BANNED_PHRASE_MAP: ReadonlyArray<{
  pattern: RegExp;
  phrase: string;
  replacement: string;
}> = [
  {
    // "leverage" as verb: followed by a word (noun/article), not preceded by "financial"/"operating"
    pattern: /\b(?<!financial\s)(?<!operating\s)leverage\s+(?:the|your|their|our|a|an|\w+ing)\b/gi,
    phrase: 'leverage (verb)',
    replacement: 'use',
  },
  {
    pattern: /\bsynergy\b/gi,
    phrase: 'synergy',
    replacement: 'combined effect',
  },
  {
    pattern: /\bbest\s+practices\b/gi,
    phrase: 'best practices',
    replacement: 'proven methods',
  },
  {
    pattern: /\blow[- ]hanging\s+fruit\b/gi,
    phrase: 'low-hanging fruit',
    replacement: 'quick wins',
  },
  {
    pattern: /\bmove\s+the\s+needle\b/gi,
    phrase: 'move the needle',
    replacement: 'produce measurable change',
  },
  {
    pattern: /\bworld[- ]class\b/gi,
    phrase: 'world-class',
    replacement: 'high-performing',
  },
  {
    pattern: /\bstakeholders\b/gi,
    phrase: 'stakeholders',
    replacement: 'decision-makers',
  },
  {
    pattern: /\bgoing\s+forward\b/gi,
    phrase: 'going forward',
    replacement: 'from here',
  },
];

// ---------------------------------------------------------------------------
// Banned-phrase scanning
// ---------------------------------------------------------------------------

/**
 * Scan text for any occurrence of banned phrases.
 * Returns an array of matches with their positions and suggested replacements.
 */
export function scanBannedPhrases(text: string): BannedPhraseMatch[] {
  const matches: BannedPhraseMatch[] = [];

  for (const entry of BANNED_PHRASE_MAP) {
    // Reset lastIndex for global regexps
    entry.pattern.lastIndex = 0;
    let match = entry.pattern.exec(text);
    while (match !== null) {
      matches.push({
        phrase: entry.phrase,
        replacement: entry.replacement,
        index: match.index,
      });
      match = entry.pattern.exec(text);
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

/**
 * Return true if the text contains any banned phrases.
 */
export function containsBannedPhrases(text: string): boolean {
  return scanBannedPhrases(text).length > 0;
}

// ---------------------------------------------------------------------------
// Text sanitization — replace banned phrases with alternatives
// ---------------------------------------------------------------------------

/**
 * Replace every occurrence of a banned phrase with its approved alternative.
 * Preserves the original casing of the first character (Title Case vs lower case).
 */
export function sanitizeText(text: string): string {
  let result = text;

  for (const entry of BANNED_PHRASE_MAP) {
    entry.pattern.lastIndex = 0;
    result = result.replace(entry.pattern, (matched) => {
      const startsUpperCase = matched[0] === matched[0].toUpperCase();
      const replacement = entry.replacement;
      if (startsUpperCase) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Voice Quality Checker
// ---------------------------------------------------------------------------

/**
 * Passive voice indicator patterns.
 * Matches "is/are/was/were/been/being + past participle" constructions.
 */
const PASSIVE_PATTERNS = [
  /\b(?:is|are|was|were|been|being)\s+\w+ed\b/gi,
  /\b(?:is|are|was|were|been|being)\s+\w+en\b/gi,
];

/**
 * Vague qualifier words that weaken consultant-voice text.
 */
const VAGUE_QUALIFIERS = [
  'somewhat',
  'fairly',
  'quite',
  'rather',
  'slightly',
  'perhaps',
  'possibly',
  'maybe',
  'might',
  'could potentially',
  'in some ways',
  'to some extent',
  'various',
];

/**
 * Check whether the given text meets consultant-voice quality standards.
 *
 * Checks performed:
 * 1. Active voice: fewer than 20% of sentences contain passive constructions
 * 2. Specificity: fewer than 2 vague qualifiers per 100 words
 * 3. Quantification: at least one number or percentage per 200 words
 * 4. Paragraph discipline: no paragraph exceeds 4 sentences
 */
export function checkVoiceQuality(text: string): VoiceQualityResult {
  const issues: string[] = [];

  // -- Active voice check --
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;

  let passiveCount = 0;
  for (const sentence of sentences) {
    const isPassive = PASSIVE_PATTERNS.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(sentence);
    });
    if (isPassive) passiveCount++;
  }

  const passiveRatio = sentenceCount > 0 ? passiveCount / sentenceCount : 0;
  const passesActiveVoice = passiveRatio < 0.2;
  if (!passesActiveVoice) {
    issues.push(
      `${Math.round(passiveRatio * 100)}% passive voice detected (target: <20%)`
    );
  }

  // -- Specificity check --
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const textLower = text.toLowerCase();
  let vagueCount = 0;
  for (const qualifier of VAGUE_QUALIFIERS) {
    const regex = new RegExp(`\\b${qualifier}\\b`, 'gi');
    const occurrences = textLower.match(regex);
    vagueCount += occurrences ? occurrences.length : 0;
  }

  const vaguePer100 = wordCount > 0 ? (vagueCount / wordCount) * 100 : 0;
  const passesSpecificity = vaguePer100 < 2;
  if (!passesSpecificity) {
    issues.push(
      `${vagueCount} vague qualifiers in ${wordCount} words (${vaguePer100.toFixed(1)} per 100 — target: <2)`
    );
  }

  // -- Quantification check --
  const numberPattern = /\d+(?:\.\d+)?%?/g;
  const numberMatches = text.match(numberPattern);
  const numberCount = numberMatches ? numberMatches.length : 0;
  const numbersPer200 = wordCount > 0 ? (numberCount / wordCount) * 200 : 0;
  const passesQuantification = numbersPer200 >= 1 || wordCount < 50;
  if (!passesQuantification) {
    issues.push(
      `Only ${numberCount} numeric references in ${wordCount} words (target: >=1 per 200 words)`
    );
  }

  // -- Paragraph discipline check --
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);
  let passesParagraphDiscipline = true;
  for (const para of paragraphs) {
    const paraSentences = para.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (paraSentences.length > 4) {
      passesParagraphDiscipline = false;
      issues.push(
        `Paragraph has ${paraSentences.length} sentences (target: <=4 per paragraph)`
      );
      break;
    }
  }

  const overallPass =
    passesActiveVoice &&
    passesSpecificity &&
    passesQuantification &&
    passesParagraphDiscipline;

  return {
    passesActiveVoice,
    passesSpecificity,
    passesQuantification,
    passesParagraphDiscipline,
    overallPass,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Full enforcement pipeline
// ---------------------------------------------------------------------------

/**
 * Run the complete voice enforcement pipeline on a block of text:
 * 1. Sanitize banned phrases
 * 2. Check voice quality
 *
 * Returns the sanitized text and any quality warnings.
 */
export function enforceVoice(text: string): {
  text: string;
  issues: string[];
} {
  const sanitized = sanitizeText(text);
  const quality = checkVoiceQuality(sanitized);
  return {
    text: sanitized,
    issues: quality.issues,
  };
}
