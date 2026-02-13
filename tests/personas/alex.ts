/**
 * Persona: Alex Rivera — Burned Out COO
 * Archetype: Competent operator drowning in too many initiatives
 *
 * Strengths: Process-oriented, good team, advisor-ready
 * Weaknesses: Burnout, overcommitted roadmap, maxed capacity
 */
export const alex = {
  meta: {
    name: 'Alex Rivera',
    company: 'Meridian Consulting Group',
    role: 'COO',
    industry: 'Professional Services',
    revenue: '$12M',
    employees: 60,
  },

  // AI Readiness: moderate
  aiReadiness: {
    Strategy: 55,
    Data: 50,
    Infrastructure: 45,
    Talent: 40,
    Governance: 35,
    Culture: 60,
  },

  // Leadership DNA: competent but stretched
  leadershipDna: {
    current_Vision: 7,
    current_Execution: 5,
    current_Empowerment: 6,
    current_Decisiveness: 6,
    current_Adaptability: 5,
    current_Integrity: 8,
    target_Vision: 8,
    target_Execution: 8,
    target_Empowerment: 8,
    target_Decisiveness: 7,
    target_Adaptability: 7,
    target_Integrity: 9,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Strong consulting methodology and frameworks', confidence: 5 },
      { text: 'Experienced mid-level management team', confidence: 4 },
      { text: 'Diverse client portfolio across industries', confidence: 4 },
    ],
    weaknesses: [
      { text: 'Leadership team burnout at 70+ hour weeks', confidence: 5 },
      { text: 'Too many concurrent strategic initiatives', confidence: 5 },
      { text: 'Client delivery quality declining under pressure', confidence: 4 },
    ],
    opportunities: [
      { text: 'AI-augmented consulting services offering', confidence: 4 },
      { text: 'Acquisition of smaller boutique firm', confidence: 3 },
    ],
    threats: [
      { text: 'Key talent poaching by competitors', confidence: 4 },
      { text: 'Economic slowdown reducing consulting budgets', confidence: 4 },
    ],
  },

  // Vision Canvas: has vision but can't execute it all
  visionCanvas: {
    northStar: 'Become the leading AI-augmented consulting firm in North America',
    pillars: [
      { title: 'AI-augmented delivery', kpi: '40% efficiency gain' },
      { title: 'Talent development pipeline', kpi: '90% retention rate' },
      { title: 'Geographic expansion', kpi: '3 new offices' },
      { title: 'Service line diversification', kpi: '2 new practices' },
    ],
    values: ['Client excellence', 'Innovation', 'Work-life balance'],
  },

  // Roadmap: MASSIVELY overloaded — should trigger burnout
  roadmap: [
    { title: 'CRM Migration to Salesforce', owner: 'IT', week: 1, status: 'planned' },
    { title: 'Office Relocation Downtown', owner: 'Admin', week: 1, status: 'planned' },
    { title: 'Launch New Service Line', owner: 'Alex', week: 2, status: 'planned' },
    { title: 'Hire 10 Senior Consultants', owner: 'HR', week: 2, status: 'planned' },
    { title: 'ISO 9001 Certification', owner: 'Quality', week: 3, status: 'planned' },
    { title: 'Client Portal Development', owner: 'IT', week: 3, status: 'planned' },
    { title: 'Training Program Overhaul', owner: 'L&D', week: 4, status: 'planned' },
    { title: 'Marketing Rebrand Campaign', owner: 'Marketing', week: 4, status: 'planned' },
    { title: 'International Office Setup', owner: 'Alex', week: 5, status: 'planned' },
    { title: 'AI Implementation Pilot', owner: 'CTO', week: 5, status: 'planned' },
    { title: 'Performance Review Cycle', owner: 'HR', week: 6, status: 'planned' },
    { title: 'Annual Budget Planning', owner: 'Finance', week: 6, status: 'planned' },
    { title: 'Partner Channel Program', owner: 'BD', week: 7, status: 'planned' },
    { title: 'Data Governance Framework', owner: 'IT', week: 8, status: 'planned' },
    { title: 'Client Satisfaction Survey', owner: 'Ops', week: 9, status: 'planned' },
    { title: 'Knowledge Management System', owner: 'IT', week: 10, status: 'planned' },
    { title: 'Quarterly Strategy Offsite', owner: 'Alex', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: ready for help, knows they need it
  advisorReadiness: {
    s1: 4, s2: 4, s3: 4, s4: 3, s5: 3,  // Strategic: decent
    o1: 4, o2: 3, o3: 4, o4: 3, o5: 4,  // Operational: good but strained
    f1: 4, f2: 3, f3: 4, f4: 3, f5: 4,  // Financial: solid
    c1: 3, c2: 4, c3: 3, c4: 4, c5: 3,  // Cultural: good intent, fatigue showing
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'Meridian Consulting Group',
    revenueRange: '8-15M',
    industry: 'Professional Services',
    employeeCount: '51-100',
    founderHours: '70+',
    yearsInBusiness: '10-20',
    growthGoal: 'Market expansion',
  },

  // Expected synthesis rules
  expectedInsights: {
    burnoutRisk: true,     // E3: 17 tasks + moderate readiness
    executionGap: false,   // E1: execution=5 not terrible, 4 pillars borderline
  },
};
