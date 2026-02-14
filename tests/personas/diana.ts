/**
 * Persona: Diana Okafor — Healthcare CEO Scaling Regional Presence
 * Archetype: Experienced operator with strong values, managing growth and modernization
 *
 * Strengths: Patient outcomes, physician retention, execution excellence, strong integrity
 * Weaknesses: Marketing underdeveloped, aging IT infrastructure, thin middle management
 */
export const diana = {
  meta: {
    name: 'Diana Okafor',
    company: 'Okafor Health Partners',
    role: 'CEO/Founder',
    industry: 'Healthcare',
    revenue: '$32M',
    employees: 280,
  },

  // AI Readiness: 6 dimensions, 0-100 range sliders
  aiReadiness: {
    Strategy: 60,
    Data: 70,
    Infrastructure: 55,
    Talent: 50,
    Governance: 80,
    Culture: 65,
  },

  // Leadership DNA: 6 dimensions, 0-10 number inputs (current + target)
  leadershipDna: {
    current_Vision: 9,
    current_Execution: 9,
    current_Empowerment: 8,
    current_Decisiveness: 7,
    current_Adaptability: 7,
    current_Integrity: 10,
    target_Vision: 10,
    target_Execution: 10,
    target_Empowerment: 9,
    target_Decisiveness: 8,
    target_Adaptability: 8,
    target_Integrity: 10,
  },

  // SWOT: quadrant arrays with text + confidence (1-5)
  swot: {
    strengths: [
      { text: 'Exceptional patient satisfaction scores (4.8/5 across all clinics)', confidence: 5 },
      { text: 'Strong physician retention — 94% over 3 years', confidence: 5 },
      { text: 'Proprietary patient intake workflow reducing wait times by 40%', confidence: 4 },
    ],
    weaknesses: [
      { text: 'Marketing is underdeveloped — most growth is word-of-mouth', confidence: 4 },
      { text: 'IT infrastructure is aging — still running legacy EHR system', confidence: 5 },
      { text: 'Middle management layer is thin — clinic directors report directly to me', confidence: 4 },
    ],
    opportunities: [
      { text: 'Value-based care contracts with two major insurers in negotiation', confidence: 4 },
      { text: 'Telehealth expansion into rural underserved markets', confidence: 4 },
      { text: 'Partnership with regional hospital system', confidence: 3 },
    ],
    threats: [
      { text: 'Private equity consolidation in outpatient space', confidence: 4 },
      { text: 'Regulatory changes in reimbursement models', confidence: 4 },
      { text: 'Physician burnout and national staffing shortage', confidence: 5 },
    ],
  },

  // Vision Canvas
  visionCanvas: {
    northStar: 'Become the regional standard for value-based primary care — 15 clinics across three states by 2029',
    pillars: [
      { title: 'Expand to 15 clinics', kpi: '5 new locations by 2029' },
      { title: 'Value-based care contracts', kpi: '2 major insurers signed by Q3' },
      { title: 'Telehealth expansion', kpi: 'Launch in 2 rural counties' },
      { title: 'EHR modernization', kpi: 'Modern system live by Q4' },
      { title: 'Management development', kpi: 'VP Marketing + middle mgmt layer' },
    ],
    values: ['Patient outcomes first', 'Data-driven clinical decisions', 'Community-rooted care'],
  },

  // Roadmap: tasks with title, owner, week (1-12), status
  roadmap: [
    { title: 'Migrate to modern EHR system', owner: 'IT', week: 3, status: 'planned' },
    { title: 'Hire VP of Marketing', owner: 'HR', week: 4, status: 'planned' },
    { title: 'Launch telehealth pilot in 2 rural counties', owner: 'Operations', week: 6, status: 'planned' },
    { title: 'Finalize value-based care contracts', owner: 'Diana', week: 7, status: 'planned' },
    { title: 'Develop middle management training program', owner: 'HR', week: 10, status: 'planned' },
  ],

  // Advisor Readiness: 20 questions (s1-s5, o1-o5, f1-f5, c1-c5), 1-5 scale
  advisorReadiness: {
    s1: 4, s2: 4, s3: 5, s4: 3, s5: 4,  // Strategic: strong vision, developing succession
    o1: 3, o2: 4, o3: 4, o4: 3, o5: 3,  // Operational: good processes, aging IT
    f1: 4, f2: 4, f3: 4, f4: 5, f5: 4,  // Financial: $32M, strong
    c1: 5, c2: 4, c3: 4, c4: 3, c5: 4,  // Cultural: patient-focused culture
  },

  // Business Context: company demographics for reports
  businessContext: {
    companyName: 'Okafor Health Partners',
    revenueRange: '15-50M',
    industry: 'Healthcare',
    employeeCount: '201-500',
    founderHours: '40-50',
    yearsInBusiness: '10-20',
    growthGoal: 'Market expansion',
  },

  // Expected synthesis rules that should fire
  expectedInsights: {},
};
