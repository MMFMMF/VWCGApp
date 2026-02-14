/**
 * 90-Day Roadmap Individual Report (RDM-01 through RDM-04)
 *
 * Consulting-grade strategic roadmap report with phased execution plan,
 * sequencing rationale, and deliberate exclusion analysis.
 *
 * Pages:
 *   RDM-01  Cover page
 *   RDM-02  Roadmap Philosophy (sequencing rationale)
 *   RDM-03  Simplified Roadmap (3-phase layout: Stabilize, Build, Launch)
 *   RDM-04  What's Not on This Roadmap (And Why)
 */

import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics, runSynthesis } from '@/engine';
import {
  ReportPage,
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCallout,
} from '@/report/components';
import { REPORT_COLORS } from '@/report/design';
import type { DerivedMetrics } from '@/engine/derived-metrics.ts';
import type { Insight } from '@/engine/types.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoadmapTask {
  title: string;
  owner?: string;
  description?: string;
  phase?: string;
}

interface AiReadinessData {
  Strategy: number;
  Data: number;
  Infrastructure: number;
  Talent: number;
  Governance: number;
  Culture: number;
}

interface BusinessContextData {
  revenueRange?: string;
  industry?: string;
  employeeCount?: number;
  founderHours?: number;
  yearsInBusiness?: number;
  growthGoal?: string;
}

interface PhasedItem {
  title: string;
  whyNow: string;
  ownerRole: string;
  successOutcome: string;
}

interface ExcludedItem {
  title: string;
  rationale: string;
}

// ---------------------------------------------------------------------------
// Helper: Categorize tasks into phases
// ---------------------------------------------------------------------------

const STABILIZE_KEYWORDS = [
  'fix',
  'repair',
  'stabilize',
  'document',
  'process',
  'sop',
  'audit',
  'review',
  'clean',
  'organize',
  'assess',
  'baseline',
  'foundation',
  'compliance',
  'policy',
  'security',
  'backup',
  'recover',
  'standardize',
  'consolidate',
];

const BUILD_KEYWORDS = [
  'build',
  'create',
  'develop',
  'train',
  'hire',
  'implement',
  'design',
  'establish',
  'integrate',
  'automate',
  'upgrade',
  'improve',
  'optimize',
  'restructure',
  'capability',
  'system',
  'framework',
  'platform',
  'pipeline',
  'onboard',
];

const LAUNCH_KEYWORDS = [
  'launch',
  'deploy',
  'release',
  'scale',
  'expand',
  'partner',
  'market',
  'campaign',
  'initiative',
  'pilot',
  'rollout',
  'go-live',
  'announce',
  'grow',
  'enter',
  'open',
  'acquire',
  'revenue',
  'product',
  'service',
];

function categorizeTask(task: RoadmapTask): 'stabilize' | 'build' | 'launch' {
  // If a phase is explicitly set, use it
  if (task.phase) {
    const phaseLower = task.phase.toLowerCase();
    if (phaseLower.includes('stabilize') || phaseLower === '1' || phaseLower.includes('phase 1')) {
      return 'stabilize';
    }
    if (phaseLower.includes('build') || phaseLower === '2' || phaseLower.includes('phase 2')) {
      return 'build';
    }
    if (phaseLower.includes('launch') || phaseLower === '3' || phaseLower.includes('phase 3')) {
      return 'launch';
    }
  }

  const textToCheck = `${task.title || ''} ${task.description || ''}`.toLowerCase();

  // Score each category
  const stabilizeScore = STABILIZE_KEYWORDS.filter((kw) => textToCheck.includes(kw)).length;
  const buildScore = BUILD_KEYWORDS.filter((kw) => textToCheck.includes(kw)).length;
  const launchScore = LAUNCH_KEYWORDS.filter((kw) => textToCheck.includes(kw)).length;

  if (stabilizeScore >= buildScore && stabilizeScore >= launchScore) return 'stabilize';
  if (buildScore >= launchScore) return 'build';
  return 'launch';
}

