/**
 * Synthesis Rules v2
 * 8 advanced cross-assessment rules using derived metrics and keyword analysis
 */

import type { SynthesisRule, Insight } from './types.ts';
import { computeDerivedMetrics } from './derived-metrics.ts';
import { scanSwotText, hasKeywordMatches } from './swot-keywords.ts';

/**
 * Rule 1: Vision-Execution Mismatch
 * Trigger: >3 pillars + Execution <7 + SWOT capacity keywords
 */
export const visionExecutionMismatch: SynthesisRule = {
    id: 'V2_vision_execution_mismatch',
    name: 'Vision-Execution Capacity Gap',
    description: 'Detects ambitious vision paired with low execution capability and capacity constraints',
    execute: (workspace): Insight | null => {
        const vision = workspace.tools?.['vision-canvas'];
        const dna = workspace.tools?.['leadership-dna'];
        const swot = workspace.tools?.swot;

        if (!vision || !dna || !swot) return null;

        const pillarCount = Array.isArray(vision.pillars) ? vision.pillars.length : 0;
        const executionScore = dna.current_Execution ?? 5;

        const swotAnalysis = scanSwotText(swot);
        const hasCapacityIssues = hasKeywordMatches(swotAnalysis, 'capacity');

        if (pillarCount > 3 && executionScore < 7 && hasCapacityIssues) {
            return {
                id: 'insight_vision_exec_mismatch',
                type: 'conflict',
                severity: 'high',
                title: 'Critical Vision-Execution Mismatch',
                message: `You have ${pillarCount} strategic pillars but execution capability is only ${executionScore}/10, and SWOT analysis reveals capacity constraints (${swotAnalysis.capacity.frequency} mentions). This combination creates high risk of strategic failure.`,
                recommendation: 'Reduce to 2-3 critical pillars OR hire operational leadership (COO/VP Operations) OR address capacity issues before expanding scope.',
                relatedTools: ['vision-canvas', 'leadership-dna', 'swot']
            };
        }

        return null;
    }
};

/**
 * Rule 2: Values-Reality Contradiction
 * Trigger: balance/people values + burnout SWOT/70+ founder hours
 */
export const valuesRealityContradiction: SynthesisRule = {
    id: 'V2_values_reality_contradiction',
    name: 'Core Values vs. Reality Gap',
    description: 'Identifies contradictions between stated values and operational reality',
    execute: (workspace): Insight | null => {
        const vision = workspace.tools?.['vision-canvas'];
        const swot = workspace.tools?.swot;
        const businessContext = workspace.tools?.['business-context'];

        if (!vision || !swot) return null;

        // Check for balance/people-first values
        const valuesText = (vision.values || [])
            .map((v: string) => v.toLowerCase())
            .join(' ');
        const hasBalanceValues = /\b(balance|wellbeing|people|culture|work-life|wellness|family|health)\b/.test(valuesText);

        if (!hasBalanceValues) return null;

        // Check SWOT for burnout/capacity indicators
        const swotAnalysis = scanSwotText(swot);
        const hasBurnoutIndicators = hasKeywordMatches(swotAnalysis, 'capacity');

        // Check founder hours
        const founderHours = businessContext?.founderHours;
        const excessiveHours = founderHours === '70-80' || founderHours === '80+';

        if (hasBurnoutIndicators || excessiveHours) {
            const evidencePoints: string[] = [];
            if (hasBurnoutIndicators) {
                evidencePoints.push(`${swotAnalysis.capacity.frequency} capacity/burnout mentions in SWOT`);
            }
            if (excessiveHours) {
                evidencePoints.push(`founder working ${founderHours} hours/week`);
            }

            return {
                id: 'insight_values_reality_gap',
                type: 'conflict',
                severity: 'medium',
                title: 'Values-Reality Contradiction',
                message: `Your core values emphasize balance and wellbeing, but operational reality shows: ${evidencePoints.join(', ')}. This misalignment can erode trust and culture.`,
                recommendation: 'Either adjust operational practices to match values (reduce hours, hire support, delegate) OR revise values to reflect actual priorities.',
                relatedTools: ['vision-canvas', 'swot', 'business-context']
            };
        }

        return null;
    }
};

/**
 * Rule 3: Technology Ambition Gap
 * Trigger: AI vision pillars + AI Readiness <40%
 */
