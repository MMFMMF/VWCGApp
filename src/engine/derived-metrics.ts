/**
 * Derived Metrics Module
 * Computes 6 cross-assessment metrics from workspace data
 */

export interface LeadershipArchetype {
    archetype: string;
    description: string;
    recommendation: string;
}

export interface RevenueRiskEstimate {
    low: number;
    high: number;
    currency: 'USD';
}

export interface DerivedMetrics {
    executionAmbitionRatio: number;
    founderDependencyIndex: number;
    strategicCoherence: 'aligned' | 'partially_aligned' | 'misaligned';
    strategicCoherenceDetails: string;
    revenueRiskEstimate: RevenueRiskEstimate;
    organizationalReadinessScore: number;
    organizationalReadinessLabel: string;
    leadershipArchetype: LeadershipArchetype;
}

/**
 * Metric 1: Execution-Ambition Ratio
 * Formula: (Leadership Execution Score + Operational Maturity Score) / (Number of Vision Pillars × 2)
 * Interpretation: > 1.0 = good, 0.7-1.0 = balanced, < 0.7 = overextension risk
 */
function computeExecutionAmbitionRatio(workspace: any): number {
    const dna = workspace.tools?.['leadership-dna'];
    const vision = workspace.tools?.['vision-canvas'];
    const advisor = workspace.tools?.['advisor-readiness'];

    if (!dna || !vision) return 0;

    const executionScore = dna.current_Execution ?? 5;
    const pillarCount = Array.isArray(vision.pillars) ? vision.pillars.length : 0;

    if (pillarCount === 0) return 1.0; // No pillars = no ambition, default safe

    // Compute Operational Maturity from Advisor Readiness
    // Actual field IDs: o1-o5 (operational category, 1-5 scale each)
    let operationalMaturity = 50; // Default mid-range
    if (advisor?.answers) {
        const operationalQuestions = ['o1', 'o2', 'o3', 'o4', 'o5'];

        const scores = operationalQuestions
            .map(q => advisor.answers[q])
            .filter((v): v is number => typeof v === 'number');

        if (scores.length > 0) {
            const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            operationalMaturity = (avg / 5) * 100; // Scale 0-5 to 0-100
        }
    }

    const numerator = executionScore + (operationalMaturity / 10); // Scale to match execution 0-10
    const denominator = pillarCount * 2;

    return numerator / denominator;
}

/**
 * Metric 2: Founder Dependency Index (0-10)
 * Inputs:
 * - Empowerment gap (40% weight)
 * - SWOT weakness text scan for "bottleneck","dependency","key person","goes through" (30%)
 * - Vision score < 5 (15%)
 * - Delegation indicators in roadmap owner assignments (15%)
 * Interpretation: 0-3 Low, 4-6 Moderate, 7-10 Critical
 */