// Task category mapping for assessment-aware Why Now and Success Criteria
const TASK_CATEGORY_MAP: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /crm|salesforce|hubspot|migration/i, category: 'technology_migration' },
  { pattern: /hire|recruit|staff|engineer|developer|talent/i, category: 'hiring' },
  { pattern: /soc2|compliance|audit|security|insurance|legal|policy/i, category: 'compliance' },
  { pattern: /marketing|rebrand|campaign|brand/i, category: 'marketing' },
  { pattern: /training|safety|certification/i, category: 'training' },
  { pattern: /office|relocation|facilities|move/i, category: 'facilities' },
  { pattern: /event|appreciation|client.*event/i, category: 'event' },
  { pattern: /platform|product|v2|release|\bapp\b|dashboard|portal/i, category: 'product_launch' },
  { pattern: /service line|expansion|new.*service/i, category: 'new_offering' },
  { pattern: /forklift|equipment|fleet|upgrade|replace/i, category: 'equipment' },
  { pattern: /pilot|enterprise|partnership/i, category: 'market_expansion' },
  { pattern: /process|sop|document|standard/i, category: 'process' },
];

function detectTaskCategory(title: string): string {
  const match = TASK_CATEGORY_MAP.find(m => m.pattern.test(title));
  return match?.category ?? 'general';
}

