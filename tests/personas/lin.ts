/**
 * Persona: Lin Zhang — ZhangTech Precision Manufacturing
 * Archetype: Tech-savvy manufacturing CEO with innovation prowess, weak sales/communication
 *
 * Strengths: AI-powered quality control, engineering excellence, innovation-driven
 * Weaknesses: Sales bottleneck, communication gaps, ERP key person risk
 */
export const lin = {
  meta: {
    name: 'Lin Zhang',
    company: 'ZhangTech Precision Manufacturing',
    role: 'CEO/Founder',
    industry: 'Advanced Manufacturing',
    revenue: '$38M',
    employees: 210,
  },

  // AI Readiness: Very high — AI-powered quality control, strong data infrastructure
  aiReadiness: {
    Strategy: 80,
    Data: 85,
    Infrastructure: 90,
    Talent: 75,
    Governance: 70,
    Culture: 80,
  },

  // Leadership DNA: Strong vision/innovation, weak communication/delegation
  leadershipDna: {
    current_Vision: 9,
    current_Execution: 7,
    current_Empowerment: 6,
    current_Decisiveness: 5,
    current_Adaptability: 10,
    current_Integrity: 8,
    target_Vision: 10,
    target_Execution: 8,
    target_Empowerment: 8,
    target_Decisiveness: 7,
    target_Adaptability: 10,
    target_Integrity: 9,
  },

  // SWOT
  swot: {
    strengths: [
      { text: 'Proprietary AI-powered visual inspection system — 99.7% defect detection rate', confidence: 5 },
      { text: 'AS9100 and ISO 13485 certified', confidence: 5 },
      { text: 'Engineering team with 6 PhDs and 14 patents', confidence: 5 },
    ],
    weaknesses: [
      { text: 'Sales team is 2 people — all major deals go through Lin', confidence: 5 },
      { text: "Shop floor communication gaps — engineering and machinist teams don't speak the same language", confidence: 4 },
      { text: 'ERP system is heavily customized and fragile — one person maintains it', confidence: 5 },
      { text: 'Cash flow tight despite profitability — heavy capex cycles for new CNC machines', confidence: 4 },
    ],
    opportunities: [
      { text: 'Reshoring trend — OEMs moving supply chains back to US', confidence: 4 },
      { text: 'Medical device market growing 8% annually', confidence: 4 },
      { text: 'Predictive maintenance offering as a service to other manufacturers', confidence: 3 },
    ],
    threats: [
      { text: 'Key person risk on ERP system — single maintainer', confidence: 5 },
      { text: 'Aerospace customer consolidation reducing number of potential buyers', confidence: 4 },
      { text: 'Chinese competitors offering 40% lower pricing on commodity parts', confidence: 4 },
    ],
  },

  // Vision Canvas: Strong, ambitious vision
  visionCanvas: {
    northStar: 'Become the smart manufacturing partner of choice for aerospace and medical device OEMs — $100M revenue by 2030 with industry-leading defect rates below 0.1%',
    pillars: [
      { title: 'Aerospace + Medical OEM partnerships', kpi: '$100M revenue by 2030' },
      { title: 'AI-augmented quality leadership', kpi: 'Defect rates < 0.1%' },
      { title: 'Predictive maintenance as a service', kpi: 'Launch pilot offering' },
      { title: 'Reshoring capture', kpi: 'Win 3 reshoring RFPs' },
      { title: 'Vertical integration', kpi: 'Full raw material to certified part capability' },
    ],
    values: ['Precision is our product', 'AI-augmented quality human-guided craftsmanship', 'Vertical integration'],
  },

  // Roadmap: 6 initiatives across 3 phases
  roadmap: [
    { title: 'Hire VP of Sales with aerospace/medical device Rolodex', owner: 'HR', week: 2, status: 'planned' },
    { title: 'Cross-train 2 additional engineers on ERP system maintenance', owner: 'IT', week: 3, status: 'planned' },
    { title: 'Launch predictive maintenance pilot as a service offering', owner: 'Innovation', week: 5, status: 'planned' },
    { title: 'Implement shop floor communication system — digital work orders + translation layer', owner: 'Operations', week: 7, status: 'planned' },
    { title: 'Pursue 3 reshoring RFPs from target OEMs', owner: 'Sales', week: 9, status: 'planned' },
    { title: 'Financial modeling for next CNC machine purchase vs lease', owner: 'Finance', week: 11, status: 'planned' },
  ],

  // Advisor Readiness: Strong tech/innovation, weak sales/communication
  advisorReadiness: {
    s1: 4, s2: 4, s3: 5, s4: 3, s5: 3,  // Strategic: strong vision, decent planning
    o1: 4, o2: 3, o3: 4, o4: 4, o5: 3,  // Operational: good but ERP risk
    f1: 3, f2: 3, f3: 3, f4: 4, f5: 3,  // Financial: profitable but cash-constrained
    c1: 3, c2: 3, c3: 3, c4: 5, c5: 4,  // Cultural: innovation-driven, communication gaps
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'ZhangTech Precision Manufacturing',
    revenueRange: '15-50M',
    industry: 'Advanced Manufacturing',
    employeeCount: '201-500',
    founderHours: '50-60',
    yearsInBusiness: '10-20',
    growthGoal: 'Revenue growth',
  },

  // Expected synthesis rules that should fire
  expectedInsights: {
    executionGap: false,  // E1: Vision (9) high, but Execution (7) is decent, not low
    aiReadinessStrength: true,  // High AI readiness across all dimensions
    keyPersonRisk: true,  // ERP system maintained by single person
  },
};
