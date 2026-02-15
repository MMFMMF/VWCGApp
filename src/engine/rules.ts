import type { SynthesisRule } from './types.ts';

// Rule 1: Execution Gap (Leadership DNA + Vision)
/*
    Trigger: 
    - Leadership DNA 'Execution' score < 6 (Weak Execution)
    - Vision Canvas has > 4 Pillars (High Ambition/Complexity)
*/
export const executionGapRule: SynthesisRule = {
    id: 'E1_execution_gap',
    name: 'Ambition vs. Capability Mismatch',
    description: 'Detects high strategic ambition paired with low execution capability.',
    execute: (workspace) => {
        const dna = workspace.tools['leadership-dna'];
        const vision = workspace.tools['vision-canvas'];

        if (!dna || !vision) return null;

        // Check Execution Score (default to 10 if missing to avoid false positive)
        const executionScore = dna.current_Execution ?? 10;

        // Check Pillar Count
        const pillarCount = Array.isArray(vision.pillars) ? vision.pillars.length : 0;

        // E1: Dynamic Thresholds
        // Score < 4 (Severe) -> Max 1 pillar
        // Score < 6 (Weak)   -> Max 3 pillars
        let maxPillars = 4; // Default safe limit
        if (executionScore < 4) maxPillars = 1;
        else if (executionScore < 6) maxPillars = 3;

        if (pillarCount > maxPillars) {
            return {
                id: 'insight_exec_gap',
                type: 'conflict',
                severity: 'high',
                title: 'Execution Capability Gap',
                message: `You have defined ${pillarCount} strategic pillars but your 'Execution' capability is rated at only ${executionScore}/10. Given this score, we recommend a maximum of ${maxPillars} pillars to ensure success.`,
                recommendation: `Reduce pillars to ${maxPillars} or urgently invest in operational leadership (COO/Project Management).`,
                relatedTools: ['leadership-dna', 'vision-canvas']
            };
        }
        return null;
    }
};

// Rule 2: Unmitigated Threat (SWOT + Roadmap)
/*
    Trigger:
    - SWOT item in 'Threats' with Confidence > 3 (High Concern)
    - No task in Roadmap contains similar keywords
*/
export const unmitigatedThreatRule: SynthesisRule = {
    id: 'E2_unmitigated_threat',
    name: 'Unmitigated Strategic Threat',
    description: 'Identifies high-confidence threats with no mitigation tasks.',
    execute: (workspace) => {
        const swot = workspace.tools['swot'];
        const roadmap = workspace.tools['roadmap'];

        if (!swot || !roadmap) return null;

        // Find high confidence threats from swot.threats[] array
        // (SWOT tool stores items per-quadrant: strengths[], weaknesses[], opportunities[], threats[])
        const threatItems = Array.isArray(swot.threats) ? swot.threats : [];
        const threats = threatItems.filter((i: any) =>
            (i.confidence && i.confidence >= 4) || (i.impact === 'High')
        );

        if (threats.length === 0) return null;

        const tasks = Array.isArray(roadmap.tasks) ? roadmap.tasks : [];
        const taskText = tasks.map((t: any) => t.title.toLowerCase()).join(' ');

        // Check if ANY high-threat keyword is missing from roadmap
        // Simplified keyword matching: take first significant word > 4 chars or whole phrase
        for (const threat of threats) {
            const keywords = threat.text.toLowerCase().split(' ').filter((w: string) => w.length > 4);
            const searchPhrase = keywords.length > 0 ? keywords[0] : threat.text.toLowerCase();

            if (!taskText.includes(searchPhrase)) {
                return {
                    id: `insight_threat_${threat.id}`,
                    type: 'risk',
                    severity: 'medium', // Medium because keyword matching is fuzzy
                    title: 'Unmitigated Threat Detected',
                    message: `Strategic Threat "${threat.text}" does not appear to have a dedicated mitigation task in your Roadmap.`,
                    recommendation: `Add a task to the 90-Day Roadmap specifically addressing "${threat.text}".`,
                    relatedTools: ['swot', 'roadmap']
                };
            }
        }
        return null;
    }
};

