
import fs from 'fs';
import path from 'path';
import { initializeValidation } from '../validation/index.ts';
import { validateWorkspace } from '../validation/validator.ts';
import { runSynthesis, registerRule } from '../engine/synthesis.ts';
import {
    executionGapRule,
    unmitigatedThreatRule,
    burnoutRiskRule,
    strengthLeverageRule,
    sopMetricRule
} from '../engine/rules.ts';
import { registerTool } from '../registry/ToolRegistry.ts';

// --- CONFIG ---
const DATA_PATH = String.raw`C:\Users\Kamyar\.gemini\antigravity\brain\0eb75446-8b0d-48d2-9a4d-dfa5d5f426cc\joe_test_export_fixed.json`;

// --- SETUP ---
console.log("Setting up Headless Test Environment...");

// 1. Initialize Validation Registry
initializeValidation();

// 2. Mock Tool Registry (to avoid importing UI components)
// We only need the ID and ValidationProfileId for the validator to work.
const STUB_TOOLS = [
    { id: 'advisor-readiness', profile: 'advisor_readiness_v1' },
    { id: 'leadership-dna', profile: 'leadership_radar_v1' },
    { id: 'vision-canvas', profile: 'vision_canvas_v1' },
    { id: 'swot', profile: 'swot_v1' },
    { id: 'sop-taxonomy', profile: 'sop_taxonomy_v1' },
    { id: 'sop-create', profile: 'sop_create_v1' },
    { id: 'sop-management', profile: 'sop_manage_v1' }, // check if ID matches data
    { id: 'roadmap', profile: 'roadmap_90_v1' }
];

STUB_TOOLS.forEach(t => {
    registerTool({
        id: t.id,
        name: t.id,
        description: 'stub',
        path: '/',
        icon: {} as any,
        component: {} as any,
        validationProfileId: t.profile
    });
});

// 3. Register Synthesis Rules
registerRule(executionGapRule);
registerRule(unmitigatedThreatRule);
registerRule(burnoutRiskRule);
registerRule(strengthLeverageRule);
registerRule(sopMetricRule);

// --- EXECUTION ---

try {
    console.log(`Loading Data from: ${DATA_PATH}`);
    if (!fs.existsSync(DATA_PATH)) {
        throw new Error("Data file not found!");
    }
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const workspace = JSON.parse(rawData);

    // TEST 1: Strict Validation
    console.log("\n[TEST 1] Running Strict Validation...");
    const valResult = validateWorkspace(workspace);

    // Filter out known harmless warnings if any, but we expect mostly clean
    const errors = valResult.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
        console.error("❌ Validation FAILED with Errors:");
        errors.forEach(e => console.error(`   - [${e.code}] ${e.message} at ${e.path}`));
        process.exit(1);
    } else {
        console.log("✅ Validation Passed (No Errors).");
        if (valResult.issues.length > 0) {
            console.log(`   (with ${valResult.issues.length} warnings)`);
        }
    }

    // TEST 2: Synthesis Logic
    console.log("\n[TEST 2] Verifying Strategic Insights...");

    // NOTE: Workspace type cast needed as we are in a script
    const insights = runSynthesis(workspace as any);

    // ASSERTIONS
    const EXPECTED_INSIGHTS = [
        {
            id: 'Execution Gap',
            check: (i: any) => i.id === 'insight_exec_gap' && i.title === 'Execution Capability Gap'
        },
        {
            id: 'Unmitigated Threat',
            check: (i: any) => i.title === 'Unmitigated Threat Detected' && i.message.includes('Supply Chain Disruption')
        }
    ];

    let allPassed = true;

    EXPECTED_INSIGHTS.forEach(exp => {
        const found = insights.find(exp.check);
        if (found) {
            console.log(`✅ Found Insight: ${found.title}`);
        } else {
            console.error(`❌ Missing Expected Insight: ${exp.id}`);
            allPassed = false;
        }
    });

    if (!allPassed) {
        console.log("\nActual Insights Generated:");
        insights.forEach(i => console.log(`- [${i.type}] ${i.title}: ${i.message}`));
        process.exit(1);
    }

    console.log("\n🎉 ALL E2E TESTS PASSED!");
    process.exit(0);

} catch (err) {
    console.error("Test Script Crashed:", err);
    process.exit(1);
}
