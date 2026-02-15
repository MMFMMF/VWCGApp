export type { ValidationIssue, ValidationResult, ToolValidationProfile, ValidationStatus } from './types.ts';
import { ValidationProfiles, registerProfile } from './types.ts';
export { ValidationProfiles, registerProfile };
import { aiReadinessProfile, leadershipDnaProfile, beiProfile } from './profiles_p1.ts';
import { visionCanvasProfile, swotProfile, sopTaxonomyProfile, sopCreationProfile, sopManagementProfile } from './profiles_p2.ts';
import { roadmapProfile, advisorProfile } from './profiles_p3.ts';

export const initializeValidation = () => {
    registerProfile(aiReadinessProfile);
    registerProfile(leadershipDnaProfile);
    registerProfile(beiProfile);
    registerProfile(visionCanvasProfile);
    registerProfile(swotProfile);
    registerProfile(sopTaxonomyProfile);
    registerProfile(sopCreationProfile);
    registerProfile(sopManagementProfile);
    registerProfile(roadmapProfile);
    registerProfile(advisorProfile);
};
