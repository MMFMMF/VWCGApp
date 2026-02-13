/**
 * AI Readiness Individual Report (AIR-01 through AIR-04)
 *
 * Pages:
 *   AIR-01  Cover page
 *   AIR-02  AI Readiness Overview — headline stage, gauge, bar chart, narrative
 *   AIR-03  Dimension Analysis — per-dimension score, label, interpretation, priority
 *   AIR-04  AI Readiness Roadmap — 3-phase action plan based on scores
 */

import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics } from '@/engine';
import type { Insight } from '@/engine/types.ts';
import type { DerivedMetrics } from '@/engine/derived-metrics.ts';
import {
  createNarrativeContext,
  generateNarrative,
  buildSectionTemplate,
} from '@/report/narrative';
import {
  ReportPage,
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCallout,
  ReportList,
  ReportTable,
  ReportTableHeader,
  ReportTableRow,
  ReportTableCell,
} from '@/report/components';
import { Gauge, HorizontalBar } from '@/report/charts';
import { REPORT_COLORS } from '@/report/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DimensionName = 'Strategy' | 'Data' | 'Infrastructure' | 'Talent' | 'Governance' | 'Culture';

interface DimensionScore {
  name: DimensionName;
  score: number;          // 0-100
  label: string;          // one-line contextual label
  interpretation: string; // 2-3 sentence business-context interpretation
  priority: 'Critical' | 'Important' | 'Monitor';
}