/** Generate task-specific Why Now referencing assessment data */
function generateWhyNow(
  task: RoadmapTask,
  phase: 'stabilize' | 'build' | 'launch',
  metrics: DerivedMetrics,
  workspace: { tools: Record<string, any> },
): string {
  const category = detectTaskCategory(task.title);
  const fdi = metrics.founderDependencyIndex;
  const ear = metrics.executionAmbitionRatio;
  const coherence = metrics.strategicCoherence.replace(/_/g, ' ');
  const aiReadiness = workspace.tools?.['ai-readiness'] as AiReadinessData | undefined;
  const swot = workspace.tools?.swot;
  const weaknesses = (swot?.weaknesses as Array<{ text?: string }>) ?? [];
  const weaknessText = weaknesses.map(w => w.text ?? '').join(' ').toLowerCase();

  // Category-specific rationale with assessment data
  switch (category) {
    case 'technology_migration':
      return `Your AI Readiness data score is ${aiReadiness?.Data ?? 'not assessed'}% and ${weaknessText.includes('data') || weaknessText.includes('crm') ? 'your SWOT analysis flagged data fragmentation as a weakness' : 'data infrastructure gaps limit downstream initiatives'}. ${task.title} creates the information foundation every Phase 2 and 3 initiative depends on.`;
    case 'hiring':
      if (fdi > 5) {
        return `With a Founder Dependency Index of ${fdi.toFixed(1)}/10, key decisions still route through one person. ${task.title} creates the delegation capacity needed to ${phase === 'stabilize' ? 'stop the operational bottleneck your assessment flags' : 'execute the strategic initiatives in your roadmap'}.`;
      }
      if (fdi > 3) {
        return `Your Founder Dependency Index of ${fdi.toFixed(1)}/10 shows moderate key-person concentration. ${task.title} adds capacity to ${phase === 'stabilize' ? 'distribute operational load and reduce single-point-of-failure risk' : 'support the execution bandwidth your strategic initiatives require'}.`;
      }
      return `With a Founder Dependency Index of ${fdi.toFixed(1)}/10, the organization already distributes decisions well. ${task.title} is about adding specialized capability — your Organizational Readiness score of ${metrics.organizationalReadinessScore}/100 indicates the team ${metrics.organizationalReadinessScore >= 60 ? 'can absorb new hires effectively' : 'will need structured onboarding to integrate new talent without disruption'}.`;
    case 'compliance':
      return `${task.title} is a prerequisite for the growth initiatives in later phases. ${ear < 0.7 ? `Your Execution-Ambition Ratio of ${ear.toFixed(2)} means the organization is already stretched — compliance gaps compound this risk.` : `Your operational maturity needs this foundation before scaling.`}`;
    case 'marketing':
      return `Strategic coherence is "${coherence}" — ${task.title} ${coherence === 'aligned' || coherence === 'mostly aligned' ? 'leverages your strategic clarity to drive market awareness' : 'must be tightly aligned with vision pillars to avoid diluting an already fragmented strategy'}.`;
    case 'training':
      return `${task.title} builds organizational capability. ${fdi > 5 ? `With Founder Dependency at ${fdi.toFixed(1)}/10, investing in team skills reduces single-person risk.` : `Your Organizational Readiness score of ${metrics.organizationalReadinessScore}/100 indicates the team ${metrics.organizationalReadinessScore >= 60 ? 'is ready to absorb new capabilities' : 'needs structured development to execute strategic priorities'}.`}`;
    case 'facilities':
      return `${task.title} affects every employee daily. ${metrics.organizationalReadinessScore < 50 ? `With Organizational Readiness at ${metrics.organizationalReadinessScore}/100, minimizing disruption is critical — the team cannot absorb simultaneous operational and environmental change.` : 'Execute this during the stabilization window before strategic initiatives demand full organizational attention.'}`;
    case 'product_launch': {
      const avgAi = aiReadiness
        ? Math.round(Object.values(aiReadiness as unknown as Record<string, number>)
            .filter((v): v is number => typeof v === 'number')
            .reduce((s, v) => s + v, 0) / 6)
        : null;
      if (avgAi !== null && avgAi < 50) {
        return `Your AI Readiness averages ${avgAi}% — launching ${task.title} without addressing infrastructure and data gaps (Data: ${aiReadiness?.Data ?? 'N/A'}%, Infrastructure: ${aiReadiness?.Infrastructure ?? 'N/A'}%) risks a failed rollout. Sequence technology foundations before launch.`;
      }
      if (ear < 0.7) {
        return `Your Execution-Ambition Ratio of ${ear.toFixed(2)} means the organization is stretched thinner than it can sustain. ${task.title} must wait until Phase 1 stabilization frees capacity — launching now risks both the product and existing operations.`;
      }
      return `${task.title} is sequenced for Phase 3 because your Organizational Readiness score of ${metrics.organizationalReadinessScore}/100 (${metrics.organizationalReadinessLabel}) ${metrics.organizationalReadinessScore >= 60 ? 'supports the change load, but only after operational stability is confirmed' : 'indicates the team cannot absorb a launch alongside active process improvements'}. ${fdi > 5 ? `Founder Dependency at ${fdi.toFixed(1)}/10 adds execution risk until delegation improves.` : ''}`;
    }
    case 'event':
      return `${task.title} is a relationship investment. ${weaknessText.includes('client') || weaknessText.includes('retention') ? 'Your SWOT analysis flagged client relationship concerns — this addresses them directly.' : `With your revenue at risk estimated at $${Math.round(metrics.revenueRiskEstimate.low / 1000)}K-$${Math.round(metrics.revenueRiskEstimate.high / 1000)}K, strengthening client relationships protects existing revenue.`}`;
    case 'new_offering':
      return `Strategic coherence is "${coherence}" — ${coherence === 'aligned' || coherence === 'mostly aligned' ? `${task.title} extends your strategic pillars into a new revenue stream` : `resolve the strategic alignment gaps (currently ${coherence}) before ${task.title} to prevent dilution`}. ${ear < 0.7 ? `Execution capacity (EAR: ${ear.toFixed(2)}) must improve first.` : ''}`;
    case 'equipment':
      return `${task.title} is a safety and efficiency priority. ${fdi > 5 ? `With Founder Dependency at ${fdi.toFixed(1)}/10, these operational decisions still land on your desk — resolving this creates delegation space.` : 'Completing operational improvements now prevents them from competing with strategic initiatives for attention.'}`;
    case 'market_expansion':
      return `${task.title} requires the strategic clarity and operational capacity built in earlier phases. ${coherence === 'misaligned' || coherence === 'severely misaligned' ? `Current strategic coherence is "${coherence}" — expanding into new markets amplifies existing misalignment.` : `With coherence at "${coherence}" and EAR at ${ear.toFixed(2)}, the organization has the foundation for controlled expansion.`}`;
    case 'process':
      return `${task.title} reduces the organizational risk your assessment data flags. ${fdi > 5 ? `Founder Dependency Index of ${fdi.toFixed(1)}/10 means undocumented processes create key-person risk.` : `Formalizing this process improves the operational maturity that supports every subsequent initiative.`}`;
    default:
      break;
  }

  // Fallback: phase-specific with metrics
  if (phase === 'stabilize') {
    return `${task.title} is a stabilization priority. ${fdi > 5 ? `Your Founder Dependency Index of ${fdi.toFixed(1)}/10 means completing this now frees capacity for strategic work in Phases 2 and 3.` : `With an Execution-Ambition Ratio of ${ear.toFixed(2)}, stabilizing this area before expanding scope prevents operational overload.`}`;
  }
  if (phase === 'build') {
    return `${task.title} builds on the stabilized foundation. ${ear < 0.7 ? `Your EAR of ${ear.toFixed(2)} indicates the organization is stretched — this capability investment improves execution capacity.` : `Organizational Readiness at ${metrics.organizationalReadinessScore}/100 supports this level of change investment.`}`;
  }
  return `${task.title} launches after Phase 1 and 2 lay the groundwork. ${metrics.organizationalReadinessScore >= 60 ? `Readiness score of ${metrics.organizationalReadinessScore}/100 indicates the team can absorb this initiative.` : `Readiness at ${metrics.organizationalReadinessScore}/100 means careful change management is needed.`}`;
}

