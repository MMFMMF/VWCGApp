/**
 * Persona: David Park — Conservative Wealth Management Firm
 * Archetype: Established financial advisor with excellent compliance but aging technology
 *
 * Strengths: Client retention, fiduciary track record, financial stability
 * Weaknesses: Paper processes, no digital presence, advisor succession crisis
 */
export const david = {
  meta: {
    name: 'David Park',
    company: 'Park & Associates Wealth Management',
    role: 'Managing Partner',
    industry: 'Financial Services',
    revenue: '$14M',
    employees: 65,
  },

  // AI Readiness: very low tech adoption
  aiReadiness: {
    Strategy: 5,
    Data: 25,
    Infrastructure: 15,
    Talent: 10,
    Governance: 40,
    Culture: 15,
  },

  // Leadership DNA: strong execution and integrity, weak innovation
  leadershipDna: {
    current_Vision: 7,
    current_Execution: 8,
    current_Empowerment: 6,
    current_Decisiveness: 8,
    current_Adaptability: 3,
    current_Integrity: 10,
    target_Vision: 9,
    target_Execution: 9,
    target_Empowerment: 8,
    target_Decisiveness: 9,
    target_Adaptability: 5,
    target_Integrity: 10,
  },

  // SWOT
  swot: {
    strengths: [
      { text: '98% client retention over 10 years', confidence: 5 },
      { text: 'Average client relationship is 12 years', confidence: 5 },
      { text: 'Compliance track record — zero regulatory findings in 18 years', confidence: 5 },
    ],
    weaknesses: [
      { text: 'Still using paper-based onboarding for new clients', confidence: 5 },
      { text: 'No social media or digital marketing presence', confidence: 4 },
      { text: 'Advisor succession — 3 of 5 senior advisors are over 60', confidence: 5 },
      { text: 'Client portal is a static PDF upload site from 2015', confidence: 4 },
    ],
    opportunities: [
      { text: 'Next-gen wealth transfer — $2.3B in client assets shifting to heirs in next decade', confidence: 4 },
      { text: 'Fee-based financial planning model expansion', confidence: 3 },
      { text: 'Acquisition of a smaller RIA firm (owner retiring)', confidence: 3 },
    ],
    threats: [
      { text: 'Robo-advisors eroding fee tolerance among younger clients', confidence: 4 },
      { text: 'Regulatory complexity increasing compliance costs', confidence: 4 },
      { text: 'Competitors offering mobile-first client experience', confidence: 4 },
    ],
  },

  // Vision Canvas: clear but conservative
  visionCanvas: {
    northStar: 'Serve 500 high-net-worth families with a multigenerational wealth approach — become the most referred RIA in the Midwest',
    pillars: [
      { title: '500 family milestone', kpi: 'Current 350 → 500 by 2028' },
      { title: 'Multigenerational engagement', kpi: '80% next-gen retention' },
      { title: 'Digital modernization', kpi: 'Full digital onboarding by Q4' },
      { title: 'Advisor succession pipeline', kpi: '3 junior advisors promoted' },
    ],
    values: ['Fiduciary duty above all', 'Relationships across generations', 'Conservative growth aggressive service'],
  },

  // Roadmap: focused on succession and modernization
  roadmap: [
    { title: 'Launch digital onboarding process — replace paper forms', owner: 'IT', week: 2, status: 'planned' },
    { title: 'Create advisor succession plan for 3 senior partners', owner: 'David', week: 3, status: 'planned' },
    { title: 'Build next-gen client engagement program targeting heirs', owner: 'Marketing', week: 6, status: 'planned' },
    { title: 'Upgrade client portal to interactive dashboard', owner: 'IT', week: 7, status: 'planned' },
    { title: 'Evaluate RIA acquisition target — due diligence', owner: 'David', week: 10, status: 'planned' },
  ],

  // Advisor Readiness: strong finances/compliance, weak tech/succession
  advisorReadiness: {
    s1: 3, s2: 4, s3: 4, s4: 2, s5: 2,  // Strategic: good vision, poor succession
    o1: 3, o2: 2, o3: 3, o4: 1, o5: 2,  // Operational: paper processes, no tech
    f1: 5, f2: 5, f3: 5, f4: 4, f5: 5,  // Financial: excellent
    c1: 4, c2: 4, c3: 5, c4: 1, c5: 4,  // Cultural: stable, not innovative
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'Park & Associates Wealth Management',
    revenueRange: '8-15M',
    industry: 'Financial Services',
    employeeCount: '51-100',
    founderHours: '50-60',
    yearsInBusiness: '10-20',
    growthGoal: 'Client retention',
  },

  // Expected synthesis rules
  expectedInsights: {
    // Low AI readiness across dimensions
    // Succession risk (s5: 2)
    // Technology gap (o4: 1, Infrastructure: 15)
  },
};
