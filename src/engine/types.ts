export type InsightType = 'risk' | 'opportunity' | 'conflict' | 'strength';
export type InsightSeverity = 'high' | 'medium' | 'low';

export interface Insight {
    id: string;
    type: InsightType;
    severity: InsightSeverity;
    title: string;
    message: string;
    recommendation: string;
    relatedTools: string[]; // Tool IDs involved in this insight
}

export interface SynthesisRule {
    id: string; // e.g., 'E1_vision_execution_gap'
    name: string;
    description: string;
    execute: (workspace: any) => Insight | null;
}
