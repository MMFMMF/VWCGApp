import type { Insight, SynthesisRule } from './types.ts';
import { rulesV2 } from './rules-v2.ts';

// Registry of active rules (now using v2 rules)
const rules: SynthesisRule[] = [...rulesV2];

export const registerRule = (rule: SynthesisRule) => {
    rules.push(rule);
};

/**
 * Normalize a workspace so all rules-v2 field access patterns work correctly.
 *
 * Two normalization passes are applied:
 *
 * 1. ToolWrapper .data unwrap: ToolWrapper stores tool entries as
 *    { data: { ...toolFields }, completed: bool }.
 *    rules-v2 expect fields directly on the tool object.
 *    Any tool entry that has a .data key gets its fields hoisted.
 *
 * 2. LeadershipDNA flat-key expansion: LeadershipDNATool stores dimensions as
 *    { vision: { current: 9, target: 10 }, execution: { current: 4, target: 8 }, ... }
 *    rules-v2 and derived-metrics read dna.current_Vision, dna.target_Vision, etc.
 *    This pass adds those flat keys while keeping the original nested shape intact.
 */
function normalizeWorkspace(workspace: any): any {
    if (!workspace?.tools) return workspace;

    const normalizedTools: Record<string, any> = {};

    for (const [toolId, toolEntry] of Object.entries(workspace.tools)) {
        const entry = toolEntry as any;
        if (!entry) {
            normalizedTools[toolId] = entry;
            continue;
        }

        // Pass 1: unwrap legacy .data wrapper from ToolWrapper (Architecture B storage format)
        let flat = (entry && typeof entry === 'object' && 'data' in entry && typeof entry.data === 'object' && entry.data !== null)
            ? { ...entry.data, completed: entry.completed }
            : { ...entry };

        // Pass 2: expand LeadershipDNA nested dimension format to flat keys
        if (toolId === 'leadership-dna') {
            const leadershipDimensions = ['vision', 'execution', 'empowerment', 'decisiveness', 'adaptability', 'integrity'] as const;
            for (const dim of leadershipDimensions) {
                const dimData = flat[dim];
                if (dimData && typeof dimData === 'object' && 'current' in dimData) {
                    const capitalized = dim.charAt(0).toUpperCase() + dim.slice(1);
                    // Only set if not already present (don't clobber explicit flat keys)
                    if (flat[`current_${capitalized}`] === undefined) {
                        flat[`current_${capitalized}`] = dimData.current;
                    }
                    if (flat[`target_${capitalized}`] === undefined) {
                        flat[`target_${capitalized}`] = dimData.target;
                    }
                }
            }
        }

        // Pass 3: normalize VisionCanvas shapes for rules-v2
        // VisionCanvasTool stores:
        //   northStar: { metric, target, timeframe } (object) → rules-v2 expect string
        //   pillars: [{ id, title, description }] → rules-v2 expect [{ text, kpi }]
        //   coreValues: string[] → rules-v2 reads vision.values (alias needed)
        if (toolId === 'vision-canvas') {
            const ns = flat.northStar;
            if (ns && typeof ns === 'object' && !Array.isArray(ns)) {
                const parts = [ns.metric, ns.target, ns.timeframe].filter(Boolean);
                flat = { ...flat, northStar: parts.join(' ') };
            }
            if (Array.isArray(flat.pillars)) {
                flat = {
                    ...flat,
                    pillars: flat.pillars.map((p: any) => ({
                        ...p,
                        // Add text alias for title so rules-v2 p.text ?? p.name picks it up
                        text: p.text ?? p.title ?? p.name ?? '',
                        // Preserve kpi if present, or use description as fallback for keyword matching
                        kpi: p.kpi ?? p.description ?? ''
                    }))
                };
            }
            // coreValues (string[]) → alias as values for rules-v2
            if (flat.coreValues !== undefined && flat.values === undefined) {
                flat = { ...flat, values: flat.coreValues };
            }
        }

        // Pass 4: expand AIReadiness lowercase field names to capitalized keys for rules-v2
        if (toolId === 'ai-readiness') {
            const aiDimensions = ['strategy', 'data', 'infrastructure', 'talent', 'governance', 'culture'] as const;
            for (const dim of aiDimensions) {
                if (flat[dim] !== undefined) {
                    const capitalized = dim.charAt(0).toUpperCase() + dim.slice(1);
                    // Only set if not already present (don't clobber explicit capitalized keys)
                    if (flat[capitalized] === undefined) {
                        flat[capitalized] = flat[dim];
                    }
                }
            }
        }

        normalizedTools[toolId] = flat;
    }

    return { ...workspace, tools: normalizedTools };
}

export const runSynthesis = (workspace: any): Insight[] => {
    // Fail safe
    if (!workspace || !workspace.tools) return [];

    // Normalize workspace before passing to rules
    const normalizedWorkspace = normalizeWorkspace(workspace);

    const insights: Insight[] = [];

    // Run all registered rules
    for (const rule of rules) {
        try {
            const result = rule.execute(normalizedWorkspace);
            if (result) {
                insights.push(result);
            }
        } catch (err) {
            console.warn(`Rule ${rule.id} failed execution:`, err);
        }
    }

    // Sort by severity (High -> Low)
    return insights.sort((a, b) => {
        const severityScore = { high: 3, medium: 2, low: 1 };
        return severityScore[b.severity] - severityScore[a.severity];
    });
};
