
export interface Question {
    id: string;
    text: string;
    category: string;
    weight: number;
}

export const CATEGORIES = [
    { id: 'strategic', label: 'Strategic Alignment', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'operational', label: 'Operational Maturity', color: 'bg-blue-100 text-blue-800' },
    { id: 'financial', label: 'Financial Health', color: 'bg-amber-100 text-amber-800' },
    { id: 'cultural', label: 'Cultural Readiness', color: 'bg-purple-100 text-purple-800' }
];

export const QUESTIONS: Question[] = [
    // Strategic Alignment
    { id: 's1', category: 'strategic', text: 'Does the business have a clear, documented 3-year vision?', weight: 1 },
    { id: 's2', category: 'strategic', text: 'Are the core values explicitly defined and active in decision making?', weight: 1 },
    { id: 's3', category: 'strategic', text: 'Is there a defined competitive advantage that is sustainable?', weight: 1 },
    { id: 's4', category: 'strategic', text: 'Does the leadership team have a succession plan in place?', weight: 1 },
    { id: 's5', category: 'strategic', text: 'Is the exit strategy for key stakeholders clearly understood?', weight: 1 },

    // Operational Maturity
    { id: 'o1', category: 'operational', text: 'Are current Standard Operating Procedures (SOPs) documented for critical tasks?', weight: 1 },
    { id: 'o2', category: 'operational', text: 'Does the business operate effectively when the owner is absent for 2+ weeks?', weight: 1 },
    { id: 'o3', category: 'operational', text: 'Are key performance indicators (KPIs) tracked and reviewed weekly?', weight: 1 },
    { id: 'o4', category: 'operational', text: 'Is there a robust technology stack leveraging automation?', weight: 1 },
    { id: 'o5', category: 'operational', text: 'Is customer data centralized in a CRM with high data integrity?', weight: 1 },

    // Financial Health
    { id: 'f1', category: 'financial', text: 'Are financial statements (P&L, Balance Sheet) produced accurately by the 15th?', weight: 1 },
    { id: 'f2', category: 'financial', text: 'Does the business have at least 3 months of operating cash reserves?', weight: 1 },
    { id: 'f3', category: 'financial', text: 'Is there a clear budget vs. actuals analysis performed monthly?', weight: 1 },
    { id: 'f4', category: 'financial', text: 'Are profit margins consistent with or above industry averages?', weight: 1 },
    { id: 'f5', category: 'financial', text: 'Is the business free of high-interest operational debt?', weight: 1 },

    // Cultural Readiness
    { id: 'c1', category: 'cultural', text: 'Do employees consistently demonstrate high engagement and morale?', weight: 1 },
    { id: 'c2', category: 'cultural', text: 'Is there a formal feedback loop for employee suggestions and grievances?', weight: 1 },
    { id: 'c3', category: 'cultural', text: 'Are roles and responsibilities clearly defined without ambiguity?', weight: 1 },
    { id: 'c4', category: 'cultural', text: 'Does the culture support innovation and calculated risk-taking?', weight: 1 },
    { id: 'c5', category: 'cultural', text: 'Is there a low turnover rate compared to industry standards?', weight: 1 }
];
