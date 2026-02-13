import type { Insight, SynthesisRule } from './types.ts';
import { rulesV2 } from './rules-v2.ts';

// Registry of active rules (now using v2 rules)
const rules: SynthesisRule[] = [...rulesV2];

export const registerRule = (rule: SynthesisRule) => {
    rules.push(rule);
};

export const runSynthesis = (workspace: any): Insight[] => {
    // Fail safe
    if (!workspace || !workspace.tools) return [];

    const insights: Insight[] = [];

    // Run all registered rules
    for (const rule of rules) {
        try {
            const result = rule.execute(workspace);
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
