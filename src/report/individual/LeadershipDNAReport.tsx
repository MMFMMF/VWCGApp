/**
 * Leadership DNA Individual Report
 *
 * Consulting-grade report covering:
 * LDR-01: Cover page
 * LDR-02: Leadership Profile with gap visualization
 * LDR-03: Gap Analysis with dimension-specific guidance
 * LDR-04: Leadership Archetype with famous comparisons
 */

import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics } from '@/engine/derived-metrics';
import { runSynthesis } from '@/engine/synthesis';
import {
  createNarrativeContext,
  generateMetricInterpretation,
} from '@/report/narrative';
import { ProgressBar } from '@/report/charts';
import {
  ReportPage,
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCaption,
  ReportCallout,
} from '@/report/components';
import { REPORT_COLORS } from '@/report/design';
import type { LeadershipArchetype } from '@/engine/derived-metrics';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIMENSIONS = [
  'Vision',
  'Execution',
  'Empowerment',
  'Decisiveness',
  'Adaptability',
  'Integrity',
] as const;

type Dimension = (typeof DIMENSIONS)[number];

interface DimensionGap {
  dimension: Dimension;
  current: number;
  target: number;
  gap: number;
}

// ---------------------------------------------------------------------------
// Gap explanation templates (dimension-specific)
// ---------------------------------------------------------------------------

const GAP_BEHIND: Record<Dimension, string> = {
  Vision:
    'Vague strategic direction creates decision paralysis across the organization. Teams lack a shared reference point for prioritization, so every decision escalates upward or defaults to the most vocal opinion.',
  Execution:
    'Tasks start but do not finish systematically. Initiatives launch with energy but stall without clear milestones, accountability structures, or follow-through mechanisms.',
  Empowerment:
    'Decisions bottleneck through the founder or a small leadership circle. Team members wait for permission rather than acting on their own judgment, which slows everything.',
  Decisiveness:
    'Delayed decisions cascade into missed opportunities and organizational drift. When leadership hesitates, teams fill the vacuum with conflicting assumptions.',
  Adaptability:
    'Rigid processes break under market shifts. The organization responds to change with resistance rather than recalibration, increasing the cost of every pivot.',
  Integrity:
    'Inconsistency between stated values and actions erodes trust. When team members observe a gap between what leadership says and what leadership does, engagement and retention suffer.',
};

const GAP_UNLOCKS: Record<Dimension, string> = {
  Vision:
    'Clear strategic direction reduces decision latency across the organization and aligns resource allocation with long-term goals.',
  Execution:
    'Systematic execution turns plans into results. Revenue targets move from aspirational to achievable when completion rates improve.',
  Empowerment:
    'Distributed decision-making frees leadership capacity for strategic work and accelerates the speed of front-line response.',
  Decisiveness:
    'Faster decisions shorten cycle times across every function. The organization captures opportunities while competitors are still deliberating.',
  Adaptability:
    'A flexible operating model absorbs market shocks without structural damage and positions the organization to capitalize on disruption.',
  Integrity:
    'Alignment between values and actions builds deep organizational trust, which drives retention, engagement, and willingness to go beyond minimum effort.',
};

const GAP_MICROSTEP: Record<Dimension, string> = {
  Vision:
    'Schedule a 60-minute session this week to draft a one-sentence North Star statement that every team member can repeat from memory.',
  Execution:
    'Pick one stalled initiative and define three concrete milestones with dates and owners before Friday.',
  Empowerment:
    'Identify one recurring decision you currently make personally and delegate it to a team member with clear decision criteria.',
  Decisiveness:
    'Set a 48-hour decision deadline for the oldest unresolved issue on your desk and communicate the outcome by end of week.',
  Adaptability:
    'Run a 30-minute "what-if" exercise with your team on one plausible market shift and identify two response options.',
  Integrity:
    'Ask two trusted team members to identify one area where your stated values do not match daily operations, and listen without defending.',
};

// ---------------------------------------------------------------------------
// Archetype templates
// ---------------------------------------------------------------------------

