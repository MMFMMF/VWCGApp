/**
 * Test Script for Phase 3 - Synthesis Intelligence
 * Verifies derived metrics, SWOT keyword analysis, and new rules
 */

import { computeDerivedMetrics, scanSwotText, runSynthesis } from '../engine/index.ts';

// Mock workspace data
const mockWorkspace = {
    tools: {
        'leadership-dna': {
            current_Vision: 8,
            target_Vision: 9,
            current_Execution: 4,
            target_Execution: 8,
            current_Empowerment: 3,
            target_Empowerment: 8,
            current_Decisiveness: 7,
            target_Decisiveness: 8,
            current_Adaptability: 6,
            target_Adaptability: 8,
            current_Integrity: 9,
            target_Integrity: 9
        },
        'vision-canvas': {
            northStar: 'Become the leading provider of innovative software solutions',
            pillars: [
                { name: 'Product Innovation', kpi: 'Launch 4 new features' },
                { name: 'AI Integration', kpi: 'Automate 50% of workflows' },
                { name: 'Customer Success', kpi: '95% satisfaction' },
                { name: 'Market Expansion', kpi: 'Enter 3 new markets' },
                { name: 'Team Growth', kpi: 'Hire 10 people' }
            ],
            values: ['Innovation', 'Work-Life Balance', 'Customer First', 'Integrity']
        },
        'swot': {
            strengths: [
                { id: '1', text: 'Strong product innovation capability' },
                { id: '2', text: 'Loyal customer base' }
            ],
            weaknesses: [
                { id: '3', text: 'Founder is a bottleneck for all major decisions' },
                { id: '4', text: 'Team is stretched thin and showing burnout' },
                { id: '5', text: 'Limited operational capacity' }
            ],
            opportunities: [
                { id: '6', text: 'Growing demand for AI automation' },
                { id: '7', text: 'Technology partnerships available' }
            ],
            threats: [
                { id: '8', text: 'Key team member considering retirement', confidence: 5 },
                { id: '9', text: 'Client delivery deadlines at risk', impact: 'High' }
            ]
        },
        'ai-readiness': {
            Strategy: 65,
            Data: 40,
            Infrastructure: 25,
            Talent: 50,
            Governance: 30,
            Culture: 70
        },
        'advisor-readiness': {
            answers: {
                q6_operational_foundation: 2,
                q7_delegation: 2,
                q8_process_discipline: 3,
                q9_team_scalability: 2,
                q10_financial_health: 4,
                q11_cultural_readiness: 4,
                q12_change_appetite: 4,
                q13_learning_culture: 3
            }
        },
        'business-context': {
            revenueRange: '3-8M',
            industry: 'Software',
            employeeCount: '10-25',
            founderHours: '70-80',
            yearsInBusiness: '3-5',
            growthGoal: 'aggressive'
        },
        'roadmap': {
            tasks: [
                { id: 't1', title: 'Launch AI feature', owner: 'Founder', phase: 'Foundation', week: 1 },
                { id: 't2', title: 'Hire COO', owner: 'Founder', phase: 'Foundation', week: 2 },
                { id: 't3', title: 'Client delivery sprint', owner: 'Founder', phase: 'Foundation', week: 3 }
            ]
        }
    }
};

console.log('=== Phase 3 Synthesis Intelligence Test ===\n');

// Test 1: Derived Metrics
console.log('1. Testing Derived Metrics...');
const metrics = computeDerivedMetrics(mockWorkspace);
console.log('   Execution-Ambition Ratio:', metrics.executionAmbitionRatio.toFixed(2));
console.log('   Founder Dependency Index:', metrics.founderDependencyIndex.toFixed(1), '/10');
console.log('   Strategic Coherence:', metrics.strategicCoherence, '-', metrics.strategicCoherenceDetails);
console.log('   Revenue Risk Estimate:', `$${metrics.revenueRiskEstimate.low.toLocaleString()} - $${metrics.revenueRiskEstimate.high.toLocaleString()}`);
console.log('   Organizational Readiness:', metrics.organizationalReadinessScore, '- ', metrics.organizationalReadinessLabel);
console.log('   Leadership Archetype:', metrics.leadershipArchetype.archetype);
console.log('   └─', metrics.leadershipArchetype.description);
console.log('');

// Test 2: SWOT Keyword Analysis
console.log('2. Testing SWOT Keyword Analysis...');
const swotAnalysis = scanSwotText(mockWorkspace.tools.swot);
console.log('   Bottleneck keywords:', swotAnalysis.bottleneck.frequency, 'matches');
console.log('   Capacity keywords:', swotAnalysis.capacity.frequency, 'matches');
console.log('   Retirement keywords:', swotAnalysis.retirement.frequency, 'matches');
console.log('   Technology keywords:', swotAnalysis.technology.frequency, 'matches');
console.log('   Delivery keywords:', swotAnalysis.delivery.frequency, 'matches');
console.log('');

// Test 3: New Synthesis Rules
console.log('3. Testing New Synthesis Rules (v2)...');
const insights = runSynthesis(mockWorkspace);
console.log(`   Generated ${insights.length} insights:\n`);
insights.forEach((insight, idx) => {
    console.log(`   ${idx + 1}. [${insight.severity.toUpperCase()}] ${insight.title}`);
    console.log(`      Type: ${insight.type}`);
    console.log(`      Message: ${insight.message.substring(0, 100)}...`);
    console.log(`      Tools: ${insight.relatedTools.join(', ')}`);
    console.log('');
});

console.log('=== Test Complete ===');
console.log('\nExpected Insights Based on Mock Data:');
console.log('- Vision-Execution Mismatch (5 pillars, Execution 4/10, capacity keywords)');
console.log('- Values-Reality Contradiction (work-life balance value + 70-80 hours)');
console.log('- Technology Ambition Gap (AI pillars + Infrastructure 25%)');
console.log('- Founder Succession Risk (high FDI + retirement threat + empowerment gap)');
console.log('- Willing But Unable (Culture 70%, Infrastructure 25%)');
console.log('- Execution Crisis Dominance (Execution largest gap + delivery threats)');
