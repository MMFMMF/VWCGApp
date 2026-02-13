/**
 * LLM Types Module
 * TypeScript interfaces for LLM-powered strategic narrative generation
 */

// BriefingNarrative — the ChatGPT generator output (Section 3 of spec)
export interface BriefingNarrative {
  headline_finding: string;
  three_words: [string, string, string];
  strengths_narrative: string;
  exposure_narrative: string;
  contradictions: Array<{ title: string; narrative: string }>;
  financial_impact: Array<{ amount_range: string; label: string; explanation: string }>;
  financial_impact_total: string;
  recommendations: Array<{
    title: string;
    why_first: string;
    what_it_looks_like: string;
    estimated_impact: string;
    first_step: string;
  }>;
  quick_wins: Array<{ phase: string; title: string; description: string }>;
  benchmarking_interpretations: {
    advisor_readiness: string;
    ai_readiness: string;
    leadership_dna: string;
    swot_risk_profile: string;
  };
}

// QAValidationResult — the ChatGPT Mini QA output (Section 5 of spec)
export interface QAValidationResult {
  overall_result: 'PASS' | 'FAIL';
  critical_failures: Array<{ check: string; issue: string }>;
  warnings: Array<{ check: string; issue: string }>;
  summary: string;
}

// GenerationResult — combined output from the pipeline
export interface GenerationResult {
  narrative: BriefingNarrative;
  qa: QAValidationResult;
  attempts: number;
  needs_human_review: boolean;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  model: string;
}

// AssessmentPayload — the complete input payload sent to the LLM (Section 2 of spec)
export interface AssessmentPayload {
  client: {
    name: string;
    company_name: string;
    industry: string;
    revenue_range: string;
    employee_count: string;
    founder_weekly_hours: string;
    years_in_business: string;
    primary_growth_goal: string;
    top_3_client_revenue_pct?: string;
    profit_margin?: string;
    biggest_frustration?: string;
  };
  advisor_readiness: Record<string, any>;
  ai_readiness: Record<string, any>;
  leadership_dna: Record<string, any>;
  swot: Record<string, any>;
  vision_canvas: Record<string, any>;
  roadmap_90day: Record<string, any>;
  derived_metrics: Record<string, any>;
  _qa_feedback?: any[]; // Appended on retry
}