function computeFounderDependencyIndex(workspace: any): number {
    const dna = workspace.tools?.['leadership-dna'];
    const swot = workspace.tools?.swot;
    const roadmap = workspace.tools?.roadmap;

    let score = 0;

    // Component 1: Empowerment gap (40% weight, max 4 points)
    if (dna) {
        const currentEmpowerment = dna.current_Empowerment ?? 5;
        const targetEmpowerment = dna.target_Empowerment ?? 8;
        const empowermentGap = Math.max(0, targetEmpowerment - currentEmpowerment);
        score += Math.min(4, (empowermentGap / 5) * 4);
    }

    // Component 2: SWOT weakness bottleneck keywords (30% weight, max 3 points)
    if (swot?.weaknesses && Array.isArray(swot.weaknesses)) {
        const keywords = ['bottleneck', 'dependency', 'key person', 'goes through', 'depends on', 'only one', 'founder'];
        const weaknessText = swot.weaknesses.map((w: any) => w.text?.toLowerCase() || '').join(' ');
        const matches = keywords.filter(kw => weaknessText.includes(kw)).length;
        score += Math.min(3, (matches / keywords.length) * 3);
    }

    // Component 3: Vision score < 5 (15% weight, max 1.5 points)
    if (dna) {
        const visionScore = dna.current_Vision ?? 5;
        if (visionScore < 5) {
            score += 1.5;
        }
    }

    // Component 4: Delegation in roadmap (15% weight, max 1.5 points)
    // If most tasks assigned to same owner (or "Founder"), add points
    if (roadmap?.tasks && Array.isArray(roadmap.tasks)) {
        const tasks = roadmap.tasks;
        if (tasks.length > 0) {
            const ownerCounts: Record<string, number> = {};
            tasks.forEach((t: any) => {
                const owner = (t.owner || 'unassigned').toLowerCase();
                ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
            });

            const maxOwnerCount = Math.max(...Object.values(ownerCounts));
            const concentration = maxOwnerCount / tasks.length;

            if (concentration > 0.7) {
                score += 1.5;
            } else if (concentration > 0.5) {
                score += 0.75;
            }
        }
    }

    return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Metric 3: Strategic Coherence Score
 * Checks alignment between Vision pillars vs SWOT strengths, Vision pillars vs AI Readiness,
 * Core values vs SWOT weaknesses, Roadmap priorities vs leadership gaps.
 */
function computeStrategicCoherence(workspace: any): {
    score: 'aligned' | 'partially_aligned' | 'misaligned';
    details: string;
} {
    const vision = workspace.tools?.['vision-canvas'];
    const swot = workspace.tools?.swot;
    const aiReadiness = workspace.tools?.['ai-readiness'];
    const roadmap = workspace.tools?.roadmap;
    const dna = workspace.tools?.['leadership-dna'];

    const issues: string[] = [];
    let alignmentPoints = 0;
    let totalChecks = 0;

    // Check 1: Vision pillars vs SWOT strengths
    if (vision?.pillars && swot?.strengths) {
        totalChecks++;
        const pillarNames = vision.pillars.map((p: any) => (p.text ?? p.name ?? '').toLowerCase());
        const strengthText = swot.strengths.map((s: any) => s.text?.toLowerCase() || '').join(' ');

        const overlaps = pillarNames.filter((name: string) =>
            name && strengthText.includes(name)
        ).length;

        if (overlaps > 0) {
            alignmentPoints++;
        } else {
            issues.push('Vision pillars not reflected in SWOT strengths');
        }
    }

    // Check 2: Vision pillars mention AI/technology vs AI Readiness
    if (vision?.pillars && aiReadiness) {
        totalChecks++;
        const pillarText = vision.pillars.map((p: any) => (p.text ?? p.name ?? '').toLowerCase()).join(' ');
        const hasAIFocus = /\b(ai|digital|technology|automation|data)\b/.test(pillarText);
        const avgAIReadiness = Object.values(aiReadiness as Record<string, number>)
            .filter((v): v is number => typeof v === 'number')
            .reduce((sum, val) => sum + val, 0) / 6;

        if (hasAIFocus && avgAIReadiness < 40) {
            issues.push('Technology/AI vision not backed by AI readiness');
        } else {
            alignmentPoints++;
        }
    }

    // Check 3: Core values vs SWOT weaknesses (check for contradictions)
    if (vision?.values && swot?.weaknesses) {
        totalChecks++;
        const valuesText = vision.values.map((v: any) => (typeof v === 'string' ? v : v.text ?? '').toLowerCase()).join(' ');
        const weaknessText = swot.weaknesses.map((w: any) => w.text?.toLowerCase() || '').join(' ');

        // Check for balance/people-first values contradicted by burnout/capacity weaknesses
        const hasBalanceValues = /\b(balance|wellbeing|people|culture|wellness)\b/.test(valuesText);
        const hasBurnoutWeakness = /\b(burnout|overwork|capacity|stretched|overwhelm)\b/.test(weaknessText);

        if (hasBalanceValues && hasBurnoutWeakness) {
            issues.push('Core values contradict operational weaknesses');
        } else {
            alignmentPoints++;
        }
    }

    // Check 4: Roadmap priorities vs leadership gaps
    if (roadmap?.tasks && dna) {
        totalChecks++;
        const tasks = roadmap.tasks;

        // Find largest leadership gap
        const dimensions = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];
        let maxGap = 0;
        let gapDimension = '';

        dimensions.forEach(dim => {
            const current = dna[`current_${dim}`] ?? 5;
            const target = dna[`target_${dim}`] ?? 8;
            const gap = target - current;
            if (gap > maxGap) {
                maxGap = gap;
                gapDimension = dim.toLowerCase();
            }
        });

        // Check if roadmap addresses the gap
        const taskText = tasks.map((t: any) => t.title?.toLowerCase() || '').join(' ');
        const addressesGap = gapDimension && taskText.includes(gapDimension);

        if (maxGap > 2 && !addressesGap) {
            issues.push(`Roadmap doesn't address largest leadership gap (${gapDimension})`);
        } else {
            alignmentPoints++;
        }
    }

    // Check 5: Execution-Ambition Ratio
    // If EAR < 0.7, the business is overextended — cannot be "Aligned"
    const ear = computeExecutionAmbitionRatio({ tools: { 'leadership-dna': dna, 'vision-canvas': vision, 'advisor-readiness': { answers: (workspace.tools?.['advisor-readiness'] as any)?.answers } } });
    if (ear > 0 && ear < 0.7) {
        totalChecks++;
        issues.push(`Execution-Ambition Ratio is low (${ear.toFixed(2)}) — overextended`);
    } else if (ear > 0) {
        totalChecks++;
        alignmentPoints++;
    }

    // Check 6: Founder Dependency Index
    // If FDI > 5, strategic coherence is degraded
    const fdi = computeFounderDependencyIndex(workspace);
    if (fdi > 5) {
        totalChecks++;
        issues.push(`High Founder Dependency (${fdi.toFixed(1)}/10) undermines strategic coherence`);
    } else if (fdi > 0) {
        totalChecks++;
        alignmentPoints++;
    }

    // Check 7: Financial-Strategic gap override
    // If Financial Health % - Strategic Alignment % > 40 AND Vision < 5/10 → force misaligned
    const advisor = workspace.tools?.['advisor-readiness'];
    if (advisor?.answers && dna) {
        const financialQs = ['f1', 'f2', 'f3', 'f4', 'f5'];
        const strategicQs = ['s1', 's2', 's3', 's4', 's5'];
        const fScores = financialQs.map(q => advisor.answers[q]).filter((v: unknown): v is number => typeof v === 'number');
        const sScores = strategicQs.map(q => advisor.answers[q]).filter((v: unknown): v is number => typeof v === 'number');

        if (fScores.length > 0 && sScores.length > 0) {
            const financialPct = (fScores.reduce((a: number, b: number) => a + b, 0) / fScores.length / 5) * 100;
            const strategicPct = (sScores.reduce((a: number, b: number) => a + b, 0) / sScores.length / 5) * 100;
            const gap = financialPct - strategicPct;
            const visionScore = dna.current_Vision ?? 5;

            if (gap > 40 && visionScore < 5) {
                totalChecks++;
                issues.push(`Financial-Strategic gap of ${Math.round(gap)} points with Vision ${visionScore}/10 — severely misaligned`);
                // Hard override: return misaligned immediately
                return {
                    score: 'misaligned',
                    details: issues.join('; '),
                };
            }
        }
    }

    if (totalChecks === 0) return { score: 'aligned', details: 'Insufficient data for coherence analysis' };

    const alignmentRatio = alignmentPoints / totalChecks;

    let score: 'aligned' | 'partially_aligned' | 'misaligned';
    if (alignmentRatio >= 0.75) {
        score = 'aligned';
    } else if (alignmentRatio >= 0.4) {
        score = 'partially_aligned';
    } else {
        score = 'misaligned';
    }

    const details = issues.length > 0
        ? issues.join('; ')
        : 'Strategy shows strong internal alignment';

    return { score, details };
}

