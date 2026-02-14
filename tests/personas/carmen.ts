/**
 * Persona: Carmen Villarreal — Traditional Builder Facing Digital Transition
 * Archetype: Experienced operator with strong reputation but outdated technology
 *
 * Strengths: 23-year reputation, exceptional safety record, loyal workforce
 * Weaknesses: Technology 5-10 years behind, manual estimating, no formal strategy
 */
export const carmen = {
  meta: {
    name: 'Carmen Villarreal',
    company: 'Villarreal Construction Group',
    role: 'Owner/President',
    industry: 'Construction',
    revenue: '$48M',
    employees: 475,
  },

  // AI Readiness: very low — traditional, tech-averse
  aiReadiness: {
    Strategy: 10,
    Data: 15,
    Infrastructure: 10,
    Talent: 5,
    Governance: 20,
    Culture: 10,
  },

  // Leadership DNA: strong execution and integrity, weak innovation and strategy
  leadershipDna: {
    current_Vision: 5,
    current_Execution: 8,
    current_Empowerment: 7,
    current_Decisiveness: 6,
    current_Adaptability: 3,
    current_Integrity: 9,
    target_Vision: 7,
    target_Execution: 9,
    target_Empowerment: 8,
    target_Decisiveness: 7,
    target_Adaptability: 5,
    target_Integrity: 10,
  },

  // SWOT
  swot: {
    strengths: [
      { text: '23-year reputation — repeat clients account for 65% of revenue', confidence: 5 },
      { text: 'Best safety record in region (0.8 TRIR vs industry 3.1)', confidence: 5 },
      { text: 'Bilingual workforce — seamless service in English and Spanish markets', confidence: 4 },
    ],
    weaknesses: [
      { text: 'Technology adoption is 5-10 years behind competitors', confidence: 5 },
      { text: 'Estimating is manual — 3-week turnaround vs competitors\' 5 days', confidence: 5 },
      { text: 'No formal strategic plan — Carmen makes decisions intuitively', confidence: 4 },
      { text: 'High turnover in project managers — 40% annual', confidence: 4 },
    ],
    opportunities: [
      { text: 'Government infrastructure spending — $2B in regional projects next 3 years', confidence: 4 },
      { text: 'Prefabrication / modular construction methods', confidence: 3 },
      { text: 'Competitor went bankrupt — their clients are looking for a new builder', confidence: 4 },
    ],
    threats: [
      { text: 'Material cost volatility — lumber up 30% this year', confidence: 5 },
      { text: 'Skilled labor shortage — average crew age is 47', confidence: 5 },
      { text: 'Bonding capacity limits growth to $60M without additional collateral', confidence: 4 },
    ],
  },

  // Vision Canvas: solid vision but needs modernization
  visionCanvas: {
    northStar: 'Become the most trusted mid-market commercial builder in Texas — $75M revenue with best-in-class safety record',
    pillars: [
      { title: 'Modernize estimating to 5-day turnaround', kpi: '80% faster bids' },
      { title: 'Win $15M in government contracts', kpi: '$75M revenue' },
      { title: 'Maintain industry-leading safety', kpi: '0.6 TRIR' },
      { title: 'Reduce PM turnover to industry average', kpi: '20% turnover' },
    ],
    values: ['Safety is non-negotiable', 'Build relationships not just buildings', 'Invest in our crews'],
  },

  // Roadmap: focused modernization plan
  roadmap: [
    { title: 'Implement construction estimating software — ProEst or STACK', owner: 'IT', week: 2, status: 'planned' },
    { title: 'Hire Director of Preconstruction', owner: 'HR', week: 3, status: 'planned' },
    { title: 'Launch project manager retention program — mentorship + comp review', owner: 'HR', week: 5, status: 'planned' },
    { title: 'Pursue 3 government infrastructure RFPs', owner: 'Sales', week: 6, status: 'planned' },
    { title: 'Evaluate prefabrication pilot for one commercial project', owner: 'Operations', week: 9, status: 'planned' },
    { title: 'Develop 3-year strategic plan with leadership team', owner: 'Carmen', week: 10, status: 'planned' },
  ],

  // Advisor Readiness: strong operations from experience, weak tech/strategy
  advisorReadiness: {
    s1: 2, s2: 3, s3: 3, s4: 2, s5: 2,  // Strategic: no formal strategy
    o1: 4, o2: 3, o3: 3, o4: 1, o5: 2,  // Operational: good execution, awful tech
    f1: 4, f2: 3, f3: 3, f4: 4, f5: 3,  // Financial: solid $48M business, bonding constraints
    c1: 4, c2: 4, c3: 5, c4: 2, c5: 4,  // Cultural: loyal crews, low innovation
  },

  // Business Context: established mid-market construction firm
  businessContext: {
    companyName: 'Villarreal Construction Group',
    revenueRange: '15-50M',
    industry: 'Construction',
    employeeCount: '201-500',
    founderHours: '50-60',
    yearsInBusiness: '20+',
    growthGoal: 'Revenue growth',
  },

  // Expected synthesis rules
  expectedInsights: {
    burnoutRisk: false,     // E3: only 6 tasks, reasonable load
    executionGap: false,    // E1: execution=8 is strong, 4 pillars manageable
    lowAiReadiness: true,   // Average AI readiness: 11.7 (very low)
  },
};
