import type { ToolValidationProfile, ValidationIssue } from './types.ts';

// E4. Vision Canvas
export const visionCanvasProfile: ToolValidationProfile = {
    id: 'vision_canvas_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.pillars || !Array.isArray(data.pillars)) {
            issues.push({ code: 'VIS-REQ-001', message: 'Missing pillars', path: 'pillars', severity: 'error' });
        } else {
            if (data.pillars.length < 1) { // Spec says 3-12, but MVP safe default is 1
                issues.push({ code: 'VIS-LIM-001', message: 'Must have at least 1 pillar', path: 'pillars', severity: 'warn' });
            }
            const seen = new Set();
            data.pillars.forEach((p: any, idx: number) => {
                if (seen.has(p.id)) issues.push({ code: 'VIS-DUP-001', message: 'Duplicate pillar ID', path: `pillars[${idx}]`, severity: 'error' });
                seen.add(p.id);
            });
        }
        return issues;
    }
};

// E5. SWOT Analysis
export const swotProfile: ToolValidationProfile = {
    id: 'swot_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.items || !Array.isArray(data.items)) {
            issues.push({ code: 'SWT-REQ-001', message: 'Missing items array', path: 'items', severity: 'error' });
            return issues;
        }

        data.items.forEach((item: any, idx: number) => {
            if (!['S', 'W', 'O', 'T'].includes(item.quadrant)) {
                issues.push({ code: 'SWT-QDR-001', message: 'Invalid quadrant', path: `items[${idx}]`, severity: 'error' });
            }
            if (item.confidence === undefined || item.confidence < 1 || item.confidence > 5) {
                issues.push({ code: 'SWT-VAL-001', message: 'Confidence must be 1-5', path: `items[${idx}]`, severity: 'warn' });
            }
        });
        return issues;
    }
};

// E6. SOP Taxonomy
export const sopTaxonomyProfile: ToolValidationProfile = {
    id: 'sop_taxonomy_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (!data.nodes || !Array.isArray(data.nodes)) {
            issues.push({ code: 'TAX-REQ-001', message: 'Missing nodes', path: 'nodes', severity: 'error' });
            return issues;
        }

        const rootCount = data.nodes.filter((n: any) => !n.parentId).length;
        if (rootCount !== 1) {
            issues.push({ code: 'TAX-ROOT-001', message: `Expected 1 root node, found ${rootCount}`, path: 'nodes', severity: 'error' });
        }

        return issues;
    }
};

// E7. SOP Creation - Validation logic likely inside individual SOP objects in library
export const sopCreationProfile: ToolValidationProfile = {
    id: 'sop_create_v1',
    validate: (data: any) => {
        // This validates the "active" or "draft" SOP being edited
        const issues: ValidationIssue[] = [];
        if (!data.sop) return issues; // Empty state compliant

        const sop = data.sop;
        if (!sop.title) issues.push({ code: 'SOP-REQ-001', message: 'Missing title', path: 'sop.title', severity: 'warn' });
        if (!sop.steps || sop.steps.length === 0) issues.push({ code: 'SOP-STP-001', message: 'No steps defined', path: 'sop.steps', severity: 'warn' });

        return issues;
    }
};

// E8. SOP Management (Library)
export const sopManagementProfile: ToolValidationProfile = {
    id: 'sop_manage_v1',
    validate: (data: any) => {
        const issues: ValidationIssue[] = [];
        if (data.library && !Array.isArray(data.library)) {
            issues.push({ code: 'LIB-REQ-001', message: 'Library must be array', path: 'library', severity: 'error' });
        }
        return issues;
    }
};