/**
 * Post-synthesis coherence adjustment
 * Downgrades coherence based on contradiction count from synthesis rules.
 * Call this AFTER running synthesis to factor in detected contradictions.
 */
export function adjustCoherenceForContradictions(
    currentScore: 'aligned' | 'partially_aligned' | 'misaligned',
    currentDetails: string,
    highSeverityCount: number,
    conflictCount: number,
): { score: 'aligned' | 'partially_aligned' | 'misaligned'; details: string } {
    let score = currentScore;
    const extraIssues: string[] = [];

    // 2+ high-severity contradictions forces "misaligned"
    if (conflictCount >= 2) {
        score = 'misaligned';
        extraIssues.push(`${conflictCount} internal contradictions detected`);
    } else if (conflictCount === 1 && score === 'aligned') {
        score = 'partially_aligned';
        extraIssues.push('1 internal contradiction detected');
    }

    // 3+ high-severity findings also degrades coherence
    if (highSeverityCount >= 3 && score !== 'misaligned') {
        score = 'misaligned';
        extraIssues.push(`${highSeverityCount} high-severity findings`);
    } else if (highSeverityCount >= 2 && score === 'aligned') {
        score = 'partially_aligned';
        extraIssues.push(`${highSeverityCount} high-severity findings`);
    }

    const details = extraIssues.length > 0
        ? (currentDetails ? `${currentDetails}; ${extraIssues.join('; ')}` : extraIssues.join('; '))
        : currentDetails;

    return { score, details };
}

