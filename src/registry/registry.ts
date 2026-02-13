import { registerTool } from './ToolRegistry';
import { aiReadinessDefinition } from '../tools/ai-readiness';
import { leadershipDnaDefinition } from '../tools/leadership-dna';
import { beiDefinition } from '../tools/emotional-intelligence';
import { visionCanvasDefinition } from '../tools/vision-canvas';
import { swotDefinition } from '../tools/swot';
import { sopTaxonomyDefinition, sopCreationDefinition, sopManagementDefinition } from '../tools/sop';
import { roadmapDefinition } from '../tools/roadmap';
import { advisorDefinition } from '../tools/advisor-readiness';
import { reportCenterDefinition } from '../tools/report';
import { businessContextDefinition } from '../tools/business-context';


export const initializeRegistry = () => {
    registerTool(aiReadinessDefinition);
    registerTool(leadershipDnaDefinition);
    registerTool(beiDefinition);
    registerTool(visionCanvasDefinition);
    registerTool(swotDefinition);
    registerTool(sopTaxonomyDefinition);
    registerTool(sopCreationDefinition);
    registerTool(sopManagementDefinition);
    registerTool(roadmapDefinition);
    registerTool(advisorDefinition);
    registerTool(reportCenterDefinition);
    registerTool(businessContextDefinition);
};
