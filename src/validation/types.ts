export type ValidationStatus = 'ok' | 'warn' | 'error';
// Force reload v3

export interface ValidationIssue {
    code: string;
    message: string;
    path: string; // e.g. "tools.swot.data.items[0]"
    severity: 'warn' | 'error';
}

export interface ValidationResult {
    status: ValidationStatus;
    issues: ValidationIssue[];
}

export interface ToolValidationProfile {
    id: string; // e.g. "swot_v1"
    validate: (data: any) => ValidationIssue[];
}

// Registry of all profiles
export const ValidationProfiles: Record<string, ToolValidationProfile> = {};

export const registerProfile = (profile: ToolValidationProfile) => {
    ValidationProfiles[profile.id] = profile;
};