const ARCHETYPE_DESCRIPTIONS: Record<string, string[]> = {
  'The Visionary Builder': [
    'You see the destination with remarkable clarity. Your strategic instincts identify opportunities that others miss, and your conviction inspires early believers. This is a genuine competitive advantage -- organizations led by strong visionaries attract talent and capital that operational-first leaders cannot.',
    'The gap is in the machinery. Vision without systematic execution creates a pattern of brilliant starts and disappointing finishes. Your teams likely feel inspired but overwhelmed, unclear on how to translate your ambition into weekly action. The path forward is not less vision -- it is better infrastructure for turning vision into outcomes.',
  ],
  'The Trusted Operator': [
    'You deliver. When you commit to a timeline, teams trust it. Your operational discipline creates predictability that clients, investors, and employees value. In an era of overpromising, your reliability is a genuine differentiator.',
    'The risk is strategic stagnation. Operational excellence without bold strategic direction can optimize the organization into a local maximum -- highly efficient at doing the wrong things. The path forward is pairing your execution strength with strategic ambition, either by developing your own long-term planning capabilities or by partnering with a visionary co-leader.',
  ],
  'The Stretched Strategist': [
    'You carry the weight of both the vision and the daily grind. Your values and strategic clarity are strong, but operational demands consume the capacity you need for the work only you can do. This is the most common pattern among growth-stage founders.',
    'The danger is not burnout alone -- it is that your strategic gifts atrophy under operational load. Every hour spent on tasks someone else could handle is an hour not spent on direction-setting, relationship-building, and market positioning. The path forward is aggressive delegation of execution, even before it feels comfortable.',
  ],
  'The Collaborative Explorer': [
    'You build organizations where people want to work. Your combination of empowerment and adaptability creates teams that innovate without waiting for permission. In knowledge-economy businesses, this leadership style is a structural advantage for talent retention and creative output.',
    'The trade-off is decisiveness. Collaborative cultures sometimes avoid the hard calls because consensus feels safer than unilateral action. When the market demands speed, this hesitation becomes costly. The path forward is building decision frameworks that preserve your collaborative culture while adding the speed of clear accountability.',
  ],
  'The Command Driver': [
    'You make things happen through force of will and high standards. In early-stage companies and turnaround situations, this style produces results that consensus-driven leaders cannot match. Your decisiveness and execution give the organization velocity.',
    'The ceiling is your personal capacity. Command-driven organizations scale to the bandwidth of the leader and then plateau. The team learns to wait for your direction rather than develop their own judgment. The path forward is systematic delegation -- not of tasks, but of decision-making authority -- while maintaining the high standards that define your leadership.',
  ],
  'The Generalist Leader': [
    'Your leadership profile is notably balanced -- no dramatic peaks or valleys across the six dimensions. This equilibrium provides stability and reduces the risk of any single blind spot derailing the organization.',
    'The opportunity is strategic specialization. Balanced profiles sometimes reflect a leader who is good at everything but exceptional at nothing. Identify the one or two dimensions most critical to your next growth phase and invest disproportionately in developing them. A balanced foundation makes targeted development faster and more durable.',
  ],
  'The Hybrid Leader': [
    'Your leadership profile combines strengths that do not fit a single classical archetype. This is not a limitation -- many of the most effective leaders defy clean categorization. Your unique combination creates a leadership style that is difficult for competitors to replicate.',
    'The key is self-awareness about where your specific combination creates blind spots. Map your top two strengths against your bottom two, and build a team that compensates for the gaps. Your hybrid profile means generic leadership development programs will be less effective than targeted coaching on your specific pattern.',
  ],
};

const ARCHETYPE_COMPARISONS: Record<string, string> = {
  'The Visionary Builder':
    'Like Elon Musk or Steve Jobs -- big vision, needs operational partners to translate ambition into consistent execution.',
  'The Trusted Operator':
    'Like Tim Cook or Satya Nadella -- reliable execution, steady hand, transforms through disciplined operational excellence.',
  'The Stretched Strategist':
    'Like many growth-stage founders -- sees the path clearly but carries too much of the load personally.',
  'The Collaborative Explorer':
    'Like Ed Catmull or Reed Hastings -- empowers teams, iterates openly, builds cultures that attract top talent.',
  'The Command Driver':
    'Like Jeff Bezos (early Amazon) -- decisive control, high standards, velocity through clarity of command.',
  'The Generalist Leader':
    'Like Indra Nooyi -- balanced capabilities across dimensions, strategic flexibility, leads through breadth.',
  'The Hybrid Leader':
    'Like many modern CEOs navigating complexity -- unique combinations that defy textbook categorization.',
};