/** Generate task-specific, measurable success criteria */
function generateSuccessCriteria(task: RoadmapTask): string {
  const category = detectTaskCategory(task.title);

  switch (category) {
    case 'technology_migration':
      return `${task.title} fully migrated with 100% of active records transferred, all users trained, and first automated report generated within the phase timeline.`;
    case 'hiring':
      return `All new hires onboarded and contributing to assigned work within 2 weeks of start date. Role-specific KPIs defined and first performance check-in completed.`;
    case 'compliance':
      return `${task.title} completed with zero critical findings. Compliance documentation published to shared drive and review cadence established.`;
    case 'marketing':
      return `${task.title} launched with baseline metrics established (website traffic, lead volume, brand awareness). 30-day post-launch performance report delivered.`;
    case 'training':
      return `100% of eligible team members completed ${task.title}. Certification records filed and knowledge assessment scores averaging 80%+.`;
    case 'facilities':
      return `${task.title} completed with zero service disruption, all employees transitioned, and post-move satisfaction survey achieving 80%+ positive rating.`;
    case 'product_launch':
      return `${task.title} live with launch metrics defined, first 30-day usage data collected, and iteration plan created based on user feedback.`;
    case 'event':
      return `${task.title} executed with 60%+ target attendee participation. Post-event survey completed and follow-up actions scheduled within 1 week.`;
    case 'new_offering':
      return `${task.title} market-tested with at least 3 pilot clients. Revenue forecast model built and go/no-go decision documented.`;
    case 'equipment':
      return `${task.title} completed with all operators certified on new equipment. Safety baseline established and efficiency metrics tracked for 30-day comparison.`;
    case 'market_expansion':
      return `${task.title} launched with defined success metrics, first 3 qualified prospects identified, and monthly progress review cadence established.`;
    case 'process':
      return `${task.title} documented, reviewed by stakeholders, and published. Process owner assigned and first adherence check scheduled within 30 days.`;
    default:
      return `${task.title} completed with documented outcomes, clear ownership assigned, and measurable success metrics defined for 30-day review.`;
  }
}

function buildPhasedItem(
  task: RoadmapTask,
  phase: 'stabilize' | 'build' | 'launch',
  metrics: DerivedMetrics,
  workspace: { tools: Record<string, any> },
): PhasedItem {
  const ownerRole = task.owner || 'Leadership Team';
  const whyNow = generateWhyNow(task, phase, metrics, workspace);
  const successOutcome = generateSuccessCriteria(task);

  return {
    title: task.title,
    whyNow,
    ownerRole,
    successOutcome,
  };
}

