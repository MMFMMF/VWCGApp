/**
 * Persona: Keisha Williams — Mission-Driven Nonprofit Founder
 * Archetype: Visionary executive director with national profile but operational chaos
 *
 * Strengths: Amazing vision, brand recognition, program outcomes
 * Weaknesses: Extreme founder dependency, no COO, weak financial systems
 */
export const keisha = {
  meta: {
    name: 'Keisha Williams',
    company: 'BridgeUp Youth Initiative',
    role: 'Executive Director/Founder',
    industry: 'Nonprofit',
    revenue: '$11M',
    employees: 95,
  },

  // AI Readiness: mission-driven but tech-challenged
  aiReadiness: {
    Strategy: 25,
    Data: 35,
    Infrastructure: 30,
    Talent: 20,
    Governance: 50,
    Culture: 40,
  },

  // Leadership DNA: exceptional vision/communication, terrible execution/delegation
  leadershipDna: {
    current_Vision: 9,
    current_Execution: 2,
    current_Empowerment: 3,
    current_Decisiveness: 10,
    current_Adaptability: 8,
    current_Integrity: 10,
    target_Vision: 10,
    target_Execution: 4,
    target_Empowerment: 5,
    target_Decisiveness: 10,
    target_Adaptability: 10,
    target_Integrity: 10,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Keisha\'s national profile — TED Talk, White House recognition', confidence: 5 },
      { text: 'Program outcomes — 78% job placement rate for graduates', confidence: 5 },
      { text: 'Strong brand and donor loyalty', confidence: 4 },
    ],
    weaknesses: [
      { text: 'No COO — Keisha approves every grant budget and hire', confidence: 5 },
      { text: 'Program delivery quality varies wildly across 8 city sites', confidence: 5 },
      { text: 'Financial systems can\'t handle multi-site, multi-funder reporting', confidence: 4 },
      { text: 'Staff turnover at 45% — competitive nonprofit salaries but burnout is high', confidence: 5 },
    ],
    opportunities: [
      { text: 'Federal workforce development funding increase — $500M new allocation', confidence: 4 },
      { text: 'Corporate ESG budgets looking for measurable social impact partners', confidence: 4 },
      { text: 'Licensing the BridgeUp curriculum to school districts', confidence: 3 },
    ],
    threats: [
      { text: 'Grant concentration — one federal grant = 35% of budget', confidence: 5 },
      { text: 'Political shifts could cut workforce development funding', confidence: 4 },
      { text: 'Founder burnout — Keisha hasn\'t taken more than 3 consecutive days off in 4 years', confidence: 5 },
    ],
  },

  // Vision Canvas: crystal clear, wildly ambitious
  visionCanvas: {
    northStar: 'Transform youth employment outcomes in 50 cities by 2030 — every young person deserves a pathway to economic mobility',
    pillars: [
      { title: '50 cities by 2030', kpi: 'Currently 8 → 50 in 6 years' },
      { title: 'Job placement excellence', kpi: 'Maintain 78%+ placement rate at scale' },
      { title: 'Curriculum licensing model', kpi: 'License to 20 school districts' },
      { title: 'Financial sustainability', kpi: 'Reduce grant concentration to <20%' },
      { title: 'Organizational infrastructure', kpi: 'COO hired, staff turnover <20%' },
    ],
    values: ['Youth voice at the center', 'Employer partnerships that lead to real jobs', 'Data proves impact stories inspire action'],
  },

  // Roadmap: smart priorities focused on infrastructure
  roadmap: [
    { title: 'Hire COO with multi-site nonprofit experience', owner: 'HR', week: 2, status: 'planned' },
    { title: 'Standardize program delivery playbook across all 8 sites', owner: 'Operations', week: 3, status: 'planned' },
    { title: 'Implement fund accounting system — Sage Intacct or Blackbaud', owner: 'Finance', week: 5, status: 'planned' },
    { title: 'Apply for 3 new federal workforce development grants', owner: 'Development', week: 7, status: 'planned' },
    { title: 'Develop curriculum licensing model and pilot with 2 school districts', owner: 'Keisha', week: 9, status: 'planned' },
    { title: 'Create board-approved founder succession plan', owner: 'Board', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: strong mission/brand, terrible operations/structure
  advisorReadiness: {
    s1: 4, s2: 5, s3: 3, s4: 1, s5: 1,  // Strategic: amazing vision, no succession
    o1: 2, o2: 1, o3: 2, o4: 2, o5: 2,  // Operational: inconsistent, no COO
    f1: 2, f2: 2, f3: 2, f4: 3, f5: 2,  // Financial: grant-dependent, weak systems
    c1: 5, c2: 3, c3: 3, c4: 4, c5: 4,  // Cultural: mission-driven but burned out
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'BridgeUp Youth Initiative',
    revenueRange: '8-15M',
    industry: 'Nonprofit',
    employeeCount: '51-100',
    founderHours: '70+',
    yearsInBusiness: '5-10',
    growthGoal: 'Market expansion',
    founderDependencyIndex: 8.5,
  },

  // Expected synthesis rules
  expectedInsights: {
    executionGap: true,   // E1: vision=9, execution=2, 5 pillars
    burnoutRisk: false,   // Only 6 tasks, won't trigger
    founderDependency: true,  // Extreme: 8.5/10, 70+ hours, no succession
  },
};
