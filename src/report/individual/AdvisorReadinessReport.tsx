/**
 * Advisor Readiness Individual Report (ADV-01 through ADV-04)
 *
 * Pages:
 *   ADV-01  Cover page
 *   ADV-02  Overall Readiness — headline score, stage label, gauge, bar chart
 *   ADV-03  Category Deep Dive — per-category score, interpretation, actions
 *   ADV-04  Readiness Implications — table of strategic-move readiness
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
import { QUESTIONS, CATEGORIES } from '@/tools/advisor-readiness/questions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryScore {
  id: string;
  label: string;
  score: number;        // raw sum
  maxScore: number;     // max possible
  percentage: number;   // 0-100
  stage: string;
  questionIds: string[];
}

interface StrategicMoveReadiness {
  move: string;
  readiness: 'Ready' | 'Partially Ready' | 'Not Ready';
  rationale: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Map overall percentage to maturity stage label */
function getStageLabel(pct: number): string {
  if (pct <= 25) return 'Emerging';
  if (pct <= 50) return 'Growing';
  if (pct <= 75) return 'Advancing';
  return 'Mature';
}

/** Map category percentage to a 2-3 sentence interpretation */
function getCategoryInterpretation(catId: string, pct: number): string {
  const interpretations: Record<string, Record<string, string>> = {
    strategic: {
      low: 'Strategic foundations are largely undefined. The organization lacks a documented vision, sustainable competitive advantage, and succession planning. These gaps make external advisory engagement premature without foundational work.',
      mid: 'Strategic elements are partially in place but inconsistent. The organization has a general sense of direction, though formal documentation and succession planning require attention before scaling advisory engagement.',
      high: 'Strategic foundations are well-established. A clear vision, defined competitive advantage, and succession planning provide the structural clarity that external advisors can effectively build upon.',
    },
    operational: {
      low: 'Operational maturity is limited. Core processes are undocumented, the business depends heavily on the owner, and KPI tracking is absent or informal. Advisory recommendations risk failing at the execution stage.',
      mid: 'Operational infrastructure exists but has gaps. Some processes are documented and delegation occurs, but inconsistency in KPIs and technology adoption limits the organization\'s ability to execute on advisory guidance at scale.',
      high: 'Operational maturity is strong. Documented SOPs, effective delegation, robust KPI tracking, and automation provide a reliable execution engine. Advisory recommendations can be absorbed and acted upon quickly.',
    },
    financial: {
      low: 'Financial visibility is poor. Delayed or inaccurate reporting, thin cash reserves, and unclear budget processes create risk for any strategic initiative. Advisors will struggle to quantify impact without reliable financial data.',
      mid: 'Financial systems are functional but not fully mature. Reporting exists but may lag. Cash reserves and budget discipline are developing, which creates moderate confidence in financial-dependent advisory recommendations.',
      high: 'Financial infrastructure is robust. Timely reporting, healthy reserves, disciplined budgeting, and strong margins provide the financial clarity and stability that enable confident strategic decision-making.',
    },
    cultural: {
      low: 'Cultural readiness is a significant constraint. Low engagement, undefined roles, and resistance to change will undermine advisory-driven transformation. Cultural groundwork must precede strategic consulting.',
      mid: 'Cultural foundations are developing. Employee engagement and role clarity are improving, but the organization may resist the pace of change that advisory engagements typically demand.',
      high: 'Cultural readiness is strong. Engaged employees, clear roles, innovation appetite, and healthy retention create an environment where advisory recommendations translate into organizational action.',
    },
  };

  const level = pct < 40 ? 'low' : pct < 70 ? 'mid' : 'high';
  return interpretations[catId]?.[level] ?? `This category scored ${pct}%, indicating ${level === 'low' ? 'significant gaps' : level === 'mid' ? 'moderate maturity' : 'strong readiness'}.`;
}

