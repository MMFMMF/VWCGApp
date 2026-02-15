
import fs from 'fs';
import path from 'path';
import { consultAi } from '../engine/cloud.ts';

// --- CONFIG ---
const DATA_PATH = String.raw`C:\Users\Kamyar\.gemini\antigravity\brain\0eb75446-8b0d-48d2-9a4d-dfa5d5f426cc\joe_test_export_fixed.json`;
const MOCK_KEY = "TEST_API_KEY";

// --- MOCK FETCH ---
const mockResponse = {
    candidates: [{
        content: {
            parts: [{
                text: JSON.stringify([
                    {
                        id: "cloud_insight_1",
                        type: "risk",
                        severity: "high",
                        title: "AI Detected Risk",
                        message: "This is a test insight from the mock AI.",
                        recommendation: "Verify the integration.",
                        relatedTools: ["roadmap"]
                    }
                ])
            }]
        }
    }]
};

global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    console.log(`\n[MOCK FETCH] Called URL: ${url}`);
    if (init && init.body) {
        console.log(`[MOCK FETCH] Payload Size: ${init.body.toString().length} chars`);
    }

    return {
        ok: true,
        json: async () => mockResponse
    } as Response;
};

// --- EXECUTION ---

(async () => {
    try {
        console.log("Setting up Cloud AI Test...");

        if (!fs.existsSync(DATA_PATH)) {
            throw new Error(`Data file not found at ${DATA_PATH}`);
        }

        console.log(`Loading Workspace Data...`);
        const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
        const workspace = JSON.parse(rawData);

        console.log("Calling consultAi()...");
        const insights = await consultAi(workspace, MOCK_KEY);

        console.log("\n--- RESULT ---");
        console.log(`Generated ${insights.length} insights.`);

        if (insights.length !== 1 || insights[0].title !== "AI Detected Risk") {
            throw new Error("Mismatch in mocked response parsing!");
        }

        console.log("✅ consultAi() successfully handled the request and response.");
        console.log("Verify that the payload structure matched expectations in the logs above.");

    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
})();
