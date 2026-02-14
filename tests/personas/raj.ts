/**
 * Persona: Raj Mehta — Agency Founder with Founder Dependency
 * Archetype: Charismatic creative leader, zero delegation, everything in his head
 *
 * Strengths: Personal reputation, award-winning creative, strong retention
 * Weaknesses: No processes, 14 direct reports, financial chaos, no succession plan
 */
export const raj = {
  meta: {
    name: 'Raj Mehta',
    company: 'Mehta Digital Agency',
    role: 'CEO/Founder',
    industry: 'Marketing/Creative',
    revenue: '$8M',
    employees: 52,
  },

  // AI Readiness: creative culture but unstructured
  aiReadiness: {
    Strategy: 15,
    Data: 20,
    Infrastructure: 40,
    Talent: 30,
    Governance: 10,
    Culture: 35,
  },

  // Leadership DNA: strategic and communicative but can't delegate or execute
  leadershipDna: {
    current_Vision: 8,
    current_Execution: 5,
    current_Empowerment: 2,
    current_Decisiveness: 9,
    current_Adaptability: 9,
    current_Integrity: 8,
    target_Vision: 9,
    target_Execution: 7,
    target_Empowerment: 4,
    target_Decisiveness: 10,
    target_Adaptability: 10,
    target_Integrity: 9,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Raj\'s personal reputation — 80% of clients came through his network', confidence: 5 },
      { text: 'Award-winning creative team (3 Webby Awards)', confidence: 5 },
      { text: 'Strong client retention (88%)', confidence: 4 },
    ],
    weaknesses: [
      { text: 'No documented processes — everything lives in Raj\'s head', confidence: 5 },
      { text: 'Zero middle management — 14 direct reports to Raj', confidence: 5 },
      { text: 'Financial reporting is 60 days behind', confidence: 4 },
      { text: 'No CRM — client relationships tracked in spreadsheets', confidence: 4 },
    ],
    opportunities: [
      { text: 'AI-powered creative testing could 3x throughput', confidence: 4 },
      { text: 'Retainer model shift from project-based billing', confidence: 3 },
      { text: 'Expansion into influencer management vertical', confidence: 3 },
    ],
    threats: [
      { text: 'Key client concentration — top 3 clients = 55% of revenue', confidence: 5 },
      { text: 'Raj has no succession plan and no #2', confidence: 5 },
      { text: 'AI tools enabling clients to bring creative in-house', confidence: 4 },
    ],
  },

  // Vision Canvas: ambitious DTC agency growth plan
  visionCanvas: {
    northStar: 'Build the go-to performance marketing agency for DTC brands — $30M revenue in 4 years',
    pillars: [
      { title: 'Creative that converts', kpi: '3x ad performance vs industry avg' },
      { title: 'Radical transparency with clients', kpi: 'Real-time dashboard access' },
      { title: 'Data over opinions', kpi: 'AI-powered creative testing' },
      { title: 'Diversified client portfolio', kpi: 'No client > 15% revenue' },
    ],
    values: ['Creative that converts', 'Radical transparency', 'Data over opinions'],
  },

  // Roadmap: 6 initiatives across 3 phases
  roadmap: [
    { title: 'Hire COO / Head of Operations', owner: 'HR', week: 2, status: 'planned' },
    { title: 'Implement project management system — Monday.com or Asana', owner: 'IT', week: 3, status: 'planned' },
    { title: 'Document top 5 client delivery workflows', owner: 'Operations', week: 5, status: 'planned' },
    { title: 'Set up QuickBooks Online with monthly close process', owner: 'Finance', week: 7, status: 'planned' },
    { title: 'Diversify client base — acquire 4 new mid-tier clients', owner: 'Sales', week: 9, status: 'planned' },
    { title: 'Build Raj\'s succession/delegation plan', owner: 'Raj', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: visionary but chaotic operations and financials
  advisorReadiness: {
    s1: 3, s2: 4, s3: 2, s4: 1, s5: 1,  // Strategic: vision without plan
    o1: 1, o2: 1, o3: 1, o4: 3, o5: 2,  // Operational: zero process
    f1: 1, f2: 1, f3: 2, f4: 2, f5: 1,  // Financial: 60 days behind
    c1: 4, c2: 2, c3: 2, c4: 5, c5: 3,  // Cultural: creative energy but no structure
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'Mehta Digital Agency',
    revenueRange: '5-8M',
    industry: 'Marketing/Creative',
    employeeCount: '51-100',
    founderHours: '70+',
    yearsInBusiness: '5-10',
    growthGoal: 'Revenue growth',
  },

  // Expected synthesis rules
  expectedInsights: {
    founderDependency: true,  // V2-R6: Execution=5, Empowerment=2, 14 reports → 9.2/10
    organizationalReadiness: true,  // V2-R7: avgReadiness=28/100 (way below 50)
    executionGap: true,  // V2-R1: Vision=8, Execution=5, 4 pillars
  },
};