interface RoadmapPhase {
  title: string;
  timeframe: string;
  description: string;
  actions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIMENSIONS: DimensionName[] = [
  'Strategy',
  'Data',
  'Infrastructure',
  'Talent',
  'Governance',
  'Culture',
];

/** Map overall average to AI Readiness stage */
function getAIStageLabel(avg: number): string {
  if (avg < 20) return 'Pre-Digital';
  if (avg < 40) return 'Foundational';
  if (avg < 60) return 'Developing';
  if (avg < 80) return 'Advanced';
  return 'Leading';
}

/** Map score to priority level */
function getPriority(score: number): 'Critical' | 'Important' | 'Monitor' {
  if (score < 30) return 'Critical';
  if (score < 60) return 'Important';
  return 'Monitor';
}

/** Priority color helper */
function getPriorityColor(priority: 'Critical' | 'Important' | 'Monitor'): string {
  switch (priority) {
    case 'Critical':
      return REPORT_COLORS.red;
    case 'Important':
      return REPORT_COLORS.amber;
    case 'Monitor':
      return REPORT_COLORS.green;
  }
}

// ---------------------------------------------------------------------------
// Dimension interpretation & label generation
// ---------------------------------------------------------------------------

function getDimensionLabel(name: DimensionName, score: number): string {
  const labels: Record<DimensionName, Record<string, string>> = {
    Strategy: {
      low: 'Strategy: No AI strategy defined',
      mid: 'Strategy: Emerging AI vision with gaps',
      high: 'Strategy: AI strategy aligned to business goals',
    },
    Data: {
      low: 'Data: Fragmented and inaccessible',
      mid: 'Data: Ready for pilot projects',
      high: 'Data: Production-grade data pipelines',
    },
    Infrastructure: {
      low: 'Infrastructure: Legacy systems limit AI deployment',
      mid: 'Infrastructure: Cloud-ready with integration needs',
      high: 'Infrastructure: Scalable AI-ready platform',
    },
    Talent: {
      low: 'Talent: No AI-skilled personnel',
      mid: 'Talent: Emerging capabilities, hiring needed',
      high: 'Talent: Cross-functional AI competency',
    },
    Governance: {
      low: 'Governance: No AI policies or oversight',
      mid: 'Governance: Initial frameworks in development',
      high: 'Governance: Mature AI governance and ethics',
    },
    Culture: {
      low: 'Culture: Resistant to AI adoption',
      mid: 'Culture: Cautiously open to AI pilots',
      high: 'Culture: AI-first mindset across teams',
    },
  };

  const level = score < 30 ? 'low' : score < 60 ? 'mid' : 'high';
  return labels[name][level];
}

function getDimensionInterpretation(name: DimensionName, score: number): string {
  const interps: Record<DimensionName, Record<string, string>> = {
    Strategy: {
      low: 'The organization has not defined an AI strategy. Without a strategic framework, AI investments risk being ad-hoc and disconnected from business objectives. Leadership must articulate where AI creates competitive advantage before committing resources.',
      mid: 'An emerging AI strategy exists but lacks the specificity to guide investment decisions. The vision connects AI to business goals at a high level, though detailed use-case prioritization and success metrics are needed to move from aspiration to execution.',
      high: 'AI strategy is well-defined and integrated with the broader business plan. Use cases are prioritized by impact and feasibility, success metrics are established, and leadership alignment ensures consistent resource allocation toward AI initiatives.',
    },
    Data: {
      low: 'Data is fragmented across systems with inconsistent quality and limited accessibility. This is the single largest barrier to AI adoption. No machine learning model can compensate for unreliable training data. Data infrastructure investment must precede any AI initiative.',
      mid: 'Data foundations support pilot-scale AI projects. Core datasets are identified and partially cleansed, though integration across systems remains incomplete. The organization can run targeted experiments while building more robust data pipelines in parallel.',
      high: 'Data infrastructure supports production-grade AI deployment. Centralized data lakes, quality-assurance processes, and accessible APIs enable rapid model development and iteration. This dimension is a competitive advantage.',
    },
    Infrastructure: {
      low: 'Legacy infrastructure creates a fundamental constraint. Current systems lack the compute capacity, cloud readiness, or API integration layers required for AI workloads. Modernization investment is a prerequisite, not an enhancement.',
      mid: 'Infrastructure is partially cloud-enabled with room for AI workload support. Core systems can host pilot projects, but scaling to production requires investment in compute resources, API layers, and potentially containerized deployment environments.',
      high: 'Infrastructure is AI-ready with scalable cloud compute, modern API architecture, and deployment pipelines that support model training and serving. The technology stack enables rapid experimentation and production deployment.',
    },
    Talent: {
      low: 'The organization lacks personnel with AI or machine learning skills. Without internal capability, the organization depends entirely on external vendors -- increasing cost, reducing knowledge retention, and slowing iteration cycles. Hiring or upskilling is the immediate priority.',
      mid: 'Emerging AI talent exists, typically concentrated in one team or role. Cross-functional AI literacy is limited, which constrains adoption beyond technical teams. A structured upskilling program combined with targeted hiring will build the breadth needed for organization-wide adoption.',
      high: 'AI competency spans technical and business teams. Data scientists, ML engineers, and AI-literate business leaders collaborate effectively. This cross-functional capability enables the organization to identify, develop, and deploy AI solutions independently.',
    },
    Governance: {
      low: 'No AI governance framework exists. This creates regulatory, ethical, and reputational risk as AI adoption progresses. Without policies for data use, model bias, and decision transparency, the organization is exposed to liabilities that grow with each deployment.',
      mid: 'Initial governance frameworks are in development. Policies address basic data use and model oversight, but lack the rigor needed for regulated industries or enterprise-scale deployment. Expanding governance before scaling AI deployment reduces downstream compliance risk.',
      high: 'Mature AI governance includes data ethics policies, model validation processes, bias monitoring, and clear accountability structures. This framework enables confident scaling of AI initiatives while managing regulatory and reputational risk.',
    },
    Culture: {
      low: 'Organizational culture resists AI adoption. Fear of automation, lack of digital literacy, and leadership skepticism create friction at every stage. Cultural transformation -- starting with executive sponsorship and visible quick wins -- must precede technical investment.',
      mid: 'The organization is cautiously open to AI. Pockets of enthusiasm exist alongside skepticism. Targeted pilot projects with measurable outcomes will build institutional confidence and convert skeptics into advocates. Communication of AI benefits in business terms, not technical jargon, accelerates acceptance.',
      high: 'An AI-first culture permeates the organization. Teams actively seek automation opportunities, leadership champions AI investment, and employees view AI as an enabler rather than a threat. This cultural readiness dramatically accelerates time-to-value for AI initiatives.',
    },
  };

  const level = score < 30 ? 'low' : score < 60 ? 'mid' : 'high';
  return interps[name][level];
}

// ---------------------------------------------------------------------------
// Roadmap generation
// ---------------------------------------------------------------------------

function buildRoadmap(dimensions: DimensionScore[]): RoadmapPhase[] {
  const critical = dimensions.filter((d) => d.priority === 'Critical');
  const important = dimensions.filter((d) => d.priority === 'Important');
  const monitor = dimensions.filter((d) => d.priority === 'Monitor');

  // Phase 1: Foundation (Months 1-3) -- address Critical dimensions
  const foundationActions: string[] = [];
  if (critical.length === 0) {
    foundationActions.push('Audit existing AI-adjacent initiatives and consolidate learnings.');
    foundationActions.push('Establish a cross-functional AI steering committee to govern priorities.');
  } else {
    for (const dim of critical.slice(0, 3)) {
      switch (dim.name) {
        case 'Strategy':
          foundationActions.push('Define a written AI strategy with 3-5 prioritized use cases tied to revenue or cost impact.');
          break;
        case 'Data':
          foundationActions.push('Audit data quality across core systems and create a data cleansing roadmap for the top 3 AI-relevant datasets.');
          break;
        case 'Infrastructure':
          foundationActions.push('Evaluate cloud migration options and deploy a sandbox environment for AI experimentation.');
          break;
        case 'Talent':
          foundationActions.push('Hire or contract an AI/ML lead and launch a digital literacy program for business teams.');
          break;
        case 'Governance':
          foundationActions.push('Draft an AI use policy covering data ethics, model transparency, and accountability structures.');
          break;
        case 'Culture':
          foundationActions.push('Secure executive sponsorship for AI and communicate a clear "AI is an enabler" narrative to all staff.');
          break;
      }
    }
  }

  // Phase 2: Build (Months 4-6) -- develop Important dimensions
  const buildActions: string[] = [];
  if (important.length === 0) {
    buildActions.push('Expand successful pilot projects into production with defined SLAs.');
    buildActions.push('Develop internal AI training curricula tailored to department-specific use cases.');
  } else {
    for (const dim of important.slice(0, 3)) {
      switch (dim.name) {
        case 'Strategy':
          buildActions.push('Validate AI strategy with pilot results and refine use-case prioritization based on ROI data.');
          break;
        case 'Data':
          buildActions.push('Build automated data pipelines connecting key systems and implement data quality monitoring.');
          break;
        case 'Infrastructure':
          buildActions.push('Deploy containerized ML environments and establish CI/CD pipelines for model deployment.');
          break;
        case 'Talent':
          buildActions.push('Run cross-functional AI workshops and embed AI champions in each business unit.');
          break;
        case 'Governance':
          buildActions.push('Implement model validation and bias testing protocols before production deployment.');
          break;
        case 'Culture':
          buildActions.push('Showcase pilot project results organization-wide and celebrate early AI wins publicly.');
          break;
      }
    }
  }

  // Phase 3: Scale (Months 7-12) -- optimize Monitor dimensions & scale
  const scaleActions: string[] = [];
  if (monitor.length === 0) {
    scaleActions.push('Reassess all dimensions after Phase 2 completion to identify new optimization targets.');
    scaleActions.push('Develop an AI center of excellence to centralize best practices and accelerate future initiatives.');
  } else {
    for (const dim of monitor.slice(0, 3)) {
      switch (dim.name) {
        case 'Strategy':
          scaleActions.push('Integrate AI KPIs into the executive dashboard and tie AI outcomes to strategic planning cycles.');
          break;
        case 'Data':
          scaleActions.push('Scale data infrastructure to support real-time model serving and advanced analytics workloads.');
          break;
        case 'Infrastructure':
          scaleActions.push('Optimize cloud costs and implement auto-scaling for production AI workloads.');
          break;
        case 'Talent':
          scaleActions.push('Build a formal AI career track and develop partnerships with universities for talent pipeline.');
          break;
        case 'Governance':
          scaleActions.push('Conduct external AI governance audit and benchmark against industry frameworks (NIST, EU AI Act).');
          break;
        case 'Culture':
          scaleActions.push('Evolve from AI-adoption culture to AI-innovation culture with internal hackathons and innovation budgets.');
          break;
      }
    }
  }

  // Ensure each phase has at least 2 actions
  if (foundationActions.length < 2) {
    foundationActions.push('Conduct a comprehensive AI readiness gap analysis to identify blind spots.');
  }
  if (buildActions.length < 2) {
    buildActions.push('Establish measurement frameworks for AI initiative ROI.');
  }
  if (scaleActions.length < 2) {
    scaleActions.push('Develop a long-term AI investment thesis for the next 3 years.');
  }

  return [
    {
      title: 'Foundation',
      timeframe: 'Months 1-3',
      description: 'Address critical gaps and establish the baseline infrastructure for AI adoption.',
      actions: foundationActions,
    },
    {
      title: 'Build',
      timeframe: 'Months 4-6',
      description: 'Develop capabilities in important dimensions and validate with pilot initiatives.',
      actions: buildActions,
    },
    {
      title: 'Scale',
      timeframe: 'Months 7-12',
      description: 'Optimize mature dimensions and scale proven AI initiatives across the organization.',
      actions: scaleActions,
    },
  ];
}

// ---------------------------------------------------------------------------
// Adoption curve narrative
// ---------------------------------------------------------------------------

function getAdoptionNarrative(stage: string, avg: number, strongest: DimensionScore, weakest: DimensionScore): string {
  const spread = strongest.score - weakest.score;

  let narrative = '';

  switch (stage) {
    case 'Pre-Digital':
      narrative = `At an average readiness of ${Math.round(avg)}%, the organization is in the Pre-Digital stage. AI adoption is not a near-term priority. The immediate focus should be on digitizing core processes and establishing data foundations that will eventually support AI capabilities.`;
      break;
    case 'Foundational':
      narrative = `At ${Math.round(avg)}% average readiness, the organization is in the Foundational stage of AI adoption. Basic digital infrastructure exists, but significant investment in data, talent, and governance is needed before AI pilots can deliver meaningful results.`;
      break;
    case 'Developing':
      narrative = `At ${Math.round(avg)}% average readiness, the organization sits in the Developing stage. Targeted AI pilots are feasible in the strongest dimensions. The primary challenge is building sufficient breadth across all six dimensions to support production-grade deployment.`;
      break;
    case 'Advanced':
      narrative = `At ${Math.round(avg)}% average readiness, the organization has reached the Advanced stage. Production AI deployment is viable. The focus shifts from capability-building to optimization, governance maturation, and scaling successful pilots across the enterprise.`;
      break;
    case 'Leading':
      narrative = `At ${Math.round(avg)}% average readiness, the organization operates at the Leading edge of AI adoption. Competitive advantage now comes from speed of iteration and depth of AI integration into business processes, not from basic capability.`;
      break;
    default:
      narrative = `Average AI readiness is ${Math.round(avg)}%.`;
  }

  if (spread > 40) {
    narrative += ` However, a ${spread}-point spread between ${strongest.name} (${strongest.score}%) and ${weakest.name} (${weakest.score}%) creates an internal bottleneck that limits the organization's effective AI capability to its weakest link.`;
  }

  return narrative;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIReadinessReport() {
  const tools = useWorkspaceStore((state) => state.tools);
  const metadata = useWorkspaceStore((state) => state.metadata);
  const insights: Insight[] = useWorkspaceStore((state) => state.insights);

  const aiData = tools['ai-readiness'] as Record<string, number> | undefined;

  const workspace = useMemo(() => ({ tools, metadata }), [tools, metadata]);
  const metrics: DerivedMetrics = useMemo(() => computeDerivedMetrics(workspace), [workspace]);

  const narrativeCtx = useMemo(
    () => createNarrativeContext(workspace, metrics, insights, metadata.name),
    [workspace, metrics, insights, metadata.name],
  );

  // Use the narrative engine's AI readiness section
  const narrativeSection = useMemo(() => {
    const template = buildSectionTemplate('ai-readiness-narrative', narrativeCtx);
    return generateNarrative(template, narrativeCtx);
  }, [narrativeCtx]);

  // Compute dimension scores
  const dimensionScores: DimensionScore[] = useMemo(
    () =>
      DIMENSIONS.map((name) => {
        const score = (aiData?.[name] as number) ?? 0;
        return {
          name,
          score,
          label: getDimensionLabel(name, score),
          interpretation: getDimensionInterpretation(name, score),
          priority: getPriority(score),
        };
      }),
    [aiData],
  );

  const avgScore = useMemo(() => {
    const scores = dimensionScores.map((d) => d.score);
    return scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  }, [dimensionScores]);

  const stage = getAIStageLabel(avgScore);

  const sortedByScore = useMemo(
    () => [...dimensionScores].sort((a, b) => b.score - a.score),
    [dimensionScores],
  );
  const strongest = sortedByScore[0];
  const weakest = sortedByScore[sortedByScore.length - 1];

  // Build bar-chart items
  const barItems = useMemo(
    () =>
      dimensionScores.map((d) => ({
        label: d.name,
        value: d.score,
        maxValue: 100,
        color: REPORT_COLORS.blue,
      })),
    [dimensionScores],
  );

  // Adoption narrative
  const adoptionNarrative = useMemo(
    () => getAdoptionNarrative(stage, avgScore, strongest, weakest),
    [stage, avgScore, strongest, weakest],
  );

  // Roadmap
  const roadmapPhases = useMemo(() => buildRoadmap(dimensionScores), [dimensionScores]);

  const clientName = metadata.name || 'Your Organization';
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="report-ai-readiness">
      {/* ---------------------------------------------------------------- */}
      {/* AIR-01 — Cover Page                                              */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="cover">
        <ReportHero className="text-white">AI Readiness Assessment</ReportHero>
        <p className="text-xl text-white/80 font-medium">{clientName}</p>
        <p className="text-sm text-white/60">{reportDate}</p>
        <p className="text-base text-white/70 max-w-lg mx-auto pt-4">
          Evaluating organizational readiness for artificial intelligence adoption and deployment
        </p>
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* AIR-02 — AI Readiness Overview                                   */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={2}>
        <ReportSectionTitle>AI Readiness Overview</ReportSectionTitle>

        {/* Headline score with gauge */}
        <div className="flex flex-col items-center mb-8">
          <Gauge
            value={Math.round(avgScore)}
            maxValue={100}
            label={stage}
            sublabel="Overall AI Readiness"
          />
        </div>

        {/* Stage callout */}
        <ReportCallout className="mb-6">
          {adoptionNarrative}
        </ReportCallout>

        {/* Horizontal bar chart of 6 dimensions */}
        <HorizontalBar
          items={barItems}
          title="AI Readiness by Dimension"
          interpretation={
            narrativeSection.sections.length > 0
              ? narrativeSection.sections[0].content
              : undefined
          }
        />
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* AIR-03 — Dimension Analysis                                      */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={3}>
        <ReportSectionTitle>Dimension Analysis</ReportSectionTitle>

        <div className="space-y-8">
          {dimensionScores.map((dim, idx) => {
            const priorityColor = getPriorityColor(dim.priority);

            return (
              <div
                key={dim.name}
                className="pb-6 border-b border-report-warm last:border-b-0"
                style={{
                  backgroundColor: idx % 2 === 1 ? `${REPORT_COLORS.warm}80` : 'transparent',
                  padding: idx % 2 === 1 ? '16px' : undefined,
                  borderRadius: idx % 2 === 1 ? '8px' : undefined,
                }}
              >
                {/* Dimension header */}
                <div className="flex items-center justify-between mb-2">
                  <ReportSubsection className="mb-0">{dim.name}</ReportSubsection>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-report-navy">{dim.score}%</span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${priorityColor}20`,
                        color: priorityColor,
                      }}
                    >
                      {dim.priority}
                    </span>
                  </div>
                </div>

                {/* One-line label */}
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: REPORT_COLORS.blue }}
                >
                  {dim.label}
                </p>

                {/* Score bar */}
                <div className="h-3 bg-report-warm rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: priorityColor,
                    }}
                  />
                </div>

                {/* Business-context interpretation */}
                <ReportBody>{dim.interpretation}</ReportBody>
              </div>
            );
          })}
        </div>
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* AIR-04 — AI Readiness Roadmap                                    */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={4}>
        <ReportSectionTitle>AI Readiness Roadmap</ReportSectionTitle>

        <ReportBody className="mb-8">
          This phased roadmap translates the dimension analysis into a sequenced action
          plan. Critical-priority dimensions are addressed first to remove structural
          blockers, followed by capability building and then organization-wide scaling.
        </ReportBody>

        <div className="space-y-8">
          {roadmapPhases.map((phase, idx) => {
            const phaseColors = [REPORT_COLORS.red, REPORT_COLORS.amber, REPORT_COLORS.green];
            const phaseColor = phaseColors[idx] ?? REPORT_COLORS.blue;

            return (
              <div
                key={phase.title}
                className="relative pl-8 pb-6 last:pb-0"
              >
                {/* Timeline connector */}
                {idx < roadmapPhases.length - 1 && (
                  <div
                    className="absolute left-3 top-8 bottom-0 w-0.5"
                    style={{ backgroundColor: `${REPORT_COLORS.gray}40` }}
                  />
                )}

                {/* Phase marker */}
                <div
                  className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor: phaseColor,
                    borderColor: phaseColor,
                  }}
                >
                  {idx + 1}
                </div>

                {/* Phase content */}
                <div className="bg-white border border-report-warm rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <ReportSubsection className="mb-0">
                      Phase {idx + 1}: {phase.title}
                    </ReportSubsection>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${phaseColor}15`,
                        color: phaseColor,
                      }}
                    >
                      {phase.timeframe}
                    </span>
                  </div>

                  <ReportBody className="mb-3">{phase.description}</ReportBody>

                  <ReportList>
                    {phase.actions.map((action, actionIdx) => (
                      <li key={actionIdx}>{action}</li>
                    ))}
                  </ReportList>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary table of dimension-to-phase mapping */}
        <div className="mt-10">
          <ReportSubsection>Dimension Priority Summary</ReportSubsection>
          <ReportTable>
            <ReportTableHeader>
              <ReportTableRow>
                <ReportTableCell header>Dimension</ReportTableCell>
                <ReportTableCell header>Score</ReportTableCell>
                <ReportTableCell header>Priority</ReportTableCell>
                <ReportTableCell header>Target Phase</ReportTableCell>
              </ReportTableRow>
            </ReportTableHeader>
            <tbody>
              {sortedByScore.map((dim, idx) => {
                const phaseLabel =
                  dim.priority === 'Critical'
                    ? 'Phase 1: Foundation'
                    : dim.priority === 'Important'
                      ? 'Phase 2: Build'
                      : 'Phase 3: Scale';

                return (
                  <ReportTableRow
                    key={dim.name}
                    variant={idx % 2 === 1 ? 'alternate' : 'default'}
                  >
                    <ReportTableCell className="font-semibold">{dim.name}</ReportTableCell>
                    <ReportTableCell>{dim.score}%</ReportTableCell>
                    <ReportTableCell>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${getPriorityColor(dim.priority)}20`,
                          color: getPriorityColor(dim.priority),
                        }}
                      >
                        {dim.priority}
                      </span>
                    </ReportTableCell>
                    <ReportTableCell>{phaseLabel}</ReportTableCell>
                  </ReportTableRow>
                );
              })}
            </tbody>
          </ReportTable>
        </div>
      </ReportPage>
    </div>
  );
}
