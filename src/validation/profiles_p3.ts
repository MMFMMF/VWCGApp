import type { ToolValidationProfile, ValidationIssue } from './types.ts';

// E9. 90-Day Roadmap
export const roadmapProfile: ToolValidationProfile = {
    id: 'roadmap_90_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.tasks || !Array.isArray(data.tasks)) {
            issues.push({ code: 'RDM-REQ-001', message: 'Missing tasks array', path: 'tasks', severity: 'error' });
            return issues;
        }

        const seenIds = new Set<string>();
        data.tasks.forEach((task: any, idx: number) => {
            if (!task.id) issues.push({ code: 'RDM-REQ-002', message: 'Missing task ID', path: `tasks[${idx}]`, severity: 'error' });
            if (seenIds.has(task.id)) issues.push({ code: 'RDM-DUP-001', message: 'Duplicate task ID', path: `tasks[${idx}]`, severity: 'error' });
            seenIds.add(task.id);

            // Phase checks
            if (task.week === undefined || task.week < 1 || task.week > 12) {
                issues.push({ code: 'RDM-VAL-001', message: 'Week must be 1-12', path: `tasks[${idx}].week`, severity: 'warn' });
            }
        });

        // Dependency cycle check (L3)
        // Simplified check: A task cannot depend on itself
        data.tasks.forEach((task: any, idx: number) => {
            if (task.dependencies && Array.isArray(task.dependencies)) {
                if (task.dependencies.includes(task.id)) {
                    issues.push({ code: 'RDM-CYC-001', message: 'Self-dependency detected', path: `tasks[${idx}]`, severity: 'error' });
                }
            }
        });

        return issues;
    }
};

// J2. Advisor Readiness (Appendix J)
export const advisorProfile: ToolValidationProfile = {
    id: 'advisor_readiness_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];

        // J2.1 Responses
        if (!data.responses || !Array.isArray(data.responses)) {
            issues.push({ code: 'ADR-REQ-001', message: 'Missing responses', path: 'responses', severity: 'error' });
        } else {
            // Diagnostic Integrity: "If responses missing for any required dimension -> incomplete"
            // MVP Check: Just count them. 
            if (data.responses.length < 10) {
                issues.push({ code: 'ADR-INC-001', message: 'Diagnostic incomplete (too few responses)', path: 'responses', severity: 'warn' });
            }
        }

        // J2.2 ROI Assumptions
        if (!data.roi) {
            // "If ROI assumptions missing -> exports allowed but must label..."
            issues.push({ code: 'ADR-ROI-001', message: 'ROI assumptions missing', path: 'roi', severity: 'warn' });
        } else {
            const { best, likely, worst } = data.roi;
            if (best === undefined || likely === undefined || worst === undefined) {
                issues.push({ code: 'ADR-ROI-002', message: 'ROI scenarios incomplete', path: 'roi', severity: 'warn' });
            } else {
                if (!(best >= likely && likely >= worst)) {
                    issues.push({ code: 'ADR-ROI-002', message: 'ROI scenarios invalid (best >= likely >= worst)', path: 'roi', severity: 'warn' });
                }
            }
        }

        // J2.3 Risk & Roadmap
        if (data.risks && !Array.isArray(data.risks)) issues.push({ code: 'ADR-TYP-001', message: 'Risks must be array', path: 'risks', severity: 'error' });
        if (data.roadmap_tasks && !Array.isArray(data.roadmap_tasks)) issues.push({ code: 'ADR-TYP-002', message: 'Roadmap tasks must be array', path: 'roadmap_tasks', severity: 'error' });

        return issues;
    }
};
