/**
 * LLM Module Barrel Export
 * Public API for strategic narrative generation
 */

export type { BriefingNarrative, QAValidationResult, GenerationResult, AssessmentPayload } from './types.ts';
export { generateWithRetry } from './openai-service.ts';
export { assemblePayload } from './payload-assembler.ts';
export { GENERATOR_SYSTEM_PROMPT, QA_VALIDATOR_SYSTEM_PROMPT } from './prompts.ts';
