import type { Insight } from './types';
import { SENIOR_CONSULTANT_SYS_PROMPT } from './prompts.ts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface ChatResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

export const consultAi = async (workspace: any, apiKey: string): Promise<Insight[]> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    // Sanitize Payload: Remove heavy artifacts if necessary (MVP: send full store)
    // For privacy, we might strip exact timestamps or unrelated metadata, but for strategy, context is key.
    // We strictly assume the user has consented to sending this data by providing the key.
    const payload = {
        contents: [{
            parts: [{
                text: `
                ${SENIOR_CONSULTANT_SYS_PROMPT}
                
                Here is the Workspace Data:
                ${JSON.stringify(workspace, null, 2)}
                `
            }]
        }],
        generationConfig: {
            temperature: 0.7, // Creativity allowed for strategy
            maxOutputTokens: 2000,
            responseMimeType: "application/json" // Force JSON output mode
        }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API call failed');
        }

        const data: ChatResponse = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return [];
        }

        // Parse JSON
        // Since we requested JSON mime type, it should be clean, but good to be safe with simple cleanup
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const insights: Insight[] = JSON.parse(cleanText);

        return insights;

    } catch (error) {
        console.error('Cloud Synthesis Failed:', error);
        throw error;
    }
};
