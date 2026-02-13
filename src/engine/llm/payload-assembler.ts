/**
 * Payload Assembler Module
 * Gathers all workspace data and computes derived metrics into the spec's payload format
 */

import { computeDerivedMetrics } from '../derived-metrics.ts';
import { runSynthesis } from '../synthesis.ts';
import type { AssessmentPayload } from './types.ts';

/**
 * Assembles the complete LLM payload from workspace data
 */
export function assemblePayload(workspace: { tools: Record<string, any>; metadata: any }): AssessmentPayload {
  const { tools, metadata } = workspace;

  // Compute derived metrics
  const derivedMetrics = computeDerivedMetrics(workspace);

  // Run synthesis to get contradiction insights
  const insights = runSynthesis(workspace);
  const contradictionInsights = insights.filter((i) => i.type === 'conflict');

  // --- CLIENT BLOCK ---
  const businessContext = tools['business-context'] || {};
  const client = {
    name: metadata.name || 'Client',
    company_name: metadata.name || 'Company',
    industry: businessContext.industry || 'Not specified',
    revenue_range: businessContext.revenueRange || '<1M',
    employee_count: businessContext.employeeCount || '1-5',
    founder_weekly_hours: businessContext.founderHours || '<40',
    years_in_business: businessContext.yearsInBusiness || '<2',
    primary_growth_goal: businessContext.growthGoal || 'Not specified',
  };

  // --- ADVISOR READINESS BLOCK ---
  const advisorData = tools['advisor-readiness'] || {};
  let advisor_readiness: Record<string, any> = { status: 'incomplete' };

  if (advisorData.answers && Object.keys(advisorData.answers).length > 0) {
    // Compute category averages
    const strategicQuestions = [
      'q1_strategic_alignment',
      'q2_vision_clarity',
      'q3_competitive_positioning',
      'q4_market_understanding',
      'q5_revenue_model',
    ];
    const operationalQuestions = [
      'q6_operational_foundation',
      'q7_delegation',
      'q8_process_discipline',
      'q9_team_scalability',
      'q10_financial_health',
    ];
    const financialQuestions = ['q10_financial_health', 'q15_cash_management'];
    const culturalQuestions = ['q11_cultural_readiness', 'q12_change_appetite', 'q13_learning_culture'];

    const computeAverage = (questions: string[]) => {
      const scores = questions.map((q) => advisorData.answers[q]).filter((v): v is number => typeof v === 'number');
      return scores.length > 0 ? Math.round((scores.reduce((sum, val) => sum + val, 0) / scores.length / 5) * 100) : 50;
    };

    const strategic_alignment = computeAverage(strategicQuestions);
    const operational_maturity = computeAverage(operationalQuestions);
    const financial_health = computeAverage(financialQuestions);
    const cultural_readiness = computeAverage(culturalQuestions);
    const overall_score = Math.round((strategic_alignment + operational_maturity + financial_health + cultural_readiness) / 4);

    // Map overall score to stage
    let stage = 'Emerging';
    if (overall_score >= 80) stage = 'Advisory-Ready';
    else if (overall_score >= 60) stage = 'Growing';
    else if (overall_score >= 40) stage = 'Emerging';
    else stage = 'Foundational';

    advisor_readiness = {
      strategic_alignment,
      operational_maturity,
      financial_health,
      cultural_readiness,
      overall_score,
      stage,
    };
  }

  // --- AI READINESS BLOCK ---
  const aiData = tools['ai-readiness'] || {};
  let ai_readiness: Record<string, any> = { status: 'incomplete' };

  if (
    aiData.Strategy !== undefined ||
    aiData.Data !== undefined ||
    aiData.Infrastructure !== undefined ||
    aiData.Talent !== undefined ||
    aiData.Governance !== undefined ||
    aiData.Culture !== undefined
  ) {
    const strategy = aiData.Strategy ?? 0;
    const data = aiData.Data ?? 0;
    const infrastructure = aiData.Infrastructure ?? 0;
    const talent = aiData.Talent ?? 0;
    const governance = aiData.Governance ?? 0;
    const culture = aiData.Culture ?? 0;

    const average = Math.round((strategy + data + infrastructure + talent + governance + culture) / 6);

    // Map average to stage
    let stage = 'Foundational';
    if (average >= 80) stage = 'Advanced';
    else if (average >= 60) stage = 'Operational';
    else if (average >= 40) stage = 'Developing';
    else stage = 'Foundational';

    ai_readiness = {
      strategy,
      data,
      infrastructure,
      talent,
      governance,
      culture,
      average,
      stage,
    };
  }

  // --- LEADERSHIP DNA BLOCK ---
  const dnaData = tools['leadership-dna'] || {};
  let leadership_dna: Record<string, any> = { status: 'incomplete' };

  if (
    dnaData.current_Vision !== undefined ||
    dnaData.current_Execution !== undefined ||
    dnaData.current_Empowerment !== undefined
  ) {
    const dimensions = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];
    const dnaFormatted: Record<string, any> = {};

    dimensions.forEach((dim) => {
      const current = dnaData[`current_${dim}`] ?? 5;
      const target = dnaData[`target_${dim}`] ?? 8;
      const gap = Math.max(0, target - current);
      dnaFormatted[dim.toLowerCase()] = { current, target, gap };
    });

    leadership_dna = dnaFormatted;
  }

  // --- SWOT BLOCK ---
  const swotData = tools['swot'] || {};
  let swot: Record<string, any> = { status: 'incomplete' };

  if (
    Array.isArray(swotData.strengths) ||
    Array.isArray(swotData.weaknesses) ||
    Array.isArray(swotData.opportunities) ||
    Array.isArray(swotData.threats)
  ) {
    swot = {
      strengths: (swotData.strengths || []).map((s: any) => s.text || ''),
      weaknesses: (swotData.weaknesses || []).map((w: any) => w.text || ''),
      opportunities: (swotData.opportunities || []).map((o: any) => o.text || ''),
      threats: (swotData.threats || []).map((t: any) => t.text || ''),
    };
  }

  // --- VISION CANVAS BLOCK ---
  const visionData = tools['vision-canvas'] || {};
  let vision_canvas: Record<string, any> = { status: 'incomplete' };

  if (visionData.northStar || Array.isArray(visionData.pillars) || Array.isArray(visionData.values)) {
    vision_canvas = {
      north_star: visionData.northStar || '',
      pillars: (visionData.pillars || []).map((p: any) => ({
        name: p.text || p.name || '',
        kpi: p.kpi || '',
      })),
      core_values:
        (visionData.values || []).map((v: any) => (typeof v === 'string' ? v : v.text || '')) || [],
    };
  }

  // --- ROADMAP 90-DAY BLOCK ---
  const roadmapData = tools['roadmap'] || {};
  let roadmap_90day: Record<string, any> = { status: 'incomplete' };

  if (Array.isArray(roadmapData.tasks)) {
    roadmap_90day = {
      tasks: roadmapData.tasks.map((t: any) => ({
        name: t.title || '',
        owner: t.owner || 'Unassigned',
        phase: t.phase || 'Not scheduled',
        status: t.status || 'Not started',
      })),
    };
  }

  // --- DERIVED METRICS BLOCK ---
  const derived_metrics: Record<string, any> = {
    execution_ambition_ratio: {
      value: derivedMetrics.executionAmbitionRatio,
      interpretation:
        derivedMetrics.executionAmbitionRatio > 1.0
          ? 'Execution capacity exceeds strategic ambition — room to take on more'
          : derivedMetrics.executionAmbitionRatio >= 0.7
            ? 'Execution roughly matches ambition — proceed with caution'
            : 'Ambition exceeds execution capacity — overextension risk',
    },
    founder_dependency_index: {
      value: derivedMetrics.founderDependencyIndex,
      interpretation:
        derivedMetrics.founderDependencyIndex <= 3
          ? 'Low dependency — team is empowered'
          : derivedMetrics.founderDependencyIndex <= 6
            ? 'Moderate dependency — transition needed'
            : 'Critical dependency — major bottleneck risk',
    },
    strategic_coherence: {
      value: derivedMetrics.strategicCoherence,
      details: derivedMetrics.strategicCoherenceDetails,
    },
    organizational_readiness: {
      value: derivedMetrics.organizationalReadinessScore,
      label: derivedMetrics.organizationalReadinessLabel,
      interpretation:
        derivedMetrics.organizationalReadinessScore >= 76
          ? 'Team is eager for change and innovation'
          : derivedMetrics.organizationalReadinessScore >= 51
            ? 'Team will accept change when rationale is clear and pace is manageable'
            : derivedMetrics.organizationalReadinessScore >= 26
              ? 'Team is cautious about change — requires strong change management'
              : 'Team is resistant to change — high change management overhead',
    },
    leadership_archetype: {
      name: derivedMetrics.leadershipArchetype.archetype,
      description: derivedMetrics.leadershipArchetype.description,
    },
    contradictions_detected: contradictionInsights.map((insight, index) => {
      // Map insight type to contradiction type
      let contradictionType = 'General Mismatch';
      if (insight.title.toLowerCase().includes('vision') && insight.title.toLowerCase().includes('execution')) {
        contradictionType = 'Vision-Execution Mismatch';
      } else if (insight.title.toLowerCase().includes('value') || insight.title.toLowerCase().includes('culture')) {
        contradictionType = 'Values-Reality Gap';
      } else if (insight.title.toLowerCase().includes('ai') || insight.title.toLowerCase().includes('technology')) {
        contradictionType = 'Technology Gap';
      } else if (insight.title.toLowerCase().includes('strategic') || insight.title.toLowerCase().includes('drift')) {
        contradictionType = 'Strategic Drift';
      } else if (insight.title.toLowerCase().includes('founder') || insight.title.toLowerCase().includes('dependency')) {
        contradictionType = 'Founder Trap';
      }

      return {
        id: index + 1,
        type: contradictionType,
        severity: insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1),
        detail: insight.message,
        assessments: insight.relatedTools,
      };
    }),
  };

  return {
    client,
    advisor_readiness,
    ai_readiness,
    leadership_dna,
    swot,
    vision_canvas,
    roadmap_90day,
    derived_metrics,
  };
}