/** Generate 1-2 improvement actions per category based on score */
function getCategoryActions(catId: string, pct: number): string[] {
  const actions: Record<string, Record<string, string[]>> = {
    strategic: {
      low: [
        'Document a 3-year strategic vision with measurable milestones before engaging external advisors.',
        'Initiate succession planning for key leadership positions within 90 days.',
      ],
      mid: [
        'Formalize the competitive advantage statement and validate it against market data.',
        'Complete a written succession plan and share it with the leadership team.',
      ],
      high: [
        'Review and pressure-test the strategic plan with an external advisor to identify blind spots.',
      ],
    },
    operational: {
      low: [
        'Document SOPs for the top 5 revenue-critical processes within 60 days.',
        'Implement weekly KPI reviews with the leadership team.',
      ],
      mid: [
        'Audit and update existing SOPs, focusing on delegation gaps.',
        'Adopt a CRM or centralize customer data if not already in place.',
      ],
      high: [
        'Conduct an automation audit to identify the next tier of efficiency gains.',
      ],
    },
    financial: {
      low: [
        'Establish monthly P&L delivery by the 15th with a qualified bookkeeper or CFO service.',
        'Build a 3-month cash reserve as a prerequisite for strategic investment.',
      ],
      mid: [
        'Implement a monthly budget-vs-actuals review cycle with leadership.',
        'Benchmark profit margins against industry averages and identify 2 margin-improvement opportunities.',
      ],
      high: [
        'Leverage strong financial position to model advisory ROI scenarios with confidence.',
      ],
    },
    cultural: {
      low: [
        'Conduct an anonymous employee engagement survey within 30 days.',
        'Clarify and document roles and responsibilities for every team member.',
      ],
      mid: [
        'Establish a formal feedback loop (monthly town halls or suggestion system).',
        'Define and communicate innovation guardrails that encourage calculated risk-taking.',
      ],
      high: [
        'Channel strong culture into change-readiness by identifying internal champions for advisory initiatives.',
      ],
    },
  };

  const level = pct < 40 ? 'low' : pct < 70 ? 'mid' : 'high';
  return actions[catId]?.[level] ?? ['Review this category with your leadership team.'];
}

// ---------------------------------------------------------------------------
// Compute helpers
// ---------------------------------------------------------------------------

function computeCategoryScores(answers: Record<string, number>): CategoryScore[] {
  return CATEGORIES.map((cat) => {
    const catQuestions = QUESTIONS.filter((q) => q.category === cat.id);
    const questionIds = catQuestions.map((q) => q.id);
    const rawScore = catQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const maxScore = catQuestions.length * 5;
    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    return {
      id: cat.id,
      label: cat.label,
      score: rawScore,
      maxScore,
      percentage,
      stage: getStageLabel(percentage),
      questionIds,
    };
  });
}

function computeOverallPercentage(categories: CategoryScore[]): number {
  if (categories.length === 0) return 0;
  const sum = categories.reduce((acc, c) => acc + c.percentage, 0);
  return Math.round(sum / categories.length);
}

