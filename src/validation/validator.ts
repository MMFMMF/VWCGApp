import type { ValidationResult, ValidationIssue } from './types.ts';
import { ValidationProfiles } from './types.ts';
import { getTools } from '../registry/ToolRegistry.ts'; // We will need to update registry to expose profile IDs

export const validateWorkspace = (workspace: any): ValidationResult => {
    const issues: ValidationIssue[] = [];

    // L0: Structural Validation (Global)
    if (!workspace || typeof workspace !== 'object') {
        return { status: 'error', issues: [{ code: 'STRUCT-001', message: 'Invalid JSON structure', path: 'root', severity: 'error' }] };
    }

    if (!workspace.metadata) {
        issues.push({ code: 'META-REQ-001', message: 'Missing metadata section', path: 'metadata', severity: 'error' });
    }

    if (!workspace.tools) {
        issues.push({ code: 'TOOLS-REQ-001', message: 'Missing tools section', path: 'tools', severity: 'error' });
    }

    // Stop if structural failure
    if (issues.some(i => i.severity === 'error')) {
        return { status: 'error', issues };
    }

    // L1/L2: Per-Tool Validation
    // Iterate over all REGISTERED tools to check if they exist in workspace and validate them
    const registeredTools = getTools();

    for (const toolDef of registeredTools) {
        const toolData = workspace.tools[toolDef.id];

        // If tool data is missing, checking if it's strictly required is up to business logic, 
        // but generally missing tools are allowed (just means not started).
        // However, if present, it MUST run validation.

        if (toolData) {
            // Retrieve profile from registry definition
            // NOTE: We need to update ToolRegistry to include 'validationProfileId'
            if (toolDef.validationProfileId) {
                const profile = ValidationProfiles[toolDef.validationProfileId];
                if (profile) {
                    const toolIssues = profile.validate(toolData);
                    // Prefix paths
                    issues.push(...toolIssues.map(i => ({
                        ...i,
                        path: `tools.${toolDef.id}.${i.path}`
                    })));
                } else {
                    console.warn(`Validation profile ${toolDef.validationProfileId} not found for tool ${toolDef.id}`);
                }
            }
        }
    }

    // Determine aggregate status
    const status = issues.some(i => i.severity === 'error') ? 'error'
        : issues.length > 0 ? 'warn'
            : 'ok';

    return { status, issues };
};