/**
 * Metric 4: Revenue Risk Estimate
 * Based on SWOT threat severity, Founder Dependency Index, workforce risk indicators, Financial Health buffer.
 */
function computeRevenueRiskEstimate(workspace: any): RevenueRiskEstimate {
    const businessContext = workspace.tools?.['business-context'];
    const swot = workspace.tools?.swot;
    const advisor = workspace.tools?.['advisor-readiness'];

    // Map revenue range to midpoint
    const revenueRanges: Record<string, number> = {
        '<1M': 500000,
        '1-3M': 2000000,
        '3-8M': 5500000,
        '8-15M': 11500000,
        '15-30M': 22500000,
        '30-50M': 40000000,
        '50M+': 75000000
    };

    const revenueRange = businessContext?.revenueRange || '<1M';
    const baseRevenue = revenueRanges[revenueRange] || 500000;

    let riskMultiplierLow = 0.02; // Default 2% risk at low end
    let riskMultiplierHigh = 0.05; // Default 5% risk at high end

    // Factor 1: SWOT threats (increase risk by 1-3% per high-impact threat)
    if (swot?.threats && Array.isArray(swot.threats)) {
        const highImpactThreats = swot.threats.filter((t: any) =>
            t.impact === 'High' || (t.confidence && t.confidence >= 4)
        );
        const threatBonus = highImpactThreats.length * 0.01;
        riskMultiplierHigh += threatBonus;
    }

    // Factor 2: Founder Dependency (computed earlier in full metrics)
    const fdi = computeFounderDependencyIndex(workspace);
    if (fdi > 6) {
        riskMultiplierHigh += 0.03;
        riskMultiplierLow += 0.01;
    }

    // Factor 3: Financial Health (lower risk if strong buffer)
    // Actual field IDs: f1-f5 (financial category, 1-5 scale each)
    if (advisor?.answers) {
        const financialQuestions = ['f1', 'f2', 'f3', 'f4', 'f5'];
        const fScores = financialQuestions
            .map(q => advisor.answers[q])
            .filter((v): v is number => typeof v === 'number');
        if (fScores.length > 0) {
            const avgFinancialHealth = fScores.reduce((sum, val) => sum + val, 0) / fScores.length;
            if (avgFinancialHealth >= 4) {
                // Strong financial position reduces risk
                riskMultiplierLow *= 0.8;
                riskMultiplierHigh *= 0.9;
            }
        }
    }

    return {
        low: Math.round(baseRevenue * riskMultiplierLow),
        high: Math.round(baseRevenue * riskMultiplierHigh),
        currency: 'USD'
    };
}

/**
 * Metric 5: Organizational Readiness-for-Change Score (0-100)
 * Composite of: Cultural Readiness (from Advisor Readiness), AI Culture score, Leadership Adaptability, Empowerment
 * Labels: 0-25 Resistant, 26-50 Cautious, 51-75 Open, 76-100 Eager
 */
function computeOrganizationalReadiness(workspace: any): { score: number; label: string } {
    const advisor = workspace.tools?.['advisor-readiness'];
    const aiReadiness = workspace.tools?.['ai-readiness'];
    const dna = workspace.tools?.['leadership-dna'];

    let totalScore = 0;
    let components = 0;

    // Component 1: Cultural Readiness from Advisor
    // Actual field IDs: c1-c5 (cultural category, 1-5 scale each)
    if (advisor?.answers) {
        const culturalQuestions = ['c1', 'c2', 'c3', 'c4', 'c5'];
        const scores = culturalQuestions
            .map(q => advisor.answers[q])
            .filter((v): v is number => typeof v === 'number');

        if (scores.length > 0) {
            const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            totalScore += (avg / 5) * 100;
            components++;
        }
    }

    // Component 2: AI Culture score
    if (aiReadiness?.Culture !== undefined) {
        totalScore += aiReadiness.Culture;
        components++;
    }

    // Component 3: Leadership Adaptability
    if (dna?.current_Adaptability !== undefined) {
        totalScore += (dna.current_Adaptability / 10) * 100;
        components++;
    }

    // Component 4: Leadership Empowerment
    if (dna?.current_Empowerment !== undefined) {
        totalScore += (dna.current_Empowerment / 10) * 100;
        components++;
    }

    const score = components > 0 ? Math.round(totalScore / components) : 50;

    let label: string;
    if (score <= 25) label = 'Resistant';
    else if (score <= 50) label = 'Cautious';
    else if (score <= 75) label = 'Open';
    else label = 'Eager';

    return { score, label };
}