export const technologyAmbitionGap: SynthesisRule = {
    id: 'V2_technology_ambition_gap',
    name: 'Technology Vision-Capability Gap',
    description: 'Detects AI/technology strategic ambitions without foundational readiness',
    execute: (workspace): Insight | null => {
        const vision = workspace.tools?.['vision-canvas'];
        const aiReadiness = workspace.tools?.['ai-readiness'];

        if (!vision || !aiReadiness) return null;

        // Check if vision mentions AI/technology
        const pillarText = (vision.pillars || [])
            .map((p: any) => `${p.name} ${p.kpi || ''}`.toLowerCase())
            .join(' ');
        const northStarText = (vision.northStar || '').toLowerCase();
        const visionText = `${pillarText} ${northStarText}`;

        const hasTechFocus = /\b(ai|artificial intelligence|automation|digital|technology|ml|machine learning|data|analytics)\b/.test(visionText);

        if (!hasTechFocus) return null;

        // Calculate average AI readiness
        const dimensions = ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture'];
        const scores = dimensions
            .map(dim => aiReadiness[dim])
            .filter((v): v is number => typeof v === 'number');

        if (scores.length === 0) return null;

        const avgReadiness = scores.reduce((sum, val) => sum + val, 0) / scores.length;

        if (avgReadiness < 40) {
            // Find weakest dimension
            const weakest = dimensions
                .map(dim => ({ dim, score: aiReadiness[dim] || 0 }))
                .sort((a, b) => a.score - b.score)[0];

            return {
                id: 'insight_tech_ambition_gap',
                type: 'risk',
                severity: 'high',
                title: 'Technology Ambition Without Foundation',
                message: `Your vision emphasizes AI/technology transformation, but AI Readiness is only ${Math.round(avgReadiness)}%. Weakest area: ${weakest.dim} (${weakest.score}%). This gap creates execution risk.`,
                recommendation: `Before pursuing AI initiatives, build foundation in ${weakest.dim}. Consider: hire AI talent, invest in data infrastructure, or partner with technology vendors.`,
                relatedTools: ['vision-canvas', 'ai-readiness']
            };
        }

        return null;
    }
};

/**
 * Rule 4: Strategic Drift Risk
 * Trigger: vague north star + Vision <6
 */
export const strategicDriftRisk: SynthesisRule = {
    id: 'V2_strategic_drift_risk',
    name: 'Strategic Clarity Deficit',
    description: 'Identifies risk of strategic drift from vague vision and low leadership vision capability',
    execute: (workspace): Insight | null => {
        const vision = workspace.tools?.['vision-canvas'];
        const dna = workspace.tools?.['leadership-dna'];

        if (!vision || !dna) return null;

        const northStar = vision.northStar || '';
        const visionScore = dna.current_Vision ?? 5;

        // Check for vague north star (too short, generic words)
        const wordCount = northStar.trim().split(/\s+/).length;
        const genericWords = ['better', 'best', 'leading', 'premier', 'top', 'great', 'excellent', 'innovative'];
        const hasGenericWords = genericWords.some(word =>
            new RegExp(`\\b${word}\\b`, 'i').test(northStar)
        );

        const isVague = wordCount < 10 || (hasGenericWords && wordCount < 20);

        if (isVague && visionScore < 6) {
            return {
                id: 'insight_strategic_drift',
                type: 'risk',
                severity: 'medium',
                title: 'Strategic Drift Risk',
                message: `Your North Star lacks specificity (${wordCount} words${hasGenericWords ? ', uses generic terms' : ''}) and Vision leadership capability is ${visionScore}/10. This combination increases risk of strategic drift and misalignment.`,
                recommendation: 'Clarify North Star with specific, measurable outcomes. Include: target customer segment, unique value proposition, and 3-5 year timeline. Consider working with a strategic advisor.',
                relatedTools: ['vision-canvas', 'leadership-dna']
            };
        }

        return null;
    }
};

/**
 * Rule 5: Founder Succession Risk
 * Trigger: FDI >6 + retirement threats + Empowerment gap >2
 */
export const founderSuccessionRisk: SynthesisRule = {
    id: 'V2_founder_succession_risk',
    name: 'Critical Succession Gap',
    description: 'Identifies high founder dependency combined with succession risk factors',
    execute: (workspace): Insight | null => {
        const dna = workspace.tools?.['leadership-dna'];
        const swot = workspace.tools?.swot;

        if (!dna || !swot) return null;

        const metrics = computeDerivedMetrics(workspace);
        const fdi = metrics.founderDependencyIndex;

        const currentEmpowerment = dna.current_Empowerment ?? 5;
        const targetEmpowerment = dna.target_Empowerment ?? 8;
        const empowermentGap = targetEmpowerment - currentEmpowerment;

        const swotAnalysis = scanSwotText(swot);
        const hasRetirementRisk = hasKeywordMatches(swotAnalysis, 'retirement');

        if (fdi > 6 && empowermentGap > 2 && hasRetirementRisk) {
            return {
                id: 'insight_succession_crisis',
                type: 'risk',
                severity: 'high',
                title: 'Critical Founder Succession Risk',
                message: `Founder Dependency Index is ${fdi.toFixed(1)}/10 (Critical), Empowerment gap is ${empowermentGap.toFixed(1)} points, and SWOT analysis flags succession/retirement risks. The business is highly vulnerable to founder transition.`,
                recommendation: 'URGENT: Create succession plan with these steps: 1) Document critical processes, 2) Cross-train team on founder responsibilities, 3) Hire/promote empowered leaders, 4) Build "hit by bus" continuity plan.',
                relatedTools: ['leadership-dna', 'swot']
            };
        }

        return null;
    }
};

/**
 * Rule 6: Under-Leveraged Resources
 * Trigger: Financial Health >80% + Strategic Alignment <50%
 */
