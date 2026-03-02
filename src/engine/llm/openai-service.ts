/**
 * Anthropic Claude Service Module
 * Handles API calls to Anthropic for strategic narrative generation and QA validation
 * Uses browser-native fetch for client-side SPA usage
 * Replaces previous OpenAI implementation — same interface, same logic.
 */

import type { AssessmentPayload, BriefingNarrative, QAValidationResult, GenerationResult } from './types.ts';
import { GENERATOR_SYSTEM_PROMPT, QA_VALIDATOR_SYSTEM_PROMPT } from './prompts.ts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL_GENERATION = 'claude-sonnet-4-5';
const MODEL_QA = 'claude-haiku-4-5-20251001';
const GENERATION_TIMEOUT = 120000; // 120 seconds
const QA_TIMEOUT = 30000; // 30 seconds

/**
 * Helper: Checks if narrative has all required fields per spec
 */
export function isValidNarrativeStructure(narrative: any): boolean {
  const required = [
    'headline_finding',
    'three_words',
    'strengths_narrative',
    'exposure_narrative',
    'contradictions',
    'financial_impact',
    'financial_impact_total',
    'recommendations',
    'quick_wins',
    'benchmarking_interpretations',
  ];

  const hasAllFields = required.every((field) => narrative.hasOwnProperty(field));
  if (!hasAllFields) return false;

  if (!Array.isArray(narrative.recommendations) || narrative.recommendations.length !== 3) return false;
  if (!Array.isArray(narrative.quick_wins) || narrative.quick_wins.length !== 3) return false;
  if (!Array.isArray(narrative.three_words) || narrative.three_words.length !== 3) return false;

  return true;
}

/**
 * Helper: Call Anthropic API with fetch
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
  timeoutMs: number
): Promise<{ content: string; usage: any; model: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_ANTHROPIC_API_KEY.');
      }
      if (response.status >= 500) {
        throw new Error(`Anthropic server error (${response.status}). Please try again.`);
      }

      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    return {
      content,
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. Please try again.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate briefing narrative using Claude Sonnet
 */
export async function generateBriefingNarrative(
  payload: AssessmentPayload,
  apiKey: string
): Promise<{ narrative: BriefingNarrative; usage: any; model: string }> {
  let userMessage = `Generate a complete strategic briefing narrative for the following client assessment data:\n\n${JSON.stringify(
    payload,
    null,
    2
  )}`;

  if (payload._qa_feedback && payload._qa_feedback.length > 0) {
    userMessage += `\n\nIMPORTANT: A quality review flagged the following issues in your previous output. Please correct these specific problems in your revised output:\n\n${JSON.stringify(
      payload._qa_feedback,
      null,
      2
    )}\n\nRegenerate the complete narrative with these issues fixed.`;
  }

  const result = await callAnthropic(
    apiKey,
    MODEL_GENERATION,
    GENERATOR_SYSTEM_PROMPT,
    userMessage,
    8000,
    0.7,
    GENERATION_TIMEOUT
  );

  // Strip JSON code fences if present
  const cleaned = result.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const narrative = JSON.parse(cleaned);

  return {
    narrative,
    usage: result.usage,
    model: result.model,
  };
}

/**
 * Validate briefing narrative using Claude Haiku
 */
export async function validateBriefingNarrative(
  payload: AssessmentPayload,
  narrative: BriefingNarrative,
  apiKey: string
): Promise<{ validation: QAValidationResult; usage: any; model: string }> {
  const userMessage = `## ORIGINAL ASSESSMENT DATA\n\n${JSON.stringify(
    payload,
    null,
    2
  )}\n\n## GENERATED NARRATIVE\n\n${JSON.stringify(narrative, null, 2)}`;

  const result = await callAnthropic(
    apiKey,
    MODEL_QA,
    QA_VALIDATOR_SYSTEM_PROMPT,
    userMessage,
    2000,
    0.0,
    QA_TIMEOUT
  );

  const cleaned = result.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const validation = JSON.parse(cleaned);

  return {
    validation,
    usage: result.usage,
    model: result.model,
  };
}

/**
 * Generate narrative with retry logic and QA validation
 * Same pipeline as before — two-model generation + QA pass.
 */
export async function generateWithRetry(
  payload: AssessmentPayload,
  apiKey: string,
  maxRetries = 2
): Promise<GenerationResult> {
  let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  let finalModel = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const generationResult = await generateBriefingNarrative(payload, apiKey);
      totalUsage.prompt_tokens += generationResult.usage.prompt_tokens || 0;
      totalUsage.completion_tokens += generationResult.usage.completion_tokens || 0;
      totalUsage.total_tokens += generationResult.usage.total_tokens || 0;
      finalModel = generationResult.model;

      if (!isValidNarrativeStructure(generationResult.narrative)) {
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt}: Invalid narrative structure, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        } else {
          return {
            narrative: generationResult.narrative,
            qa: {
              overall_result: 'FAIL',
              critical_failures: [
                { check: 'D1', issue: 'Invalid narrative structure — missing required fields' },
              ],
              warnings: [],
              summary: 'Structural validation failed after max retries',
            },
            attempts: attempt,
            needs_human_review: true,
            usage: totalUsage,
            model: finalModel,
          };
        }
      }

      const qaResult = await validateBriefingNarrative(payload, generationResult.narrative, apiKey);
      totalUsage.prompt_tokens += qaResult.usage.prompt_tokens || 0;
      totalUsage.completion_tokens += qaResult.usage.completion_tokens || 0;
      totalUsage.total_tokens += qaResult.usage.total_tokens || 0;

      if (qaResult.validation.overall_result === 'PASS') {
        return {
          narrative: generationResult.narrative,
          qa: qaResult.validation,
          attempts: attempt,
          needs_human_review: false,
          usage: totalUsage,
          model: finalModel,
        };
      }

      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt}: QA failed, retrying with feedback...`);
        payload = { ...payload, _qa_feedback: qaResult.validation.critical_failures };
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      } else {
        return {
          narrative: generationResult.narrative,
          qa: qaResult.validation,
          attempts: attempt,
          needs_human_review: true,
          usage: totalUsage,
          model: finalModel,
        };
      }
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed: ${error.message}. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }

  throw new Error('Unexpected error in generateWithRetry');
}
