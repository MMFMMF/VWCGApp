export interface BusinessContext {
  companyName: string;      // Client/company name for report cover pages
  revenueRange: string;     // '<1M' | '1-3M' | '3-8M' | '8-15M' | '15-30M' | '30-50M' | '50M+'
  industry: string;         // Professional Services, Manufacturing, Technology/SaaS, Healthcare, Distribution, Construction, Financial Services, Retail, Other
  employeeCount: string;    // '1-5' | '6-15' | '16-50' | '51-100' | '101-250' | '250+'
  founderHours: string;     // '<40' | '40-50' | '50-60' | '60-70' | '70+'
  yearsInBusiness: string;  // '<2' | '2-5' | '5-10' | '10-20' | '20+'
  growthGoal: string;       // Revenue growth | Profitability improvement | Market expansion | Operational efficiency | Preparing for exit/succession | Stabilization
}

export const REVENUE_RANGES = [
  '<1M',
  '1-3M',
  '3-8M',
  '8-15M',
  '15-30M',
  '30-50M',
  '50M+'
] as const;

export const INDUSTRIES = [
  'Professional Services',
  'Manufacturing',
  'Technology/SaaS',
  'Healthcare',
  'Distribution',
  'Construction',
  'Financial Services',
  'Retail',
  'Other'
] as const;

export const EMPLOYEE_COUNTS = [
  '1-5',
  '6-15',
  '16-50',
  '51-100',
  '101-250',
  '250+'
] as const;

export const FOUNDER_HOURS = [
  '<40',
  '40-50',
  '50-60',
  '60-70',
  '70+'
] as const;

export const YEARS_IN_BUSINESS = [
  '<2',
  '2-5',
  '5-10',
  '10-20',
  '20+'
] as const;

export const GROWTH_GOALS = [
  'Revenue growth',
  'Profitability improvement',
  'Market expansion',
  'Operational efficiency',
  'Preparing for exit/succession',
  'Stabilization'
] as const;