// Rule 3: Burnout Risk (Advisor Readiness + Roadmap)
/*
    Trigger:
    - Advisor Readiness Phase is 'Emerging' (Low Maturity)
    - Roadmap has > 15 tasks (High Velocity)
*/
export const burnoutRiskRule: SynthesisRule = {
    id: 'E3_burnout_risk',
    name: 'Organizational Burnout Risk',
    description: 'Detects excessive workload for early-stage maturity.',
    execute: (workspace) => {
        const advisor = workspace.tools['advisor-readiness'];
        const roadmap = workspace.tools['roadmap'];

        if (!advisor || !roadmap) return null;

        // Calc Readiness Score (Rough approx from 20 questions)
        // If not fully calculated, we infer 'Emerging' if response count is low or manually flagged
        // MVP: Just assume if Advisor tool exists, we check tasks vs general capacity assumption
        // Use Roadmap density alone if Advisor data weak, BUT spec says cross-tool.

        // Let's use a simpler proxy: If "Operational" readiness (Q6-10) sum is low.
        // For MVP speed: just use task count > 15 = High for ANYONE, simplified.
        // Actually, let's stick to the Spec plan: 
        // "Emerging" is usually < 40% score.

        // Mock scoring logic for MVP speed:
        const responses = Array.isArray(advisor.responses) ? advisor.responses : [];
        const scoreSum = responses.reduce((acc: number, r: any) => acc + (r.value || 0), 0);
        const maxPossible = responses.length * 5;
        const maturityPercent = maxPossible > 0 ? (scoreSum / maxPossible) : 0;

        const taskCount = Array.isArray(roadmap.tasks) ? roadmap.tasks.length : 0;

        // E3: Refined Logic
        // If Maturity < 50% (Emerging/Growing), Max Tasks = 12
        // IF Maturity > 80% (Optimizing), Max Tasks = 20
        // Trigger if exceeding safe capacity

        let safeCapacity = 20;
        if (maturityPercent < 0.5) safeCapacity = 12;
        else if (maturityPercent < 0.7) safeCapacity = 16;

        if (taskCount > safeCapacity) {
            return {
                id: 'insight_burnout',
                type: 'risk',
                severity: 'high',
                title: 'Burnout / Failure Risk',
                message: `You have ${taskCount} tasks planned, but your Organizational Readiness score is only ${(maturityPercent * 100).toFixed(0)}%, which suggests a safe capacity of ~${safeCapacity} tasks.`,
                recommendation: 'De-risk by moving ~30% of tasks to "Next Quarter" or focusing only on Foundation items.',
                relatedTools: ['advisor-readiness', 'roadmap']
            };
        }

        return null;
    }
};

// Rule 4: Strength Leverage (Leadership DNA + Roadmap) (Positive)
/*
    Trigger:
    - Leadership DNA 'Innovation' or 'Strategy' score > 8 (High Strength)
    - Roadmap contains tasks with keywords 'launch', 'new', 'strategy', 'pivot'
*/
export const strengthLeverageRule: SynthesisRule = {
    id: 'E4_strength_leverage',
    name: 'Strength Utilization',
    description: 'Acknowledges active use of leadership strengths in execution plan.',
    execute: (workspace) => {
        const dna = workspace.tools['leadership-dna'];
        const roadmap = workspace.tools['roadmap'];

        if (!dna || !roadmap) return null;

        // Check for Innovation Strength
        const innovationScore = dna.current_Innovation ?? 0;
        if (innovationScore < 8) return null;

        const tasks = Array.isArray(roadmap.tasks) ? roadmap.tasks : [];
        const taskText = tasks.map((t: any) => t.title.toLowerCase()).join(' ');

        // Check for utilization
        if (taskText.includes('launch') || taskText.includes('new') || taskText.includes('pivot')) {
            return {
                id: 'insight_strength_innovation',
                type: 'strength',
                severity: 'low',
                title: 'Strength Leveraged',
                message: `Excellent work! You are actively using your high 'Innovation' capability (${innovationScore}/10) in your roadmap tasks.`,
                recommendation: 'Ensure your team is aligned to support this high-velocity innovation pace.',
                relatedTools: ['leadership-dna', 'roadmap']
            };
        }
        return null;
    }
};

// Rule 5: SOP Metric Validation (SOP Creation)
/*
    Trigger:
    - SOP exists in 'sop-create'
    - 'Metrics' block is empty or missing
*/
export const sopMetricRule: SynthesisRule = {
    id: 'E5_sop_metric_missing',
    name: 'SOP Quality Check',
    description: 'Ensures SOPs have defined success metrics.',
    execute: (workspace) => {
        const sopTool = workspace.tools['sop-create'];

        if (!sopTool || !Array.isArray(sopTool.sops)) return null;

        for (const sop of sopTool.sops) {
            // Check if Metrics block exists and has content
            const hasMetrics = sop.blocks && Array.isArray(sop.blocks) && sop.blocks.some((b: any) =>
                b.type === 'metrics' && b.content && b.content.length > 10
            );

            if (!hasMetrics) {
                return {
                    id: `insight_sop_metric_${sop.id}`,
                    type: 'risk',
                    severity: 'medium',
                    title: 'Incomplete SOP Definition',
                    message: `SOP "${sop.title}" is missing key Success Metrics.`,
                    recommendation: 'Add a "Metrics & KPIs" block to define how success is measured for this process.',
                    relatedTools: ['sop-create']
                };
            }
        }
        return null;
    }
};
