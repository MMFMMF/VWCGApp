
import fs from 'fs';
import path from 'path';
import { runSynthesis, registerRule } from '../engine/synthesis.ts';
import { executionGapRule, unmitigatedThreatRule, strengthLeverageRule, sopMetricRule } from '../engine/rules.ts';
import type { WorkspaceState } from '../store/workspaceStore.ts';

// Register rules manually since we are outside the app context
registerRule(executionGapRule);
registerRule(unmitigatedThreatRule);
registerRule(strengthLeverageRule);
registerRule(sopMetricRule);

const JOE_DATA_PATH = String.raw`C:\Users\Kamyar\.gemini\antigravity\brain\0eb75446-8b0d-48d2-9a4d-dfa5d5f426cc\joe_test_export_fixed.json`;

try {
    const rawData = fs.readFileSync(JOE_DATA_PATH, 'utf-8');
    const workspace = JSON.parse(rawData);

    console.log("Loaded Joe Test Workspace.");
    console.log(`- Vision Pillars: ${workspace.tools['vision-canvas'].pillars.length}`);
    console.log(`- Tasks: ${workspace.tools.roadmap.tasks.length}`);
    console.log(`- Leadership Innovation Score: ${workspace.tools['leadership-dna'].current_Innovation}`);

    console.log("\nRunning Synthesis Engine...");
    const insights = runSynthesis(workspace as WorkspaceState);

    console.log(`\nGenerated ${insights.length} Insights:`);
    insights.forEach(insight => {
        console.log(`[${insight.type.toUpperCase()}] ${insight.title}`);
        console.log(`   Message: ${insight.message}`);
        console.log(`   Severity: ${insight.severity}`);
        console.log("---");
    });

} catch (err) {
    console.error("Verification Failed:", err);
}