/** Determine strategic-move readiness based on category scores */
function computeStrategicMoveReadiness(
  categories: CategoryScore[],
  overallPct: number
): StrategicMoveReadiness[] {
  const cat = (id: string) => categories.find((c) => c.id === id);
  const strategicPct = cat('strategic')?.percentage ?? 0;
  const operationalPct = cat('operational')?.percentage ?? 0;
  const financialPct = cat('financial')?.percentage ?? 0;
  const culturalPct = cat('cultural')?.percentage ?? 0;

  function readinessLevel(score: number): 'Ready' | 'Partially Ready' | 'Not Ready' {
    if (score >= 70) return 'Ready';
    if (score >= 40) return 'Partially Ready';
    return 'Not Ready';
  }

  return [
    {
      move: 'Hiring COO',
      readiness: readinessLevel(Math.round((operationalPct + strategicPct) / 2)),
      rationale:
        operationalPct >= 70 && strategicPct >= 60
          ? 'Strong operational maturity and strategic clarity provide a clear mandate for a COO.'
          : operationalPct < 40
            ? 'Operational foundations must be established before a COO can be effective.'
            : 'Partial readiness -- define the COO role scope and expected outcomes before hiring.',
    },
    {
      move: 'Pursuing Acquisition',
      readiness: readinessLevel(Math.round((financialPct + strategicPct + operationalPct) / 3)),
      rationale:
        financialPct >= 70 && strategicPct >= 60
          ? 'Financial strength and strategic clarity support acquisition diligence.'
          : financialPct < 40
            ? 'Financial visibility is insufficient for acquisition-level due diligence.'
            : 'Moderate readiness -- strengthen financial reporting and strategic rationale before pursuing targets.',
    },
    {
      move: 'New Service Line',
      readiness: readinessLevel(Math.round((operationalPct + culturalPct + strategicPct) / 3)),
      rationale:
        operationalPct >= 60 && culturalPct >= 60
          ? 'Operational capacity and cultural adaptability support new service development.'
          : culturalPct < 40
            ? 'Cultural resistance and role ambiguity will slow new service adoption.'
            : 'Partial readiness -- validate operational capacity and team appetite before committing resources.',
    },
    {
      move: 'Growth Capital',
      readiness: readinessLevel(Math.round((financialPct + strategicPct) / 2)),
      rationale:
        financialPct >= 70
          ? 'Strong financial infrastructure builds investor confidence and supports due diligence.'
          : financialPct < 40
            ? 'Investors and lenders require financial visibility the organization cannot currently provide.'
            : 'Moderate readiness -- improve financial reporting cadence and margin consistency before approaching capital sources.',
    },
    {
      move: 'Geographic Expansion',
      readiness: readinessLevel(Math.round((operationalPct + financialPct + culturalPct + strategicPct) / 4)),
      rationale:
        overallPct >= 70
          ? 'Broad organizational readiness supports the complexity of geographic expansion.'
          : overallPct < 40
            ? 'Multiple foundational gaps make geographic expansion high-risk at this stage.'
            : 'Partial readiness -- address the weakest category before committing to expansion logistics.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Benchmark data for horizontal bar overlay display
// ---------------------------------------------------------------------------

const BENCHMARK_VALUES: Record<string, number> = {
  strategic: 62,
  operational: 55,
  financial: 58,
  cultural: 60,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdvisorReadinessReport() {
  const tools = useWorkspaceStore((state) => state.tools);
  const metadata = useWorkspaceStore((state) => state.metadata);
  const insights: Insight[] = useWorkspaceStore((state) => state.insights);

  const advisorData = tools['advisor-readiness'] as { answers?: Record<string, number> } | undefined;
  const answers: Record<string, number> = advisorData?.answers ?? {};

  const workspace = useMemo(() => ({ tools, metadata }), [tools, metadata]);
  const metrics: DerivedMetrics = useMemo(() => computeDerivedMetrics(workspace), [workspace]);

  const narrativeCtx = useMemo(
    () => createNarrativeContext(workspace, metrics, insights, metadata.name),
    [workspace, metrics, insights, metadata.name],
  );

  const narrativeSection = useMemo(() => {
    const template = buildSectionTemplate('advisor-readiness-narrative', narrativeCtx);
    return generateNarrative(template, narrativeCtx);
  }, [narrativeCtx]);

  const overallNarrative =
    narrativeSection.sections.length > 0
      ? narrativeSection.sections[0].content
      : '';

  // Compute scores
  const categoryScores = useMemo(() => computeCategoryScores(answers), [answers]);
  const overallPct = useMemo(() => computeOverallPercentage(categoryScores), [categoryScores]);
  const overallStage = getStageLabel(overallPct);

  // Build horizontal-bar items for overview page
  const barItems = useMemo(
    () =>
      categoryScores.map((cat) => ({
        label: cat.label,
        value: cat.percentage,
        maxValue: 100,
        color: REPORT_COLORS.blue,
      })),
    [categoryScores],
  );

  // Strategic move readiness
  const strategicMoves = useMemo(
    () => computeStrategicMoveReadiness(categoryScores, overallPct),
    [categoryScores, overallPct],
  );

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
    <div className="report-advisor-readiness">
      {/* ---------------------------------------------------------------- */}
      {/* ADV-01 — Cover Page                                              */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="cover">
        <ReportHero className="text-white">Advisor Readiness Assessment</ReportHero>
        <p className="text-xl text-white/80 font-medium">{clientName}</p>
        <p className="text-sm text-white/60">{reportDate}</p>
        <p className="text-base text-white/70 max-w-lg mx-auto pt-4">
          Evaluating organizational readiness for strategic advisory engagement
        </p>
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* ADV-02 — Overall Readiness                                       */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={2}>
        <ReportSectionTitle>Overall Readiness</ReportSectionTitle>

        {/* Headline score with gauge */}
        <div className="flex flex-col items-center mb-8">
          <Gauge
            value={overallPct}
            maxValue={100}
            label={overallStage}
            sublabel="Overall Advisor Readiness"
          />
        </div>

        {/* Stage interpretation */}
        <ReportCallout className="mb-6">
          {overallStage === 'Emerging' &&
            'The organization is in the early stages of advisory readiness. Foundational investments in strategy, operations, and financial visibility must precede advisory engagement.'}
          {overallStage === 'Growing' &&
            'Advisory readiness is developing. The organization has partial foundations in place but significant gaps remain that would limit the return on advisory investment.'}
          {overallStage === 'Advancing' &&
            'The organization demonstrates solid readiness for strategic advisory engagement. Targeted improvements in weaker categories will maximize advisory ROI.'}
          {overallStage === 'Mature' &&
            'Advisory readiness is strong across all categories. The organization is well-positioned to absorb, execute, and benefit from strategic advisory counsel.'}
        </ReportCallout>

        {/* Horizontal bar chart of categories */}
        <HorizontalBar
          items={barItems}
          title="Category Readiness Scores"
          interpretation={overallNarrative}
          className="mb-6"
        />

        {/* Benchmark context */}
        <div className="mt-4 space-y-1">
          <ReportSubsection>Benchmark Comparison</ReportSubsection>
          <div className="space-y-2">
            {categoryScores.map((cat) => {
              const benchmark = BENCHMARK_VALUES[cat.id] ?? 60;
              const delta = cat.percentage - benchmark;
              const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`;
              return (
                <div key={cat.id} className="flex items-center justify-between text-sm">
                  <span className="text-report-charcoal font-medium">{cat.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-report-blue font-semibold">{cat.percentage}%</span>
                    <span className="text-report-gray">Benchmark: {benchmark}%</span>
                    <span
                      className="font-semibold"
                      style={{ color: delta >= 0 ? REPORT_COLORS.green : REPORT_COLORS.red }}
                    >
                      {deltaLabel}pp
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* ADV-03 — Category Deep Dive                                      */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={3}>
        <ReportSectionTitle>Category Deep Dive</ReportSectionTitle>

        <div className="space-y-10">
          {categoryScores.map((cat) => {
            const interpretation = getCategoryInterpretation(cat.id, cat.percentage);
            const actions = getCategoryActions(cat.id, cat.percentage);

            return (
              <div key={cat.id} className="pb-8 border-b border-report-warm last:border-b-0">
                {/* Category header */}
                <div className="flex items-center justify-between mb-3">
                  <ReportSubsection className="mb-0">{cat.label}</ReportSubsection>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-report-navy">{cat.percentage}%</span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor:
                          cat.percentage >= 70
                            ? `${REPORT_COLORS.green}20`
                            : cat.percentage >= 40
                              ? `${REPORT_COLORS.amber}20`
                              : `${REPORT_COLORS.red}20`,
                        color:
                          cat.percentage >= 70
                            ? REPORT_COLORS.green
                            : cat.percentage >= 40
                              ? REPORT_COLORS.amber
                              : REPORT_COLORS.red,
                      }}
                    >
                      {cat.stage}
                    </span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-3 bg-report-warm rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: REPORT_COLORS.blue,
                    }}
                  />
                </div>

                {/* Interpretation */}
                <ReportBody className="mb-4">{interpretation}</ReportBody>

                {/* Improvement actions */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-report-navy uppercase tracking-wider mb-2">
                    Improvement Actions
                  </p>
                  <ReportList>
                    {actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ReportList>
                </div>
              </div>
            );
          })}
        </div>
      </ReportPage>

      {/* ---------------------------------------------------------------- */}
      {/* ADV-04 — Readiness Implications Table                            */}
      {/* ---------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={4}>
        <ReportSectionTitle>Readiness Implications</ReportSectionTitle>

        <ReportBody className="mb-6">
          The table below maps your current readiness profile against common strategic
          moves. Each readiness level reflects the composite score of the categories
          most relevant to that initiative.
        </ReportBody>

        <ReportTable>
          <ReportTableHeader>
            <ReportTableRow>
              <ReportTableCell header>Strategic Move</ReportTableCell>
              <ReportTableCell header>Readiness</ReportTableCell>
              <ReportTableCell header>Rationale</ReportTableCell>
            </ReportTableRow>
          </ReportTableHeader>
          <tbody>
            {strategicMoves.map((move, idx) => (
              <ReportTableRow key={move.move} variant={idx % 2 === 1 ? 'alternate' : 'default'}>
                <ReportTableCell className="font-semibold whitespace-nowrap">
                  {move.move}
                </ReportTableCell>
                <ReportTableCell>
                  <span
                    className="inline-block text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        move.readiness === 'Ready'
                          ? `${REPORT_COLORS.green}20`
                          : move.readiness === 'Partially Ready'
                            ? `${REPORT_COLORS.amber}20`
                            : `${REPORT_COLORS.red}20`,
                      color:
                        move.readiness === 'Ready'
                          ? REPORT_COLORS.green
                          : move.readiness === 'Partially Ready'
                            ? REPORT_COLORS.amber
                            : REPORT_COLORS.red,
                    }}
                  >
                    {move.readiness}
                  </span>
                </ReportTableCell>
                <ReportTableCell>{move.rationale}</ReportTableCell>
              </ReportTableRow>
            ))}
          </tbody>
        </ReportTable>
      </ReportPage>
    </div>
  );
}