/**
 * Metric 6: Leadership Archetype
 * Based on Leadership DNA score patterns
 */
function computeLeadershipArchetype(workspace: any): LeadershipArchetype {
    const dna = workspace.tools?.['leadership-dna'];

    if (!dna) {
        return {
            archetype: 'Undefined',
            description: 'Insufficient leadership assessment data',
            recommendation: 'Complete the Leadership DNA assessment'
        };
    }

    const scores = {
        vision: dna.current_Vision ?? 5,
        execution: dna.current_Execution ?? 5,
        empowerment: dna.current_Empowerment ?? 5,
        decisiveness: dna.current_Decisiveness ?? 5,
        adaptability: dna.current_Adaptability ?? 5,
        integrity: dna.current_Integrity ?? 5
    };

    // Helper: check if score is high (>7)
    const isHigh = (val: number) => val > 7;
    const isLow = (val: number) => val < 5;

    // Check for balanced leader (all within 2 points of each other)
    const values = Object.values(scores);
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max - min <= 2) {
        return {
            archetype: 'The Generalist Leader',
            description: 'Well-rounded across all leadership dimensions with no major strengths or gaps',
            recommendation: 'Focus on developing depth in areas aligned with strategic priorities'
        };
    }

    // Pattern matching for archetypes
    if (isHigh(scores.vision) && isLow(scores.execution) && isLow(scores.empowerment)) {
        return {
            archetype: 'The Visionary Builder',
            description: 'Strong strategic vision but struggles with execution and delegation',
            recommendation: 'Build an operational partner (COO) and invest in team empowerment'
        };
    }

    if (isHigh(scores.execution) && isHigh(scores.integrity) && isLow(scores.vision)) {
        return {
            archetype: 'The Trusted Operator',
            description: 'Reliable executor with strong ethics but limited strategic ambition',
            recommendation: 'Partner with strategic thinkers or develop long-term planning capabilities'
        };
    }

    if (isHigh(scores.vision) && isHigh(scores.integrity) &&
        (isLow(scores.execution) || isLow(scores.empowerment) || isLow(scores.adaptability))) {
        return {
            archetype: 'The Stretched Strategist',
            description: 'Clear vision and strong values but overextended across execution demands',
            recommendation: 'Prioritize ruthlessly and delegate operational execution to trusted leaders'
        };
    }

    if (isHigh(scores.adaptability) && isHigh(scores.empowerment) && isLow(scores.decisiveness)) {
        return {
            archetype: 'The Collaborative Explorer',
            description: 'Empowering and flexible but may struggle with decisive action',
            recommendation: 'Develop decision frameworks and set clear accountability boundaries'
        };
    }

    if (isHigh(scores.decisiveness) && isHigh(scores.execution) && isLow(scores.empowerment)) {
        return {
            archetype: 'The Command Driver',
            description: 'Decisive executor who maintains tight control',
            recommendation: 'Build delegation skills to scale beyond personal capacity'
        };
    }

    // Default: describe dominant traits
    const dominant = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([key]) => key);

    return {
        archetype: 'The Hybrid Leader',
        description: `Primary strengths in ${dominant.join(' and ')} with mixed secondary capabilities`,
        recommendation: 'Leverage your strengths while building complementary team capabilities'
    };
}

/**
 * Main function: Compute all derived metrics
 */
export function computeDerivedMetrics(workspace: any): DerivedMetrics {
    const executionAmbitionRatio = computeExecutionAmbitionRatio(workspace);
    const founderDependencyIndex = computeFounderDependencyIndex(workspace);
    const coherence = computeStrategicCoherence(workspace);
    const revenueRiskEstimate = computeRevenueRiskEstimate(workspace);
    const readiness = computeOrganizationalReadiness(workspace);
    const leadershipArchetype = computeLeadershipArchetype(workspace);

    return {
        executionAmbitionRatio,
        founderDependencyIndex,
        strategicCoherence: coherence.score,
        strategicCoherenceDetails: coherence.details,
        revenueRiskEstimate,
        organizationalReadinessScore: readiness.score,
        organizationalReadinessLabel: readiness.label,
        leadershipArchetype
    };
}
