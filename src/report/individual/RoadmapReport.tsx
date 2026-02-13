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

function buildPhasedItem(task: RoadmapTask, phase: 'stabilize' | 'build' | 'launch'): PhasedItem {
  const ownerRole = task.owner || 'Leadership Team';

  let whyNow: string;
  let successOutcome: string;

  switch (phase) {
    case 'stabilize':
      whyNow = 'Foundation must be solid before building new capabilities. Skipping stabilization creates compounding risk.';
      successOutcome = `${task.title} completed with documented process and clear ownership established.`;
      break;
    case 'build':
      whyNow = 'With foundations stabilized, the organization can invest in capability development without constant firefighting.';
      successOutcome = `${task.title} operational and integrated into existing workflows with measurable improvement visible.`;
      break;
    case 'launch':
      whyNow = 'Stabilized foundation and new capabilities create the conditions for successful initiatives.';
      successOutcome = `${task.title} launched with clear metrics, stakeholder buy-in, and supporting infrastructure in place.`;
      break;
  }

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
  _businessContext: BusinessContextData | undefined
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
  if (metrics.strategicCoherence === 'misaligned') {
    items.push({
      title: 'New Product Lines',
      rationale: `Strategic coherence analysis shows misalignment between vision, capabilities, and current priorities. Adding new product lines would dilute focus further and compound the alignment problem. Resolve the existing strategic contradictions before expanding the portfolio.`,
    });
  }

  // Default fallbacks if fewer than 2 items
  if (items.length < 2) {
    const defaults: ExcludedItem[] = [
      {
        title: 'Major Technology Platform Migration',
        rationale:
          'Platform migrations consume 6-12 months of organizational bandwidth and carry significant operational risk. Within a 90-day horizon, the focus should be on maximizing value from existing tools while planning migration for the next planning cycle.',
      },
      {
        title: 'Organizational Restructuring',
        rationale:
          'Restructuring creates uncertainty and productivity loss that undermines execution. The 90-day window is better used to stabilize operations and build trust, creating the conditions for successful structural change in the future.',
      },
      {
        title: 'Large-Scale Hiring Campaigns',
        rationale:
          'Scaling headcount before processes and systems are documented creates chaos. New hires amplify whatever culture and operations currently exist — if the foundation is unstable, more people accelerate problems rather than solving them.',
      },
    ];

    for (const fallback of defaults) {
      if (items.length >= 3) break;
      // Avoid duplicating topics
      if (!items.some((existing) => existing.title === fallback.title)) {
        items.push(fallback);
      }
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
  if (metrics.strategicCoherence === 'misaligned') {
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
  const businessContext = tools['business-context'] as BusinessContextData | undefined;

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
    .map((c) => buildPhasedItem(c.task, 'stabilize'));

  const buildTasks = categorized
    .filter((c) => c.phase === 'build')
    .slice(0, 2)
    .map((c) => buildPhasedItem(c.task, 'build'));

  const launchTasks = categorized
    .filter((c) => c.phase === 'launch')
    .slice(0, 2)
    .map((c) => buildPhasedItem(c.task, 'launch'));

  // If any phase has no tasks, pull overflow from other phases
  const allPhasedItems = [...stabilizeTasks, ...buildTasks, ...launchTasks];
  const remainingTasks = categorized.filter(
    (c) => !allPhasedItems.some((pi) => pi.title === c.task.title)
  );

  if (stabilizeTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      stabilizeTasks.push(buildPhasedItem(overflow.task, 'stabilize'));
    }
  }
  if (buildTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      buildTasks.push(buildPhasedItem(overflow.task, 'build'));
    }
  }
  if (launchTasks.length === 0 && remainingTasks.length > 0) {
    const overflow = remainingTasks.shift();
    if (overflow) {
      launchTasks.push(buildPhasedItem(overflow.task, 'launch'));
    }
  }

  // Build excluded items
  const excludedItems = buildExcludedItems(aiReadiness, metrics, businessContext);

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