export const underLeveragedResources: SynthesisRule = {
    id: 'V2_under_leveraged_resources',
    name: 'Under-Leveraged Financial Position',
    description: 'Identifies strong financial position not being used for strategic advantage',
    execute: (workspace): Insight | null => {
        const advisor = workspace.tools?.['advisor-readiness'];

        if (!advisor?.answers?.q10_financial_health) return null;

        const financialHealth = advisor.answers.q10_financial_health;
        const metrics = computeDerivedMetrics(workspace);

        // Financial health 4-5 = 80-100%
        const strongFinancials = financialHealth >= 4;
        const weakAlignment = metrics.strategicCoherence === 'misaligned' ||
            metrics.strategicCoherence === 'partially_aligned';

        if (strongFinancials && weakAlignment) {
            return {
                id: 'insight_underutilized_capital',
                type: 'opportunity',
                severity: 'medium',
                title: 'Under-Leveraged Financial Strength',
                message: `You have strong financial health (${financialHealth}/5) but strategic alignment is ${metrics.strategicCoherence}. This suggests resources are not being optimally deployed toward strategic priorities.`,
                recommendation: 'Use financial strength strategically: hire for leadership gaps, invest in technology/AI readiness, or acquire complementary capabilities. Align spending with strategic pillars.',
                relatedTools: ['advisor-readiness', 'vision-canvas', 'leadership-dna']
            };
        }

        return null;
    }
};

/**
 * Rule 7: Willing But Unable
 * Trigger: AI Culture >60% + AI Infrastructure <30%
 */
export const willingButUnable: SynthesisRule = {
    id: 'V2_willing_but_unable',
    name: 'Culture-Infrastructure Mismatch',
    description: 'Team is culturally ready for AI but lacks technical foundation',
    execute: (workspace): Insight | null => {
        const aiReadiness = workspace.tools?.['ai-readiness'];

        if (!aiReadiness) return null;

        const culture = aiReadiness.Culture ?? 0;
        const infrastructure = aiReadiness.Infrastructure ?? 0;

        if (culture > 60 && infrastructure < 30) {
            return {
                id: 'insight_willing_unable',
                type: 'opportunity',
                severity: 'high',
                title: 'Team Ready, Infrastructure Not',
                message: `AI Culture score is strong (${culture}%), indicating team readiness and buy-in. However, Infrastructure is only ${infrastructure}%. You have willing people but lack enabling systems.`,
                recommendation: 'Capitalize on cultural readiness by investing in infrastructure: cloud platforms, data pipelines, API access, development tools. Start with low-code AI tools to show quick wins.',
                relatedTools: ['ai-readiness']
            };
        }

        return null;
    }
};

/**
 * Rule 8: Execution Crisis Dominance
 * Trigger: largest gap is Execution + gap >2 + delivery SWOT keywords
 */
export const executionCrisisDominance: SynthesisRule = {
    id: 'V2_execution_crisis_dominance',
    name: 'Execution Capability Crisis',
    description: 'Execution is the dominant gap with evidence of delivery problems',
    execute: (workspace): Insight | null => {
        const dna = workspace.tools?.['leadership-dna'];
        const swot = workspace.tools?.swot;

        if (!dna || !swot) return null;

        // Find largest leadership gap
        const dimensions = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];
        let maxGap = 0;
        let maxGapDimension = '';

        dimensions.forEach(dim => {
            const current = dna[`current_${dim}`] ?? 5;
            const target = dna[`target_${dim}`] ?? 8;
            const gap = target - current;
            if (gap > maxGap) {
                maxGap = gap;
                maxGapDimension = dim;
            }
        });

        if (maxGapDimension !== 'Execution' || maxGap <= 2) return null;

        // Check for delivery problems in SWOT
        const swotAnalysis = scanSwotText(swot);
        const hasDeliveryIssues = hasKeywordMatches(swotAnalysis, 'delivery');

        if (hasDeliveryIssues) {
            const executionCurrent = dna.current_Execution ?? 5;

            return {
                id: 'insight_execution_crisis',
                type: 'risk',
                severity: 'high',
                title: 'Execution Capability Crisis',
                message: `Execution is your largest leadership gap (${maxGap.toFixed(1)} points, current ${executionCurrent}/10) and SWOT analysis shows ${swotAnalysis.delivery.frequency} delivery-related concerns. This pattern indicates systemic execution problems.`,
                recommendation: 'IMMEDIATE ACTION: 1) Audit current commitments and cut 30%, 2) Hire experienced operations leader (COO/Director of Ops), 3) Implement weekly execution reviews, 4) Document and standardize core processes.',
                relatedTools: ['leadership-dna', 'swot']
            };
        }

        return null;
    }
};

// Export all rules as array for easy registration
export const rulesV2: SynthesisRule[] = [
    visionExecutionMismatch,
    valuesRealityContradiction,
    technologyAmbitionGap,
    strategicDriftRisk,
    founderSuccessionRisk,
    underLeveragedResources,
    willingButUnable,
    executionCrisisDominance
];
