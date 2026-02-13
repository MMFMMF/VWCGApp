/**
 * SWOT Keyword Analysis Module
 * Scans SWOT entries for strategic keyword patterns
 */

export interface SwotKeywordMatch {
    category: string;
    keywords: string[];
    frequency: number;
    matchedItems: Array<{ id: string; text: string }>;
}

export interface SwotAnalysis {
    bottleneck: SwotKeywordMatch;
    capacity: SwotKeywordMatch;
    retirement: SwotKeywordMatch;
    technology: SwotKeywordMatch;
    delivery: SwotKeywordMatch;
    balance: SwotKeywordMatch;
    growth: SwotKeywordMatch;
}

// Keyword dictionaries
const KEYWORD_DICTIONARIES = {
    bottleneck: [
        'bottleneck',
        'single point',
        'key person',
        'goes through',
        'depends on',
        'only one',
        'founder',
        'owner'
    ],
    capacity: [
        'capacity',
        'stretched',
        'burnout',
        'overwork',
        'too many',
        'overwhelm',
        'bandwidth'
    ],
    retirement: [
        'retirement',
        'aging',
        'succession',
        'leave',
        'departing',
        'knowledge loss'
    ],
    technology: [
        'ai',
        'digital',
        'technology',
        'automation',
        'software',
        'data',
        'cloud',
        'system'
    ],
    delivery: [
        'delivery',
        'quality',
        'deadline',
        'client',
        'satisfaction',
        'service'
    ],
    balance: [
        'balance',
        'wellbeing',
        'people-first',
        'culture',
        'work-life',
        'wellness'
    ],
    growth: [
        'growing',
        'steady',
        'maintain',
        'continue',
        'stable'
    ]
};

/**
 * Scan a single SWOT quadrant for keyword matches
 */
function scanQuadrant(
    items: Array<{ id: string; text: string }> | undefined,
    keywords: string[]
): { frequency: number; matchedItems: Array<{ id: string; text: string }> } {
    if (!items || !Array.isArray(items)) {
        return { frequency: 0, matchedItems: [] };
    }

    const matchedItems: Array<{ id: string; text: string }> = [];
    let totalMatches = 0;

    items.forEach(item => {
        if (!item.text) return;

        const textLower = item.text.toLowerCase();
        let itemMatches = 0;

        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
            if (regex.test(textLower)) {
                itemMatches++;
            }
        });

        if (itemMatches > 0) {
            matchedItems.push({ id: item.id, text: item.text });
            totalMatches += itemMatches;
        }
    });

    return { frequency: totalMatches, matchedItems };
}

/**
 * Main function: Scan SWOT data for all keyword categories
 */
export function scanSwotText(swotData: any): SwotAnalysis {
    if (!swotData) {
        // Return empty analysis if no SWOT data
        const emptyMatch: SwotKeywordMatch = {
            category: '',
            keywords: [],
            frequency: 0,
            matchedItems: []
        };

        return {
            bottleneck: { ...emptyMatch, category: 'bottleneck', keywords: KEYWORD_DICTIONARIES.bottleneck },
            capacity: { ...emptyMatch, category: 'capacity', keywords: KEYWORD_DICTIONARIES.capacity },
            retirement: { ...emptyMatch, category: 'retirement', keywords: KEYWORD_DICTIONARIES.retirement },
            technology: { ...emptyMatch, category: 'technology', keywords: KEYWORD_DICTIONARIES.technology },
            delivery: { ...emptyMatch, category: 'delivery', keywords: KEYWORD_DICTIONARIES.delivery },
            balance: { ...emptyMatch, category: 'balance', keywords: KEYWORD_DICTIONARIES.balance },
            growth: { ...emptyMatch, category: 'growth', keywords: KEYWORD_DICTIONARIES.growth }
        };
    }

    // Combine all quadrants for comprehensive scanning
    const allItems = [
        ...(swotData.strengths || []),
        ...(swotData.weaknesses || []),
        ...(swotData.opportunities || []),
        ...(swotData.threats || [])
    ];

    const result: SwotAnalysis = {
        bottleneck: {
            category: 'bottleneck',
            keywords: KEYWORD_DICTIONARIES.bottleneck,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.bottleneck)
        },
        capacity: {
            category: 'capacity',
            keywords: KEYWORD_DICTIONARIES.capacity,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.capacity)
        },
        retirement: {
            category: 'retirement',
            keywords: KEYWORD_DICTIONARIES.retirement,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.retirement)
        },
        technology: {
            category: 'technology',
            keywords: KEYWORD_DICTIONARIES.technology,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.technology)
        },
        delivery: {
            category: 'delivery',
            keywords: KEYWORD_DICTIONARIES.delivery,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.delivery)
        },
        balance: {
            category: 'balance',
            keywords: KEYWORD_DICTIONARIES.balance,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.balance)
        },
        growth: {
            category: 'growth',
            keywords: KEYWORD_DICTIONARIES.growth,
            ...scanQuadrant(allItems, KEYWORD_DICTIONARIES.growth)
        }
    };

    return result;
}

/**
 * Helper: Check if a specific keyword category has matches
 */
export function hasKeywordMatches(analysis: SwotAnalysis, category: keyof SwotAnalysis): boolean {
    return analysis[category].frequency > 0;
}

/**
 * Helper: Get frequency for a specific category
 */
export function getKeywordFrequency(analysis: SwotAnalysis, category: keyof SwotAnalysis): number {
    return analysis[category].frequency;
}