// ---------------------------------------------------------------------------
// Helper: Excluded items
// ---------------------------------------------------------------------------

function buildExcludedItems(
  aiReadiness: AiReadinessData | undefined,
  metrics: DerivedMetrics,
  workspace: { tools: Record<string, any> },
): ExcludedItem[] {
  const items: ExcludedItem[] = [];

  // Check AI readiness
  if (aiReadiness) {
    const aiValues = [
      aiReadiness.Strategy,
      aiReadiness.Data,
      aiReadiness.Infrastructure,
      aiReadiness.Talent,
      aiReadiness.Governance,
      aiReadiness.Culture,
    ].filter((v): v is number => typeof v === 'number');

    const avgAiReadiness =
      aiValues.length > 0
        ? aiValues.reduce((a, b) => a + b, 0) / aiValues.length
        : 50;

    if (avgAiReadiness < 40) {
      items.push({
        title: 'AI/ML Initiatives',
        rationale: `Your AI readiness score averages ${Math.round(avgAiReadiness)}%. Deploying AI solutions before addressing data infrastructure (${aiReadiness.Data ?? 'N/A'}%), talent gaps (${aiReadiness.Talent ?? 'N/A'}%), and governance frameworks (${aiReadiness.Governance ?? 'N/A'}%) would result in failed implementations and wasted investment. Build the foundation first.`,
      });
    }
  }

  // Check founder dependency
  if (metrics.founderDependencyIndex > 6) {
    items.push({
      title: 'Geographic Expansion',
      rationale: `With a Founder Dependency Index of ${metrics.founderDependencyIndex.toFixed(1)}, expanding geography before building autonomous teams multiplies risk. Each new location requires independent decision-making capacity that does not yet exist in the organization.`,
    });
  }

  // Check strategic coherence
  if (metrics.strategicCoherence === 'misaligned' || metrics.strategicCoherence === 'severely_misaligned') {
    items.push({
      title: 'New Product Lines',
      rationale: `Strategic coherence analysis shows ${metrics.strategicCoherence === 'severely_misaligned' ? 'severe' : ''} misalignment between vision, capabilities, and current priorities. Adding new product lines would dilute focus further and compound the alignment problem. Resolve the existing strategic contradictions before expanding the portfolio.`,
    });
  }

  // Data-driven fallbacks with assessment references (not generic)
  if (items.length < 2) {
    const businessCtx = workspace.tools?.['business-context'] as BusinessContextData | undefined;
    const industry = businessCtx?.industry ?? 'your industry';
    const employees = businessCtx?.employeeCount ?? 0;
    const swot = workspace.tools?.swot;
    const opportunities = (swot?.opportunities as Array<{ text?: string }>) ?? [];

    // Generate persona-specific Not Now items based on what they COULD do but shouldn't yet
    if (employees > 50 && !items.some(i => i.title.includes('Restructuring'))) {
      items.push({
        title: 'Organizational Restructuring',
        rationale: `With ${employees} employees and an Organizational Readiness score of ${metrics.organizationalReadinessScore}/100, restructuring would create uncertainty that undermines the 90-day execution plan. Stabilize operations first, then restructure from a position of strength.`,
      });
    }

    if (opportunities.length > 2 && !items.some(i => i.title.includes('Opportunity'))) {
      const cited = opportunities[0]?.text ?? 'an identified opportunity';
      items.push({
        title: 'Pursuing All SWOT Opportunities Simultaneously',
        rationale: `Your SWOT analysis identified ${opportunities.length} opportunities including "${cited}." With an Execution-Ambition Ratio of ${metrics.executionAmbitionRatio.toFixed(2)}, pursuing multiple opportunities within 90 days risks executing none of them well. Sequence them across future quarters.`,
      });
    }

    if (!items.some(i => i.title.includes('Platform') || i.title.includes('Migration'))) {
      items.push({
        title: 'Major Technology Platform Migration',
        rationale: `Platform migrations in ${industry} consume 6-12 months of bandwidth. With current operational maturity and a Founder Dependency Index of ${metrics.founderDependencyIndex.toFixed(1)}/10, a major migration would overwhelm the 90-day stabilization timeline.`,
      });
    }

    if (items.length < 3 && !items.some(i => i.title.includes('Hiring'))) {
      items.push({
        title: 'Large-Scale Hiring Campaign',
        rationale: `Adding headcount before processes are documented and delegation patterns are established (FDI: ${metrics.founderDependencyIndex.toFixed(1)}/10) amplifies existing operational gaps. Build the infrastructure first, then hire into it.`,
      });
    }
  }

  return items.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Helper: Philosophy context note
// ---------------------------------------------------------------------------

function buildPhilosophyContextNote(insights: Insight[], metrics: DerivedMetrics): string | null {
  // Check for execution crisis in insights
  const hasExecutionCrisis = insights.some(
    (i) =>
      i.severity === 'high' &&
      (i.title.toLowerCase().includes('execution') ||
        i.message.toLowerCase().includes('execution gap') ||
        i.message.toLowerCase().includes('execution crisis'))
  );

  if (hasExecutionCrisis) {
    return 'Your assessment data shows execution as the dominant gap — this roadmap prioritizes stabilization above all else.';
  }

  // Check for high founder dependency
  if (metrics.founderDependencyIndex > 7) {
    return `Your Founder Dependency Index of ${metrics.founderDependencyIndex.toFixed(1)} indicates the organization cannot execute independently. This roadmap front-loads delegation and team empowerment before any growth initiatives.`;
  }

  // Check for strategic misalignment
  if (metrics.strategicCoherence === 'misaligned' || metrics.strategicCoherence === 'severely_misaligned') {
    return 'Strategic coherence analysis reveals misalignment between your vision and operational reality. This roadmap prioritizes alignment before expansion.';
  }

  // Check execution-ambition ratio
  if (metrics.executionAmbitionRatio < 0.7) {
    return `Your Execution-Ambition Ratio of ${metrics.executionAmbitionRatio.toFixed(2)} indicates the organization is attempting more than it can reliably execute. This roadmap narrows focus to build execution capacity before expanding scope.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoadmapReport() {
  const tools = useWorkspaceStore((state) => state.tools);
  const metadata = useWorkspaceStore((state) => state.metadata);
  const insights = useWorkspaceStore((state) => state.insights);

  // Extract tool data
  const roadmapData = tools['roadmap'] as { tasks: RoadmapTask[] } | undefined;
  const aiReadiness = tools['ai-readiness'] as AiReadinessData | undefined;

  // Compute derived metrics
  const workspace = { tools, metadata, insights };
  const metrics: DerivedMetrics = computeDerivedMetrics(workspace);
  const resolvedInsights: Insight[] =
    insights.length > 0 ? insights : runSynthesis(workspace);

  const tasks = roadmapData?.tasks || [];

  // Categorize tasks into phases
  const categorized = tasks.map((task) => ({
    task,
    phase: categorizeTask(task),
  }));

  const stabilizeTasks = categorized
    .filter((c) => c.phase === 'stabilize')
    .slice(0, 2)
    .map((c) => buildPhasedItem(c.task, 'stabilize', metrics, workspace));

  const buildTasks = categorized
    .filter((c) => c.phase === 'build')
    .slice(0, 2)
    .map((c) => buildPhasedItem(c.task, 'build', metrics, workspace));

  const launchTasks = categorized
    .filter((c) => c.phase === 'launch')
    .slice(0, 2)
    .map((c) => buildPhasedItem(c.task, 'launch', metrics, workspace));

  // If any phase has no tasks, pull overflow from other phases
  const allPhasedItems = [...stabilizeTasks, ...buildTasks, ...launchTasks];
  const remainingTasks = categorized.filter(
    (c) => !allPhasedItems.some((pi) => pi.title === c.task.title)
  );

  if (stabilizeTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      stabilizeTasks.push(buildPhasedItem(overflow.task, 'stabilize', metrics, workspace));
    }
  }
  if (buildTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      buildTasks.push(buildPhasedItem(overflow.task, 'build', metrics, workspace));
    }
  }
  if (launchTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      launchTasks.push(buildPhasedItem(overflow.task, 'launch', metrics, workspace));
    }
  }

  // Build excluded items
  const excludedItems = buildExcludedItems(aiReadiness, metrics, workspace);

  // Philosophy context note
  const contextNote = buildPhilosophyContextNote(resolvedInsights, metrics);

  const clientName = metadata?.name || 'Your Organization';
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalItems = stabilizeTasks.length + buildTasks.length + launchTasks.length;

  return (
    <div className="space-y-0">
      {/* RDM-01: Cover Page */}
      <ReportPage variant="cover">
        <ReportHero className="text-white">90-Day Roadmap</ReportHero>
        <div className="text-xl text-white/80 font-light mt-4">{clientName}</div>
        <div className="text-sm text-white/60 mt-2">{reportDate}</div>
        <div className="text-base text-white/70 mt-8 max-w-md mx-auto leading-relaxed">
          Strategic execution plan with phased priorities
        </div>
      </ReportPage>

      {/* RDM-02: Roadmap Philosophy */}
      <ReportPage variant="standard" pageNumber={2}>
        <ReportSectionTitle>Roadmap Philosophy</ReportSectionTitle>

        <ReportBody className="mb-6">
          The most effective 90-day plans follow a natural progression: stabilize
          what is broken, build the capabilities you are missing, then launch new
          initiatives. Attempting step three before completing step one is the most
          common reason ambitious plans fail.
        </ReportBody>

        <ReportBody className="mb-6">
          This sequencing is not arbitrary. Organizations that skip stabilization
          and jump to growth initiatives consistently report higher failure rates,
          team burnout, and wasted investment. The foundation-first approach may
          feel slower initially, but it produces compounding returns as each phase
          builds on the one before it.
        </ReportBody>

        {contextNote && (
          <ReportCallout className="my-6">{contextNote}</ReportCallout>
        )}

        {/* Phase overview diagram */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-md" style={{ backgroundColor: `${REPORT_COLORS.red}15` }}>
            <div className="text-sm font-bold mb-1" style={{ color: REPORT_COLORS.red }}>
              Phase 1: Stabilize
            </div>
            <div className="text-xs text-report-gray">Weeks 1-4</div>
            <div className="text-xs text-report-charcoal mt-2">
              Fix foundations, document processes, establish baselines
            </div>
          </div>
          <div className="text-center p-4 rounded-md" style={{ backgroundColor: `${REPORT_COLORS.amber}15` }}>
            <div className="text-sm font-bold mb-1" style={{ color: REPORT_COLORS.amber }}>
              Phase 2: Build
            </div>
            <div className="text-xs text-report-gray">Weeks 5-8</div>
            <div className="text-xs text-report-charcoal mt-2">
              Develop capabilities, train teams, implement systems
            </div>
          </div>
          <div className="text-center p-4 rounded-md" style={{ backgroundColor: `${REPORT_COLORS.green}15` }}>
            <div className="text-sm font-bold mb-1" style={{ color: REPORT_COLORS.green }}>
              Phase 3: Launch
            </div>
            <div className="text-xs text-report-gray">Weeks 9-12</div>
            <div className="text-xs text-report-charcoal mt-2">
              Deploy initiatives, scale what works, measure outcomes
            </div>
          </div>
        </div>
      </ReportPage>

      {/* RDM-03: Simplified Roadmap */}
      <ReportPage variant="standard" pageNumber={3}>
        <ReportSectionTitle>Simplified Roadmap</ReportSectionTitle>

        {totalItems > 0 ? (
          <>
            <ReportBody className="mb-6">
              {totalItems} priority actions across three phases. Each action includes
              the strategic rationale, accountable owner, and definition of success.
            </ReportBody>

            {/* Phase 1: Stabilize */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: REPORT_COLORS.red }}
                />
                <ReportSubsection className="mb-0">
                  Stabilize (Weeks 1-4)
                </ReportSubsection>
              </div>
              {stabilizeTasks.length > 0 ? (
                <div className="space-y-4 ml-6">
                  {stabilizeTasks.map((item) => (
                    <PhaseItem key={item.title} item={item} phaseColor={REPORT_COLORS.red} />
                  ))}
                </div>
              ) : (
                <ReportBody className="ml-6 italic text-report-gray">
                  No stabilization tasks identified. If operations are already stable,
                  this phase can begin capability-building immediately.
                </ReportBody>
              )}
            </div>

            {/* Phase 2: Build */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: REPORT_COLORS.amber }}
                />
                <ReportSubsection className="mb-0">
                  Build (Weeks 5-8)
                </ReportSubsection>
              </div>
              {buildTasks.length > 0 ? (
                <div className="space-y-4 ml-6">
                  {buildTasks.map((item) => (
                    <PhaseItem key={item.title} item={item} phaseColor={REPORT_COLORS.amber} />
                  ))}
                </div>
              ) : (
                <ReportBody className="ml-6 italic text-report-gray">
                  No capability-building tasks identified. Consider adding development
                  activities that bridge the gap between current state and launch
                  requirements.
                </ReportBody>
              )}
            </div>

            {/* Phase 3: Launch */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: REPORT_COLORS.green }}
                />
                <ReportSubsection className="mb-0">
                  Launch (Weeks 9-12)
                </ReportSubsection>
              </div>
              {launchTasks.length > 0 ? (
                <div className="space-y-4 ml-6">
                  {launchTasks.map((item) => (
                    <PhaseItem key={item.title} item={item} phaseColor={REPORT_COLORS.green} />
                  ))}
                </div>
              ) : (
                <ReportBody className="ml-6 italic text-report-gray">
                  No launch tasks identified. This phase should include the
                  initiatives that the stabilization and build phases enable.
                </ReportBody>
              )}
            </div>
          </>
        ) : (
          <ReportBody className="italic text-report-gray">
            No roadmap tasks have been defined. Complete the 90-Day Roadmap tool to
            generate a phased execution plan.
          </ReportBody>
        )}
      </ReportPage>

      {/* RDM-04: What's Not on This Roadmap (And Why) */}
      <ReportPage variant="standard" pageNumber={4}>
        <ReportSectionTitle>
          What&apos;s Not on This Roadmap (And Why)
        </ReportSectionTitle>

        <ReportBody className="mb-6">
          Strategic discipline means knowing what not to do. The following
          initiatives were deliberately excluded from this 90-day plan — not because
          they lack merit, but because pursuing them now would undermine the
          foundation being built.
        </ReportBody>

        <div className="space-y-6">
          {excludedItems.map((item) => (
            <div
              key={item.title}
              className="border-l-4 pl-5 py-3"
              style={{ borderColor: REPORT_COLORS.gray }}
            >
              <div className="text-base font-semibold text-report-navy mb-2">
                {item.title}
              </div>
              <ReportBody>{item.rationale}</ReportBody>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-md bg-report-warm">
          <ReportBody className="font-medium">
            These exclusions should be revisited at the 90-day checkpoint. If the
            roadmap executes successfully, several of these items may become viable
            priorities for the next planning cycle.
          </ReportBody>
        </div>
      </ReportPage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Phase Item Card
// ---------------------------------------------------------------------------

interface PhaseItemProps {
  item: PhasedItem;
  phaseColor: string;
}

function PhaseItem({ item, phaseColor }: PhaseItemProps) {
  return (
    <div
      className="border rounded-md p-4"
      style={{ borderColor: `${phaseColor}40` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-semibold text-report-navy">{item.title}</div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-3"
          style={{
            backgroundColor: `${phaseColor}15`,
            color: phaseColor,
          }}
        >
          {item.ownerRole}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="text-xs">
          <span className="font-semibold text-report-charcoal">Why now: </span>
          <span className="text-report-gray">{item.whyNow}</span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-report-charcoal">Success: </span>
          <span className="text-report-gray">{item.successOutcome}</span>
        </div>
      </div>
    </div>
  );
}
