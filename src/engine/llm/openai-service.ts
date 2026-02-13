/**
 * OpenAI Service Module
 * Handles API calls to OpenAI for strategic narrative generation and QA validation
 * Uses browser-native fetch (not the openai SDK) for client-side SPA usage
 */

import type { AssessmentPayload, BriefingNarrative, QAValidationResult, GenerationResult } from './types.ts';
import { GENERATOR_SYSTEM_PROMPT, QA_VALIDATOR_SYSTEM_PROMPT } from './prompts.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
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

  // Check array lengths
  if (!Array.isArray(narrative.recommendations) || narrative.recommendations.length !== 3) return false;
  if (!Array.isArray(narrative.quick_wins) || narrative.quick_wins.length !== 3) return false;
  if (!Array.isArray(narrative.three_words) || narrative.three_words.length !== 3) return false;

  return true;
}

/**
 * Generate briefing narrative using ChatGPT
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

  // If QA feedback exists (retry), append it
  if (payload._qa_feedback && payload._qa_feedback.length > 0) {
    userMessage += `\n\nIMPORTANT: A quality review flagged the following issues in your previous output. Please correct these specific problems in your revised output:\n\n${JSON.stringify(
      payload._qa_feedback,
      null,
      2
    )}\n\nRegenerate the complete narrative with these issues fixed.`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'chatgpt-4o-latest',
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: GENERATOR_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        throw new Error(
          `Rate limit exceeded. ${retryAfter ? `Retry after ${retryAfter} seconds.` : 'Please try again later.'}`
        );
      }

      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY.');
      }

      if (response.status >= 500) {
        throw new Error(`OpenAI server error (${response.status}). Please try again.`);
      }

      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const narrative = JSON.parse(data.choices[0].message.content);

    return {
      narrative,
      usage: data.usage,
      model: data.model,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Generation timed out after 120 seconds. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate briefing narrative using ChatGPT Mini
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QA_TIMEOUT);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.0,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: QA_VALIDATOR_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        throw new Error(
          `Rate limit exceeded. ${retryAfter ? `Retry after ${retryAfter} seconds.` : 'Please try again later.'}`
        );
      }

      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY.');
      }

      if (response.status >= 500) {
        throw new Error(`OpenAI server error (${response.status}). Please try again.`);
      }

      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const validation = JSON.parse(data.choices[0].message.content);

    return {
      validation,
      usage: data.usage,
      model: data.model,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('QA validation timed out after 30 seconds. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate narrative with retry logic and QA validation
 * Implements the full two-model pipeline from the spec
 */
export async function generateWithRetry(
  payload: AssessmentPayload,
  apiKey: string,
  maxRetries = 2
): Promise<GenerationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT * maxRetries);

  try {
    let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    let finalModel = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Generate narrative
        const generationResult = await generateBriefingNarrative(payload, apiKey);
        totalUsage.prompt_tokens += generationResult.usage.prompt_tokens || 0;
        totalUsage.completion_tokens += generationResult.usage.completion_tokens || 0;
        totalUsage.total_tokens += generationResult.usage.total_tokens || 0;
        finalModel = generationResult.model;

        // Validate structure
        if (!isValidNarrativeStructure(generationResult.narrative)) {
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt}: Invalid narrative structure, retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
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

        // Run QA validation
        const qaResult = await validateBriefingNarrative(payload, generationResult.narrative, apiKey);
        totalUsage.prompt_tokens += qaResult.usage.prompt_tokens || 0;
        totalUsage.completion_tokens += qaResult.usage.completion_tokens || 0;
        totalUsage.total_tokens += qaResult.usage.total_tokens || 0;

        if (qaResult.validation.overall_result === 'PASS') {
          // Success - return result
          return {
            narrative: generationResult.narrative,
            qa: qaResult.validation,
            attempts: attempt,
            needs_human_review: false,
            usage: totalUsage,
            model: finalModel,
          };
        }

        // QA failed
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt}: QA failed, retrying with feedback...`);
          // Clone payload and add QA feedback for retry
          payload = { ...payload, _qa_feedback: qaResult.validation.critical_failures };
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        } else {
          // Max retries reached
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
        if (attempt === maxRetries) {
          throw error;
        }
        console.log(`Attempt ${attempt} failed: ${error.message}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Unexpected error in generateWithRetry');
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Generation pipeline timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
