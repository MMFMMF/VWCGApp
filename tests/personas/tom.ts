/**
 * Persona: Tom Brennan — Brennan's BBQ & Catering Co.
 * Archetype: Hands-on restaurant owner with great execution, terrible systems
 *
 * Strengths: Strong execution, loyal customer base, brand reputation
 * Weaknesses: No technology stack, founder dependency, no standardization
 */
export const tom = {
  meta: {
    name: 'Tom Brennan',
    company: "Brennan's BBQ & Catering Co.",
    role: 'Owner/Founder',
    industry: 'Restaurant/Food Service',
    revenue: '$22M',
    employees: 310,
  },

  // AI Readiness: Very low — no tech infrastructure
  aiReadiness: {
    Strategy: 5,
    Data: 10,
    Infrastructure: 15,
    Talent: 5,
    Governance: 10,
    Culture: 10,
  },

  // Leadership DNA: Strong execution, weak strategy/delegation
  leadershipDna: {
    current_Vision: 3,
    current_Execution: 9,
    current_Empowerment: 5,
    current_Decisiveness: 6,
    current_Adaptability: 4,
    current_Integrity: 8,
    target_Vision: 5,
    target_Execution: 10,
    target_Empowerment: 7,
    target_Decisiveness: 7,
    target_Adaptability: 6,
    target_Integrity: 9,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Best brisket in Georgia — 4.7 Google rating across all locations', confidence: 5 },
      { text: 'Catering business growing 25% year over year', confidence: 5 },
      { text: "Tom's hands-on management style — he visits every location weekly", confidence: 4 },
    ],
    weaknesses: [
      { text: 'No technology stack — scheduling is done on paper at 8 of 12 locations', confidence: 5 },
      { text: 'No brand standards manual — each location looks and feels slightly different', confidence: 4 },
      { text: 'Food costs running 38% vs target of 32%', confidence: 5 },
      { text: 'Tom is the only person who negotiates vendor contracts', confidence: 5 },
    ],
    opportunities: [
      { text: 'Third-party delivery partnerships (DoorDash, UberEats)', confidence: 4 },
      { text: 'Corporate catering contracts — $500K pipeline identified', confidence: 4 },
      { text: 'Real estate — 3 prime locations identified for expansion', confidence: 3 },
    ],
    threats: [
      { text: 'Labor market — minimum wage increases could add $800K in annual labor costs', confidence: 5 },
      { text: 'Health inspection variance across locations', confidence: 4 },
      { text: 'Supply chain — primary beef supplier had reliability issues last quarter', confidence: 4 },
    ],
  },

  // Vision Canvas: Vague vision, unclear strategy
  visionCanvas: {
    northStar: 'Open 20 locations and be the best BBQ in the Southeast. Also grow catering to $8M.',
    pillars: [
      { title: 'Location expansion', kpi: '20 locations by 2030' },
      { title: 'Catering growth', kpi: '$8M catering revenue' },
      { title: 'Brand consistency', kpi: 'Standardized menu and look across all locations' },
      { title: 'Cost control', kpi: 'Food costs at 32%' },
    ],
    values: ['Good food', 'Good people', "Don't go broke"],
  },

  // Roadmap: 6 initiatives across 3 phases
  roadmap: [
    { title: 'Implement POS system across all 12 locations — Toast or Square', owner: 'IT', week: 2, status: 'planned' },
    { title: 'Hire Director of Operations to manage location visits', owner: 'HR', week: 3, status: 'planned' },
    { title: 'Create brand standards manual — menu, signage, uniforms, plating', owner: 'Marketing', week: 5, status: 'planned' },
    { title: 'Renegotiate beef supplier contract + add backup supplier', owner: 'Tom', week: 7, status: 'planned' },
    { title: 'Launch corporate catering sales push — hire dedicated catering sales rep', owner: 'Sales', week: 9, status: 'planned' },
    { title: 'Evaluate 3 new location sites — financial modeling', owner: 'Finance', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: Strong execution, terrible process/tech/strategy
  advisorReadiness: {
    s1: 2, s2: 2, s3: 2, s4: 1, s5: 1,  // Strategic: no strategy, no succession
    o1: 3, o2: 2, o3: 2, o4: 1, o5: 2,  // Operational: hands-on but no systems
    f1: 3, f2: 2, f3: 3, f4: 3, f5: 2,  // Financial: ok but food costs high
    c1: 4, c2: 3, c3: 4, c4: 2, c5: 3,  // Cultural: loyal but not innovative
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: "Brennan's BBQ & Catering Co.",
    revenueRange: '15-50M',
    industry: 'Restaurant/Food Service',
    employeeCount: '201-500',
    founderHours: '60-70',
    yearsInBusiness: '10-20',
    growthGoal: 'Revenue growth',
  },

  // Expected synthesis rules that should fire
  expectedInsights: {
    executionGap: false,  // E1: Vision is low (3), not high-vision/low-execution pattern
    founderDependency: true,  // High founder dependency (7.0/10), low org readiness (42/100)
    aiReadinessGap: true,  // Very low AI readiness across all dimensions
  },
};
