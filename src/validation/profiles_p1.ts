import type { ToolValidationProfile, ValidationIssue } from './types.ts';

// E1. AI Readiness Assessment
export const aiReadinessProfile: ToolValidationProfile = {
    id: 'aireadiness_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.dimensions || !Array.isArray(data.dimensions)) {
            issues.push({ code: 'AIR-REQ-001', message: 'Missing dimensions array', path: 'dimensions', severity: 'error' });
            return issues;
        }

        let weightSum = 0;
        const seenIds = new Set<string>();

        data.dimensions.forEach((dim: any, idx: number) => {
            if (!dim.id) issues.push({ code: 'AIR-REQ-002', message: 'Missing dimension ID', path: `dimensions[${idx}]`, severity: 'error' });
            if (seenIds.has(dim.id)) issues.push({ code: 'AIR-DUP-001', message: 'Duplicate dimension ID', path: `dimensions[${idx}]`, severity: 'error' });
            seenIds.add(dim.id);

            if (dim.score === undefined || typeof dim.score !== 'number' || dim.score < 0 || dim.score > 100) {
                issues.push({ code: 'AIR-VAL-001', message: 'Score must be 0-100', path: `dimensions[${idx}].score`, severity: 'warn' });
            }

            weightSum += dim.weight || 0;
        });

        if (Math.abs(weightSum - 1) > 0.01) {
            issues.push({ code: 'AIR-WGT-001', message: `Weights sum to ${weightSum}, expected 1.0`, path: 'dimensions', severity: 'warn' });
        }

        return issues;
    }
};

// E2. Leadership DNA Radar
export const leadershipDnaProfile: ToolValidationProfile = {
    id: 'leadership_radar_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        // Note: The current implementation stores flat fields like 'current_Vision', not an executives array
        // We will validate against the CURRENT implementation structure but keep the spirit of the spec rules (ranges 0-10)

        // Spec requirements says 'executives array', but current MVP stores:
        // { current_Vision: 5, target_Vision: 8, ... }
        // We will validate the numeric ranges of these flat fields.

        const DIMENSIONS = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];

        DIMENSIONS.forEach(dim => {
            const current = data[`current_${dim}`];
            const target = data[`target_${dim}`];

            if (current === undefined) {
                issues.push({ code: 'LDR-REQ-001', message: `Missing current ${dim} score`, path: `current_${dim}`, severity: 'error' });
            } else if (current < 0 || current > 10) {
                issues.push({ code: 'LDR-VAL-001', message: `Current ${dim} score out of range (0-10)`, path: `current_${dim}`, severity: 'error' });
            }

            if (target === undefined) {
                issues.push({ code: 'LDR-REQ-002', message: `Missing target ${dim} score`, path: `target_${dim}`, severity: 'error' });
            } else if (target < 0 || target > 10) {
                issues.push({ code: 'LDR-VAL-002', message: `Target ${dim} score out of range (0-10)`, path: `target_${dim}`, severity: 'error' });
            }
        });

        return issues;
    }
};

// E3. Business Emotional Intelligence
export const beiProfile: ToolValidationProfile = {
    id: 'bei_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.entries || !Array.isArray(data.entries)) {
            // Optional tool, so empty is fine, but if present must be array
            if (data.entries) issues.push({ code: 'BEI-REQ-001', message: 'Entries must be an array', path: 'entries', severity: 'error' });
            return issues;
        }

        const seenDates = new Set<string>();
        data.entries.forEach((entry: any, idx: number) => {
            if (!entry.date) issues.push({ code: 'BEI-REQ-002', message: 'Missing date', path: `entries[${idx}]`, severity: 'error' });

            if (seenDates.has(entry.date)) {
                issues.push({ code: 'BEI-DUP-001', message: 'Duplicate date entry', path: `entries[${idx}]`, severity: 'warn' });
            }
            seenDates.add(entry.date);

            if (entry.dimensions && Array.isArray(entry.dimensions)) {
                entry.dimensions.forEach((dim: any, dIdx: number) => {
                    if (dim.score === undefined || dim.score < 0 || dim.score > 10) {
                        issues.push({ code: 'BEI-VAL-001', message: 'Score out of range or missing', path: `entries[${idx}].dimensions[${dIdx}]`, severity: 'error' });
                    }
                });
            }
        });

        return issues;
    }
};
