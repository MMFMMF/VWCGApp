/**
 * Synthesis Rules v2
 * 8 advanced cross-assessment rules using derived metrics and keyword analysis
 */

import type { SynthesisRule, Insight } from './types.ts';
import { computeDerivedMetrics } from './derived-metrics.ts';
import { scanSwotText, hasKeywordMatches } from './swot-keywords.ts';

/**
 * Rule 1: Vision-Execution Mismatch
 * Trigger: >3 pillars + Execution <7 (SWOT capacity keywords amplify message but don't gate it)
 */
export const visionExecutionMismatch: SynthesisRule = {
    id: 'V2_vision_execution_mismatch',
    name: 'Vision-Execution Capacity Gap',
    description: 'Detects ambitious vision paired with low execution capability',
    execute: (workspace): Insight | null => {
        const vision = workspace.tools?.['vision-canvas'];
        const dna = workspace.tools?.['leadership-dna'];

        if (!vision || !dna) return null;

        const pillarCount = Array.isArray(vision.pillars) ? vision.pillars.length : 0;
        const executionScore = dna.current_Execution ?? 5;

        if (pillarCount > 3 && executionScore < 7) {
            // Check SWOT for additional capacity evidence
            const swot = workspace.tools?.swot;
            const swotAnalysis = swot ? scanSwotText(swot) : null;
            const hasCapacityIssues = swotAnalysis ? hasKeywordMatches(swotAnalysis, 'capacity') : false;
            const capacityNote = hasCapacityIssues
                ? `, compounded by capacity constraints (${swotAnalysis!.capacity.frequency} SWOT mentions)`
                : '';

            return {
                id: 'insight_vision_exec_mismatch',
                type: 'conflict',
                severity: 'high',
                title: 'Critical Vision-Execution Mismatch',
                message: `You have ${pillarCount} strategic pillars but execution capability is only ${executionScore}/10${capacityNote}. This combination creates high risk of strategic failure — ambition outpaces capacity to deliver.`,
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
            .map((v: any) => (typeof v === 'string' ? v : v.text ?? '').toLowerCase())
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
            .map((p: any) => `${p.text ?? p.name ?? ''} ${p.kpi || ''}`.toLowerCase())
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

        // Find weakest dimension
        const weakest = dimensions
            .map(dim => ({ dim, score: aiReadiness[dim] || 0 }))
            .sort((a, b) => a.score - b.score)[0];

        // Find critical gaps: Governance and Data are essential for AI deployment
        const criticalDimensions = ['Governance', 'Data', 'Infrastructure'];
        const criticallyLow = criticalDimensions
            .filter(dim => typeof aiReadiness[dim] === 'number' && aiReadiness[dim] < 45)
            .map(dim => ({ dim, score: aiReadiness[dim] as number }));

        // Fire if: (a) overall average is low (<40%), OR (b) any critical dimension is low (<45%) while others are strong
        if (avgReadiness < 40) {
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

        if (criticallyLow.length > 0) {
            const gaps = criticallyLow.map(d => `${d.dim} (${d.score}%)`).join(', ');
            return {
                id: 'insight_tech_ambition_gap',
                type: 'risk',
                severity: 'high',
                title: 'AI Governance and Readiness Gap',
                message: `Your vision emphasizes AI/technology transformation and overall readiness is ${Math.round(avgReadiness)}%, but critical areas lag: ${gaps}. Without strong governance and infrastructure, AI initiatives carry unacceptable risk.`,
                recommendation: `Prioritize building ${criticallyLow[0].dim} capability before scaling AI initiatives. This includes policies, oversight, and compliance frameworks.`,
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

        // Check for vague north star (too short, generic/aspirational words without specifics)
        const wordCount = northStar.trim().split(/\s+/).length;
        const genericWords = ['better', 'best', 'leading', 'premier', 'top', 'great', 'excellent', 'innovative',
            'growing', 'steady', 'steadily', 'maintain', 'continue', 'keep', 'good', 'strong', 'success'];
        const hasGenericWords = genericWords.some(word =>
            new RegExp(`\\b${word}\\b`, 'i').test(northStar)
        );
        // Lacks specificity if: no numbers/metrics AND no timeline
        const hasMetrics = /\d+/.test(northStar) || /\$|\%|revenue|arr|mrr/i.test(northStar);

        const isVague = wordCount < 10 || (hasGenericWords && !hasMetrics && wordCount < 25);

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
 * Trigger: 2 of 3 conditions: FDI >= 4 (Moderate+), Empowerment gap >= 2, retirement/succession risks in SWOT
 */
export const founderSuccessionRisk: SynthesisRule = {
    id: 'V2_founder_succession_risk',
    name: 'Critical Succession Gap',
    description: 'Identifies founder dependency combined with succession risk factors',
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
        const hasBottleneckRisk = hasKeywordMatches(swotAnalysis, 'bottleneck');

        // Score conditions (need 2 of 3 to fire)
        let conditionsMet = 0;
        const evidence: string[] = [];

        if (fdi >= 4) {
            conditionsMet++;
            evidence.push(`Founder Dependency Index ${fdi.toFixed(1)}/10 (${fdi >= 7 ? 'Critical' : 'Moderate'})`);
        }
        if (empowermentGap >= 2) {
            conditionsMet++;
            evidence.push(`Empowerment gap of ${empowermentGap.toFixed(1)} points`);
        }
        if (hasRetirementRisk || hasBottleneckRisk) {
            conditionsMet++;
            const risks: string[] = [];
            if (hasRetirementRisk) risks.push('succession/retirement');
            if (hasBottleneckRisk) risks.push('bottleneck/dependency');
            evidence.push(`SWOT flags ${risks.join(' and ')} risks`);
        }

        if (conditionsMet >= 2) {
            const severity = fdi >= 7 || (conditionsMet === 3) ? 'high' : 'medium' as const;
            return {
                id: 'insight_succession_crisis',
                type: 'risk',
                severity,
                title: fdi >= 7 ? 'Critical Founder Succession Risk' : 'Founder Succession Risk',
                message: `${evidence.join('. ')}. The business is ${fdi >= 7 ? 'highly' : 'moderately'} vulnerable to founder transition.`,
                recommendation: 'Create succession plan: 1) Document critical processes founder currently owns, 2) Cross-train team on founder responsibilities, 3) Hire/promote empowered leaders, 4) Build continuity plan for unexpected absence.',
                relatedTools: ['leadership-dna', 'swot']
            };
        }

        return null;
    }
};

/**
 * Rule 6: Under-Leveraged Resources
 * Trigger: Strong Financial Health (avg f1-f5 >= 4) + weak strategic alignment
 */
export const underLeveragedResources: SynthesisRule = {
    id: 'V2_under_leveraged_resources',
    name: 'Under-Leveraged Financial Position',
    description: 'Identifies strong financial position not being used for strategic advantage',
    execute: (workspace): Insight | null => {
        const advisor = workspace.tools?.['advisor-readiness'];

        if (!advisor?.answers) return null;

        // Compute average financial health from f1-f5
        const financialQuestions = ['f1', 'f2', 'f3', 'f4', 'f5'];
        const fScores = financialQuestions
            .map(q => advisor.answers[q])
            .filter((v: unknown): v is number => typeof v === 'number');
        if (fScores.length === 0) return null;

        const avgFinancialHealth = fScores.reduce((sum: number, val: number) => sum + val, 0) / fScores.length;

        // Also compute strategic alignment average from s1-s5
        const strategicQuestions = ['s1', 's2', 's3', 's4', 's5'];
        const sScores = strategicQuestions
            .map(q => advisor.answers[q])
            .filter((v: unknown): v is number => typeof v === 'number');
        const avgStrategic = sScores.length > 0
            ? sScores.reduce((sum: number, val: number) => sum + val, 0) / sScores.length
            : 3;

        const metrics = computeDerivedMetrics(workspace);

        // Strong financials (avg >= 4) + weak strategic alignment (avg <= 2.5 or coherence not aligned)
        const strongFinancials = avgFinancialHealth >= 4;
        const weakAlignment = avgStrategic <= 2.5 ||
            metrics.strategicCoherence === 'severely_misaligned' ||
            metrics.strategicCoherence === 'misaligned' ||
            metrics.strategicCoherence === 'partially_aligned';

        if (strongFinancials && weakAlignment) {
            const financialPct = Math.round((avgFinancialHealth / 5) * 100);
            const strategicPct = Math.round((avgStrategic / 5) * 100);
            return {
                id: 'insight_underutilized_capital',
                type: 'opportunity',
                severity: 'medium',
                title: 'Under-Leveraged Financial Strength',
                message: `Financial Health is strong (${financialPct}%) but Strategic Alignment is only ${strategicPct}%. You have the resources to invest in growth but lack clear strategic direction to deploy them effectively.`,
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
 * Trigger: Execution is largest gap + gap > 2 (SWOT delivery keywords amplify but don't gate)
 * Also triggers when Execution or Empowerment gap > 3 even if not the single largest
 */
export const executionCrisisDominance: SynthesisRule = {
    id: 'V2_execution_crisis_dominance',
    name: 'Execution Capability Crisis',
    description: 'Execution is the dominant gap with evidence of delivery problems',
    execute: (workspace): Insight | null => {
        const dna = workspace.tools?.['leadership-dna'];

        if (!dna) return null;

        // Skip if Rule 1 already covers this (>3 pillars + execution gap)
        const vision = workspace.tools?.['vision-canvas'];
        const pillarCount = vision?.pillars && Array.isArray(vision.pillars) ? vision.pillars.length : 0;

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

        const executionGap = (dna.target_Execution ?? 8) - (dna.current_Execution ?? 5);
        const empowermentGap = (dna.target_Empowerment ?? 8) - (dna.current_Empowerment ?? 5);

        // Fire if execution is the biggest gap (but not when Rule 1 already covers it with >3 pillars)
        const executionIsDominant = maxGapDimension === 'Execution' && maxGap > 2 && pillarCount <= 3;
        // Also fire on severe empowerment+execution combo
        const severeEmpowermentGap = empowermentGap > 3 && executionGap > 2 && pillarCount <= 3;

        if (!executionIsDominant && !severeEmpowermentGap) return null;

        const executionCurrent = dna.current_Execution ?? 5;

        // Check SWOT for delivery evidence (amplifies message)
        const swot = workspace.tools?.swot;
        const swotAnalysis = swot ? scanSwotText(swot) : null;
        const hasDeliveryIssues = swotAnalysis ? hasKeywordMatches(swotAnalysis, 'delivery') : false;
        const deliveryNote = hasDeliveryIssues
            ? ` SWOT analysis confirms with ${swotAnalysis!.delivery.frequency} delivery-related concerns.`
            : '';

        const gapDetails: string[] = [];
        if (executionGap > 3) gapDetails.push(`Execution gap: ${executionGap.toFixed(1)} points (current ${executionCurrent}/10)`);
        if (severeEmpowermentGap) gapDetails.push(`Empowerment gap: ${empowermentGap.toFixed(1)} points`);
        if (executionIsDominant && executionGap <= 3) gapDetails.push(`Execution is largest leadership gap (${maxGap.toFixed(1)} points)`);

        return {
            id: 'insight_execution_crisis',
            type: 'risk',
            severity: 'high',
            title: 'Execution Capability Crisis',
            message: `${gapDetails.join('. ')}.${deliveryNote} This pattern indicates systemic execution and delegation problems that limit the organization's ability to deliver on its strategic vision.`,
            recommendation: 'IMMEDIATE ACTION: 1) Audit current commitments and cut 30%, 2) Hire experienced operations leader (COO/Director of Ops), 3) Implement weekly execution reviews, 4) Document and standardize core processes.',
            relatedTools: ['leadership-dna', 'swot']
        };
    }
};

/**
 * Rule 9: Founder Trap
 * Trigger: Reputation/experience listed as SWOT strength + founder dependency in weaknesses
 * This catches the classic SMB pattern where the founder IS the business's competitive advantage,
 * making the business unsaleable and unscalable.
 */
export const founderTrap: SynthesisRule = {
    id: 'V2_founder_trap',
    name: 'The Founder Trap',
    description: 'Business competitive advantage is the founder themselves, creating a scalability ceiling',
    execute: (workspace): Insight | null => {
        const swot = workspace.tools?.swot;
        const dna = workspace.tools?.['leadership-dna'];

        if (!swot || !dna) return null;

        // Check strengths for personal/founder-linked advantages (not team capabilities)
        const strengths = Array.isArray(swot.strengths) ? swot.strengths : [];
        const strengthText = strengths.map((s: any) => s.text?.toLowerCase() || '').join(' ');
        const personalKeywords = /\b(reputation|relationships|network|personal|decades|years of|trusted|loyalty|loyal|founder|owner)\b/;
        const hasReputationStrength = personalKeywords.test(strengthText);

        if (!hasReputationStrength) return null;

        // Check weaknesses for dependency/bottleneck
        const swotAnalysis = scanSwotText(swot);
        const hasBottleneck = hasKeywordMatches(swotAnalysis, 'bottleneck');

        if (!hasBottleneck) return null;

        // Additional severity indicator: low empowerment
        const empowerment = dna.current_Empowerment ?? 5;
        const isSevere = empowerment < 5;

        return {
            id: 'insight_founder_trap',
            type: 'conflict',
            severity: isSevere ? 'high' : 'medium',
            title: 'The Founder Trap',
            message: `Your biggest competitive advantage (reputation, experience, relationships) is inseparable from you personally, while SWOT weaknesses show dependency and bottleneck patterns. ${isSevere ? `With Empowerment at ${empowerment}/10, the business cannot operate independently.` : ''} This means the business can't scale beyond your personal capacity and has limited transferable value.`,
            recommendation: 'Begin separating personal reputation from business brand: 1) Document and systematize your approach, 2) Build team members into client-facing roles, 3) Create IP and processes that work without you, 4) Develop the business brand independently of founder identity.',
            relatedTools: ['swot', 'leadership-dna']
        };
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
    executionCrisisDominance,
    founderTrap
];
