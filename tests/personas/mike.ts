/**
 * Persona: Mike Patterson — Traditional Business Owner
 * Archetype: Old school operator running a tight ship but falling behind
 *
 * Strengths: Solid operations, good financials, established processes
 * Weaknesses: AI-averse, leadership bottleneck, no strategic vision
 */
export const mike = {
  meta: {
    name: 'Mike Patterson',
    company: 'Patterson Industrial Supply',
    role: 'Owner/Operator',
    industry: 'Manufacturing/Distribution',
    revenue: '$8M',
    employees: 40,
  },

  // AI Readiness: LOW across the board (tech-skeptical)
  aiReadiness: {
    Strategy: 20,
    Data: 15,
    Infrastructure: 25,
    Talent: 10,
    Governance: 15,
    Culture: 10,
  },

  // Leadership DNA: strong execution, weak vision/delegation
  leadershipDna: {
    current_Vision: 3,
    current_Execution: 8,
    current_Empowerment: 3,
    current_Decisiveness: 7,
    current_Adaptability: 4,
    current_Integrity: 9,
    target_Vision: 5,
    target_Execution: 9,
    target_Empowerment: 5,
    target_Decisiveness: 8,
    target_Adaptability: 6,
    target_Integrity: 9,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Decades of industry experience and reputation', confidence: 5 },
      { text: 'Strong cash flow and zero debt', confidence: 5 },
      { text: 'Loyal experienced workforce', confidence: 4 },
    ],
    weaknesses: [
      { text: 'Everything goes through Mike bottleneck', confidence: 5 },
      { text: 'No technology strategy or digital presence', confidence: 4 },
      { text: 'Aging equipment needing replacement', confidence: 3 },
    ],
    opportunities: [
      { text: 'Government infrastructure contracts expanding', confidence: 4 },
      { text: 'Competitor retiring and selling client list', confidence: 3 },
    ],
    threats: [
      { text: 'Supply Chain Disruption from overseas suppliers', confidence: 5 },
      { text: 'Amazon Business undercutting distribution margins', confidence: 4 },
      { text: 'Workforce retirement wave in next 5 years', confidence: 4 },
    ],
  },

  // Vision Canvas: weak/vague
  visionCanvas: {
    northStar: 'Keep growing the business steadily',
    pillars: [
      { title: 'Quality products', kpi: 'Zero defect returns' },
      { title: 'Good customer service', kpi: '95% satisfaction' },
    ],
    values: ['Hard work', 'Reliability'],
  },

  // Roadmap: conservative, manageable
  roadmap: [
    { title: 'Replace warehouse forklift fleet', owner: 'Mike', week: 2, status: 'planned' },
    { title: 'Hire warehouse manager', owner: 'Mike', week: 3, status: 'planned' },
    { title: 'Renew insurance policies', owner: 'Office', week: 4, status: 'planned' },
    { title: 'Annual safety training', owner: 'HR', week: 5, status: 'planned' },
    { title: 'Client appreciation event', owner: 'Sales', week: 8, status: 'planned' },
  ],

  // Advisor Readiness: strong financials/ops, weak strategy
  advisorReadiness: {
    s1: 2, s2: 3, s3: 3, s4: 1, s5: 1,  // Strategic: no vision, no succession
    o1: 5, o2: 3, o3: 4, o4: 2, o5: 2,  // Operational: good SOPs, weak tech
    f1: 5, f2: 5, f3: 4, f4: 4, f5: 5,  // Financial: strong
    c1: 4, c2: 3, c3: 4, c4: 2, c5: 4,  // Cultural: stable but not innovative
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'Patterson Industrial Supply',
    revenueRange: '8-15M',
    industry: 'Manufacturing',
    employeeCount: '16-50',
    founderHours: '60-70',
    yearsInBusiness: '20+',
    growthGoal: 'Stabilization',
  },

  // Expected synthesis rules
  expectedInsights: {
    unmitigatedThreat: true,  // E2: Supply Chain Disruption not in roadmap
    strengthLeverage: false,  // E4: Innovation < 8, won't fire
  },
};