// ---------------------------------------------------------------------------
// Helper: extract dimension data from the leadership-dna tool
// ---------------------------------------------------------------------------

function extractDimensionGaps(
  dna: Record<string, number> | undefined
): DimensionGap[] {
  if (!dna) return [];
  return DIMENSIONS.map((dim) => ({
    dimension: dim,
    current: (dna[`current_${dim}`] ?? 5) as number,
    target: (dna[`target_${dim}`] ?? 8) as number,
    gap: ((dna[`target_${dim}`] ?? 8) - (dna[`current_${dim}`] ?? 5)) as number,
  }));
}

function getArchetypeDescriptions(archetypeName: string): string[] {
  return (
    ARCHETYPE_DESCRIPTIONS[archetypeName] ??
    ARCHETYPE_DESCRIPTIONS['The Hybrid Leader']!
  );
}

function getArchetypeComparison(archetypeName: string): string {
  return (
    ARCHETYPE_COMPARISONS[archetypeName] ??
    ARCHETYPE_COMPARISONS['The Hybrid Leader']!
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeadershipDNAReport() {
  const tools = useWorkspaceStore((s) => s.tools);
  const metadata = useWorkspaceStore((s) => s.metadata);
  const insights = useWorkspaceStore((s) => s.insights);

  const dna = tools['leadership-dna'] as Record<string, number> | undefined;
  const workspace = { tools, metadata };
  const metrics = computeDerivedMetrics(workspace);
  const synthesisInsights =
    insights.length > 0 ? insights : runSynthesis(workspace);
  const narrativeCtx = createNarrativeContext(
    workspace,
    metrics,
    synthesisInsights,
    metadata.name
  );

  const dimensionGaps = extractDimensionGaps(dna);
  const significantGaps = dimensionGaps.filter((g) => g.gap > 1);
  const biggestGap = [...dimensionGaps].sort((a, b) => b.gap - a.gap)[0];
  const archetype: LeadershipArchetype = metrics.leadershipArchetype;
  const archetypeDescriptions = getArchetypeDescriptions(archetype.archetype);
  const archetypeComparison = getArchetypeComparison(archetype.archetype);

  const clientName = metadata.name || 'Your Organization';
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Profile narrative via the narrative engine
  const profileNarrative = generateMetricInterpretation(
    'leadershipArchetype',
    archetype.archetype,
    narrativeCtx
  );

  return (
    <div className="space-y-0">
      {/* ----------------------------------------------------------------- */}
      {/* LDR-01: Cover Page */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="cover">
        <ReportCaption className="uppercase tracking-widest text-blue-200 block mb-4">
          Individual Assessment Report
        </ReportCaption>
        <ReportHero className="text-white">Leadership DNA</ReportHero>
        <ReportBody className="text-blue-100 text-lg mt-4 max-w-xl mx-auto">
          Understanding your leadership profile to unlock growth
        </ReportBody>
        <div className="mt-12 space-y-2">
          <p className="text-xl font-semibold text-white">{clientName}</p>
          <p className="text-blue-200">{reportDate}</p>
        </div>
      </ReportPage>

      {/* ----------------------------------------------------------------- */}
      {/* LDR-02: Leadership Profile */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={2}>
        <div className="space-y-8">
          <ReportSectionTitle>Leadership Profile</ReportSectionTitle>

          {/* Dimension progress bars */}
          <div className="space-y-5">
            {dimensionGaps.map((dim) => (
              <ProgressBar
                key={dim.dimension}
                label={dim.dimension}
                current={dim.current}
                target={dim.target}
                maxValue={10}
              />
            ))}
          </div>

          {/* Biggest gap callout */}
          {biggestGap && biggestGap.gap > 0 && (
            <ReportCallout>
              Largest gap: {biggestGap.dimension} ({biggestGap.gap.toFixed(1)}{' '}
              points). Current score of {biggestGap.current}/10 against a target
              of {biggestGap.target}/10 represents the single biggest
              development opportunity in your leadership profile.
            </ReportCallout>
          )}

          {/* Profile narrative */}
          <ReportBody>{profileNarrative}</ReportBody>
        </div>
      </ReportPage>

      {/* ----------------------------------------------------------------- */}
      {/* LDR-03: Gap Analysis */}
      {/* ----------------------------------------------------------------- */}
      {significantGaps.length > 0 && (
        <ReportPage variant="standard" pageNumber={3}>
          <div className="space-y-8">
            <ReportSectionTitle>Gap Analysis</ReportSectionTitle>
            <ReportBody>
              The following dimensions show a gap greater than 1 point between
              current performance and target. Each represents a specific
              development opportunity with concrete next steps.
            </ReportBody>

            <div className="space-y-8">
              {significantGaps.map((dim) => (
                <div
                  key={dim.dimension}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  {/* Header with scores */}
                  <div className="flex items-center justify-between mb-4">
                    <ReportSubsection className="mb-0">
                      {dim.dimension}
                    </ReportSubsection>
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className="font-semibold"
                        style={{ color: REPORT_COLORS.blue }}
                      >
                        Current: {dim.current}
                      </span>
                      <span className="text-gray-500">
                        Target: {dim.target}
                      </span>
                      <span
                        className="font-bold px-2 py-0.5 rounded"
                        style={{
                          color: REPORT_COLORS.white,
                          backgroundColor:
                            dim.gap > 3
                              ? REPORT_COLORS.red
                              : REPORT_COLORS.amber,
                        }}
                      >
                        Gap: {dim.gap.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* What's behind this gap */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      What is behind this gap
                    </p>
                    <ReportBody>{GAP_BEHIND[dim.dimension]}</ReportBody>
                  </div>

                  {/* What closing this gap unlocks */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      What closing this gap unlocks
                    </p>
                    <ReportBody>{GAP_UNLOCKS[dim.dimension]}</ReportBody>
                  </div>

                  {/* One thing this week */}
                  <div
                    className="rounded p-3"
                    style={{ backgroundColor: `${REPORT_COLORS.blue}10` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: REPORT_COLORS.blue }}
                    >
                      One thing this week
                    </p>
                    <ReportBody className="font-medium">
                      {GAP_MICROSTEP[dim.dimension]}
                    </ReportBody>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ReportPage>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* LDR-04: Leadership Archetype */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={significantGaps.length > 0 ? 4 : 3}>
        <div className="space-y-8">
          <ReportSectionTitle>Leadership Archetype</ReportSectionTitle>

          {/* Archetype name hero */}
          <div
            className="rounded-lg p-8 text-center"
            style={{ backgroundColor: REPORT_COLORS.navy }}
          >
            <ReportCaption className="uppercase tracking-widest text-blue-200 block mb-2">
              Your Archetype
            </ReportCaption>
            <h3 className="text-3xl font-bold text-white">
              {archetype.archetype}
            </h3>
          </div>

          {/* Two-paragraph description */}
          <div className="space-y-4">
            {archetypeDescriptions.map((paragraph, idx) => (
              <ReportBody key={idx}>{paragraph}</ReportBody>
            ))}
          </div>

          {/* Famous leaders comparison */}
          <div
            className="rounded-lg p-5 border-l-4"
            style={{
              borderColor: REPORT_COLORS.blue,
              backgroundColor: `${REPORT_COLORS.warm}`,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Leaders who share this profile
            </p>
            <ReportBody className="font-medium">{archetypeComparison}</ReportBody>
          </div>

          {/* #1 Breakthrough action */}
          <div className="space-y-3">
            <ReportSubsection>Breakthrough Action</ReportSubsection>
            <ReportCallout>{archetype.recommendation}</ReportCallout>
          </div>
        </div>
      </ReportPage>
    </div>
  );
}
