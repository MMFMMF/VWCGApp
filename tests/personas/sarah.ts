/**
 * Persona: Sarah Chen — Scaling Startup Founder
 * Archetype: Visionary who moves fast but breaks things
 *
 * Strengths: Vision, AI-forward, leadership drive
 * Weaknesses: No SOPs, poor financial tracking, execution gaps
 */
export const sarah = {
  meta: {
    name: 'Sarah Chen',
    company: 'TechFlow Analytics',
    role: 'CEO/Founder',
    industry: 'SaaS',
    revenue: '$3M ARR',
    employees: 15,
  },

  // AI Readiness: 6 dimensions, 0-100 range sliders
  aiReadiness: {
    Strategy: 85,
    Data: 70,
    Infrastructure: 75,
    Talent: 65,
    Governance: 40,
    Culture: 90,
  },

  // Leadership DNA: 6 dimensions, 0-10 number inputs (current + target)
  leadershipDna: {
    current_Vision: 9,
    current_Execution: 4,
    current_Empowerment: 3,
    current_Decisiveness: 8,
    current_Adaptability: 8,
    current_Integrity: 7,
    target_Vision: 10,
    target_Execution: 8,
    target_Empowerment: 7,
    target_Decisiveness: 9,
    target_Adaptability: 9,
    target_Integrity: 8,
  },

  // SWOT: quadrant arrays with text + confidence (1-5)
  swot: {
    strengths: [
      { text: 'Strong AI/ML expertise in founding team', confidence: 5 },
      { text: 'Clear product-market fit in analytics space', confidence: 5 },
      { text: 'Seed funding secured with runway', confidence: 4 },
    ],
    weaknesses: [
      { text: 'No documented processes or SOPs', confidence: 5 },
      { text: 'Key person dependency on founder', confidence: 4 },
      { text: 'Cash flow timing issues', confidence: 3 },
    ],
    opportunities: [
      { text: 'Enterprise market expansion', confidence: 4 },
      { text: 'AI automation for SMBs growing rapidly', confidence: 5 },
      { text: 'Strategic partnership with consulting firms', confidence: 3 },
    ],
    threats: [
      { text: 'Well-funded competitors entering market', confidence: 4 },
      { text: 'Talent war for AI engineers intensifying', confidence: 4 },
      { text: 'Economic downturn reducing SaaS budgets', confidence: 3 },
    ],
  },

  // Vision Canvas
  visionCanvas: {
    northStar: 'Democratize AI analytics for every business — $50M ARR by 2028',
    pillars: [
      { title: 'Product-led growth', kpi: '10K free users → 500 paid' },
      { title: 'AI-first architecture', kpi: '99.9% uptime, <200ms latency' },
      { title: 'Customer success focus', kpi: 'NPS > 60, churn < 5%' },
      { title: 'Enterprise expansion', kpi: '10 enterprise contracts' },
      { title: 'Global market entry', kpi: 'Launch in 3 new markets' },
    ],
    values: ['Move fast', 'Data-driven decisions', 'Customer obsession'],
  },

  // Roadmap: tasks with title, owner, week (1-12), status
  roadmap: [
    { title: 'Launch V2 Platform', owner: 'Sarah', week: 2, status: 'planned' },
    { title: 'Hire 5 Engineers', owner: 'Sarah', week: 3, status: 'planned' },
    { title: 'SOC2 Compliance Audit', owner: 'CTO', week: 4, status: 'planned' },
    { title: 'Series A Preparation', owner: 'Sarah', week: 5, status: 'planned' },
    { title: 'Enterprise Pilot Program', owner: 'Sales', week: 6, status: 'planned' },
    { title: 'Marketing Campaign Launch', owner: 'Marketing', week: 7, status: 'planned' },
    { title: 'Partner Program Setup', owner: 'BD', week: 8, status: 'planned' },
    { title: 'International Expansion Planning', owner: 'Sarah', week: 9, status: 'planned' },
    { title: 'New Pricing Model Rollout', owner: 'Product', week: 10, status: 'planned' },
    { title: 'AI Feature Launch Wave 2', owner: 'CTO', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: 20 questions (s1-s5, o1-o5, f1-f5, c1-c5), 1-5 scale
  advisorReadiness: {
    s1: 4, s2: 3, s3: 5, s4: 1, s5: 2,  // Strategic: strong vision, no succession
    o1: 1, o2: 1, o3: 3, o4: 4, o5: 2,  // Operational: no SOPs, tech is good
    f1: 2, f2: 2, f3: 2, f4: 3, f5: 3,  // Financial: weak tracking
    c1: 4, c2: 2, c3: 2, c4: 5, c5: 3,  // Cultural: innovative but unstructured
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'TechFlow Analytics',
    revenueRange: '1-3M',
    industry: 'Technology/SaaS',
    employeeCount: '6-15',
    founderHours: '70+',
    yearsInBusiness: '<2',
    growthGoal: 'Revenue growth',
  },

  // Expected synthesis rules that should fire
  expectedInsights: {
    executionGap: true,   // E1: high vision (9), low execution (4), 5 pillars
    sopMetric: true,      // E5: no SOPs documented
  },
};
