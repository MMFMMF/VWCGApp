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

/** Infer company context from business-context tool data */
type CompanyContext = 'startup' | 'mid-market' | 'established';

function inferCompanyContext(workspace: { tools: Record<string, any> }): CompanyContext {
  const bc = workspace.tools?.['business-context'];
  if (!bc) return 'mid-market'; // default
  const revenue = bc.revenueRange ?? '';
  const employees = bc.employeeCount ?? 0;
  const age = bc.businessAge ?? 5;

  // Startup: young or very small
  if (age < 3 || employees < 10 || revenue === '<1M') return 'startup';
  // Established: large or old
  if (age > 10 || employees > 200 || revenue === '50M+' || revenue === '30-50M') return 'established';
  return 'mid-market';
}

/** Map overall percentage to maturity stage label (ADVR-04: 5 levels) */
function getStageLabel(pct: number): string {
  if (pct >= 80) return 'Mature';
  if (pct >= 65) return 'Advancing';
  if (pct >= 50) return 'Developing';
  if (pct >= 35) return 'Growing';
  return 'Foundational';
}

/** Map category percentage to interpretation with 6-level granularity + company context */
function getCategoryInterpretation(catId: string, pct: number, context: CompanyContext): string {
  // 6 score levels: 0-16, 17-33, 34-50, 51-66, 67-83, 84-100
  const level = pct <= 16 ? 0 : pct <= 33 ? 1 : pct <= 50 ? 2 : pct <= 66 ? 3 : pct <= 83 ? 4 : 5;

  const templates: Record<string, Array<Record<CompanyContext, string>>> = {
    strategic: [
      { startup: 'Strategic foundations are absent — expected for a startup, but advisory engagement requires at minimum a documented vision and 12-month target. Build these before engaging advisors.', 'mid-market': 'Strategic foundations are largely undefined. The organization lacks a documented vision and succession planning. These gaps make advisory engagement premature.', established: 'For an established organization, the absence of strategic documentation is a critical gap. Prior institutional knowledge exists but is not formalized — this creates risk and limits advisory effectiveness.' },
      { startup: 'Early strategic thinking is present but informal. As a startup, the priority is formalizing the competitive thesis and first succession plan before scaling advisory investment.', 'mid-market': 'Strategic elements are emerging but fragmented. The organization has direction but lacks formal documentation. Advisory value will be limited until strategic clarity improves.', established: 'Strategic foundations lag behind organizational maturity. Institutional knowledge needs to be captured and formalized — the organization has outgrown informal strategic management.' },
      { startup: 'Strategic awareness is developing. The startup has basic direction but needs to formalize competitive positioning and growth milestones before advisory engagement delivers full ROI.', 'mid-market': 'Strategic elements are partially in place. A general sense of direction exists, though formal documentation and succession planning need attention.', established: 'Strategic infrastructure exists but has been maintained reactively. For an established organization, proactive strategic planning will unlock the next phase of growth.' },
      { startup: 'Good strategic progress for a young company. The competitive thesis is emerging and basic planning exists — advisory engagement can now accelerate strategic development.', 'mid-market': 'Strategic foundations are functional. Core elements are documented, though refinement of competitive positioning and succession planning will improve advisory outcomes.', established: 'Strategic maturity is adequate. The organization has functioning strategic processes, though updating them to reflect current market conditions will maximize advisory ROI.' },
      { startup: 'Strong strategic foundation for a startup — unusual and valuable. Advisory engagement can focus on acceleration rather than foundational work.', 'mid-market': 'Strategic readiness is strong. Clear vision, defined competitive advantage, and planning processes provide structural clarity for effective advisory engagement.', established: 'Strategic infrastructure is well-maintained. Advisory engagement can focus on advanced strategic moves (M&A, geographic expansion, category creation) rather than foundational work.' },
      { startup: 'Exceptional strategic maturity for a startup. The advisory opportunity is in scaling execution, not strategy definition.', 'mid-market': 'Strategic foundations are excellent. Advisory engagement can immediately focus on execution and growth rather than strategy formulation.', established: 'Strategic maturity is a core organizational strength. Advisory engagement should target breakthrough initiatives that leverage this strong strategic base.' },
    ],
    operational: [
      { startup: 'Operational infrastructure does not yet exist — typical for early-stage companies, but creates a hard ceiling on advisory impact. Start with documenting the top 3 revenue-critical processes.', 'mid-market': 'Operational maturity is critically low. Core processes are undocumented and KPI tracking is absent. Advisory recommendations will fail at the execution stage.', established: 'For an established organization, this level of operational informality indicates systemic issues. Decades of tribal knowledge without documentation creates significant risk and limits advisory effectiveness.' },
      { startup: 'Basic operations are running but entirely dependent on founding team knowledge. Documenting key workflows and establishing delegation will enable advisory engagement.', 'mid-market': 'Operational foundations are emerging. Some processes exist but are inconsistent and largely dependent on key individuals.', established: 'Operational processes have calcified around legacy practices. Modernizing documentation and delegation is overdue for an organization of this maturity.' },
      { startup: 'Operational basics are in place — notable for a startup. Some documentation and initial delegation exist. Focus on building KPI visibility next.', 'mid-market': 'Operational infrastructure exists but has gaps. Some processes are documented but inconsistency in KPIs and technology adoption limits advisory execution.', established: 'Operational processes function but haven\'t evolved with the business. Updating SOPs and modernizing technology will improve execution capacity.' },
      { startup: 'Good operational maturity for a young company. Processes are documented and delegation is happening, which provides a foundation for advisory-driven improvements.', 'mid-market': 'Operational maturity is functional. KPI tracking and delegation are developing, providing reasonable execution capacity for advisory recommendations.', established: 'Operational infrastructure is adequate but could be more efficient. Automation and process optimization represent the next tier of operational improvement.' },
      { startup: 'Impressive operational discipline for a startup. This execution engine can absorb and act on advisory recommendations.', 'mid-market': 'Operational maturity is strong. Documented SOPs, effective delegation, and KPI tracking provide a reliable execution engine for advisory recommendations.', established: 'Operational maturity meets expectations. Advisory engagement can focus on optimization and scaling rather than foundational operational work.' },
      { startup: 'Exceptional operational maturity for a startup — a significant competitive advantage.', 'mid-market': 'Operational excellence is a core strength. The organization can execute advisory recommendations rapidly and at scale.', established: 'Operational infrastructure is a competitive advantage. Advisory engagement should explore next-generation efficiency opportunities.' },
    ],
    financial: [
      { startup: 'Financial systems are pre-revenue or pre-structure — expected at this stage, but advisory engagement requires at minimum monthly financial reporting and basic cash tracking.', 'mid-market': 'Financial visibility is critically poor. Delayed or inaccurate reporting and thin cash reserves create risk for any strategic initiative.', established: 'For an established organization, this level of financial opacity is a red flag. Advisors and investors cannot work with unreliable financial data.' },
      { startup: 'Basic financial tracking is in place but reporting is informal or delayed. Establishing monthly reporting discipline is the prerequisite for advisory-grade financial conversations.', 'mid-market': 'Financial systems are emerging. Basic reporting exists but lacks the timeliness and consistency needed for advisory-driven financial decisions.', established: 'Financial infrastructure has not kept pace with organizational growth. Upgrading reporting and controls is a critical prerequisite.' },
      { startup: 'Financial awareness is developing. Monthly reporting is becoming consistent and basic budgeting exists — a good foundation for startup-stage advisory engagement.', 'mid-market': 'Financial systems are functional but not fully mature. Reporting exists but may lag, and cash reserves need strengthening for strategic confidence.', established: 'Financial infrastructure functions but lacks the sophistication expected at this organizational stage. Benchmarking against industry peers will surface improvement areas.' },
      { startup: 'Good financial discipline for a young company. Reporting, budgeting, and cash management provide reasonable visibility for advisory decision-making.', 'mid-market': 'Financial maturity is adequate. Reporting cadence is regular and margins are tracked, providing moderate confidence in financial-dependent advisory recommendations.', established: 'Financial infrastructure is functional. Tightening budget-vs-actuals reviews and margin optimization will improve financial advisory outcomes.' },
      { startup: 'Strong financial infrastructure for a startup — this enables data-driven advisory engagement from day one.', 'mid-market': 'Financial infrastructure is robust. Timely reporting, healthy reserves, and disciplined budgeting enable confident strategic decision-making.', established: 'Financial maturity supports complex advisory engagements including M&A diligence, capital structuring, and growth investment modeling.' },
      { startup: 'Exceptional financial maturity for a startup. Advisory engagement can focus on capital strategy rather than financial infrastructure.', 'mid-market': 'Financial infrastructure is excellent. Strong margins, reporting discipline, and reserves provide an ideal foundation for strategic advisory work.', established: 'Financial infrastructure is a competitive advantage. Advisory engagement can target sophisticated capital allocation and value creation strategies.' },
    ],
    cultural: [
      { startup: 'Cultural foundations are undefined — in a small team this is normal, but explicit role definition and engagement practices must be established before advisory-driven change initiatives.', 'mid-market': 'Cultural readiness is a significant constraint. Low engagement, undefined roles, and resistance to change will undermine advisory-driven transformation.', established: 'Entrenched cultural resistance in an established organization signals deep issues. Advisory-driven change will face significant headwinds without cultural groundwork.' },
      { startup: 'Early culture is forming around the founding team. Formalizing roles and establishing communication practices now will make future advisory engagement more effective.', 'mid-market': 'Cultural foundations are weak. Role ambiguity and low engagement limit the organization\'s ability to absorb advisory-driven change.', established: 'Cultural inertia is limiting organizational potential. Change management capability must be built before advisory recommendations can take root.' },
      { startup: 'Team culture is developing. Basic role clarity exists and the founding team is engaged, though scaling cultural practices will be needed as the team grows.', 'mid-market': 'Cultural foundations are developing. Employee engagement and role clarity are improving, but the organization may resist the pace of change that advisory engagements demand.', established: 'Culture functions but has pockets of resistance. Targeted engagement initiatives and clear change communication will improve advisory receptivity.' },
      { startup: 'Good cultural foundation for a growing startup. Team engagement is healthy and roles are defined — this supports the pace of change advisory engagement typically requires.', 'mid-market': 'Cultural readiness is adequate. The team is receptive to managed change, though communication and change management practices need strengthening.', established: 'Cultural readiness is functional. The organization can absorb change when the rationale is clear and the pace is manageable.' },
      { startup: 'Strong culture for a startup — engaged team, clear roles, and willingness to adapt. Advisory recommendations can be implemented quickly.', 'mid-market': 'Cultural readiness is strong. Engaged employees, clear roles, and innovation appetite create an environment where advisory recommendations translate into action.', established: 'Mature organizational culture supports change. Advisory engagement can leverage cultural strength to drive transformation at scale.' },
      { startup: 'Exceptional cultural maturity for a startup. This is a rare advantage that amplifies every advisory recommendation.', 'mid-market': 'Cultural readiness is excellent. The organization embraces change and has the engagement and role clarity to execute at pace.', established: 'Cultural excellence is a defining organizational strength. Advisory engagement can pursue ambitious transformation with high confidence in execution.' },
    ],
  };

  return templates[catId]?.[level]?.[context] ?? `This category scored ${pct}%.`;
}

/** Generate data-driven improvement actions referencing specific assessment scores */
function getCategoryActions(
  catId: string,
  pct: number,
  workspace: { tools: Record<string, any> },
  metrics: DerivedMetrics,
): string[] {
  const actions: string[] = [];
  const swot = workspace.tools?.swot;
  const dna = workspace.tools?.['leadership-dna'];
  const coherenceLabel = metrics.strategicCoherence.replace(/_/g, ' ');

  if (catId === 'strategic') {
    if (pct < 50) {
      actions.push('Document a 3-year strategic vision with measurable milestones before engaging external advisors.');
      actions.push('Initiate succession planning for key leadership positions within 90 days.');
      if (metrics.executionAmbitionRatio < 0.7) {
        actions.push(`Your Execution-Ambition Ratio of ${metrics.executionAmbitionRatio.toFixed(2)} indicates overextension. Narrow strategic focus to the 2 most critical priorities.`);
      }
    } else if (pct < 70) {
      actions.push('Formalize the competitive advantage statement and validate it against market data.');
      if (metrics.strategicCoherence !== 'aligned' && metrics.strategicCoherence !== 'mostly_aligned') {
        actions.push(`Strategic coherence is "${coherenceLabel}" — reconcile vision pillars with operational priorities before expanding scope.`);
      }
    } else {
      actions.push('Pressure-test the strategic plan with an external advisor to surface blind spots not visible internally.');
    }
  } else if (catId === 'operational') {
    if (pct < 50) {
      actions.push('Document SOPs for the top 5 revenue-critical processes within 60 days.');
      if (metrics.founderDependencyIndex > 5) {
        actions.push(`Founder Dependency Index is ${metrics.founderDependencyIndex.toFixed(1)}/10 — identify 3 decisions that can be delegated this month.`);
      } else {
        actions.push('Implement weekly KPI reviews with the leadership team.');
      }
    } else if (pct < 70) {
      actions.push('Audit existing SOPs and close delegation gaps identified by leadership assessment.');
      if (dna) {
        const empGap = (dna.target_Empowerment ?? 8) - (dna.current_Empowerment ?? 5);
        if (empGap > 2) {
          actions.push(`Leadership Empowerment gap of ${empGap.toFixed(1)} points — build structured delegation frameworks for the 2 most time-consuming operational decisions.`);
        }
      }
    } else {
      actions.push('Conduct an automation audit to identify the next tier of efficiency gains.');
    }
  } else if (catId === 'financial') {
    if (pct < 50) {
      actions.push('Establish monthly P&L delivery by the 15th with a qualified bookkeeper or CFO service.');
      actions.push('Build a 3-month cash reserve as a prerequisite for strategic investment.');
    } else if (pct < 70) {
      actions.push('Implement a monthly budget-vs-actuals review cycle with leadership.');
      const risk = metrics.revenueRiskEstimate;
      actions.push(`Revenue risk estimate of $${Math.round(risk.low / 1000)}K-$${Math.round(risk.high / 1000)}K — benchmark profit margins against industry averages and identify 2 margin-improvement opportunities.`);
    } else {
      actions.push('Leverage strong financial position to model advisory ROI scenarios and quantify expected return on strategic investments.');
    }
  } else if (catId === 'cultural') {
    if (pct < 50) {
      actions.push('Conduct an anonymous employee engagement survey within 30 days.');
      // Reference SWOT weaknesses related to culture
      const weaknesses = swot?.weaknesses as Array<{ text?: string }> | undefined;
      const cultureWeaknesses = weaknesses
        ?.filter((w: { text?: string }) => /culture|engagement|morale|turnover|retention|burnout/i.test(w.text ?? ''))
        .slice(0, 1);
      if (cultureWeaknesses && cultureWeaknesses.length > 0) {
        actions.push(`SWOT analysis flagged "${cultureWeaknesses[0].text}" — address this specific cultural gap before initiating advisory-driven change.`);
      } else {
        actions.push('Clarify and document roles and responsibilities for every team member.');
      }
    } else if (pct < 70) {
      actions.push('Establish a formal feedback loop (monthly town halls or structured suggestion system).');
      if (dna) {
        const adaptability = dna.current_Adaptability ?? 5;
        if (adaptability < 6) {
          actions.push(`Leadership Adaptability score of ${adaptability}/10 limits organizational change capacity. Build change management practices alongside cultural improvement.`);
        }
      }
    } else {
      actions.push('Channel strong culture into change-readiness by identifying internal champions for advisory initiatives.');
    }
  }

  if (actions.length === 0) {
    actions.push('Review this category with your leadership team and identify specific improvement targets.');
  }

  return actions;
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

  // Company context and category extremes for narrative personalization
  const companyContext = useMemo(() => inferCompanyContext(workspace), [workspace]);
  const weakestCategory = useMemo(
    () => [...categoryScores].sort((a, b) => a.percentage - b.percentage)[0],
    [categoryScores],
  );
  const strongestCategory = useMemo(
    () => [...categoryScores].sort((a, b) => b.percentage - a.percentage)[0],
    [categoryScores],
  );

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

        {/* Stage interpretation — varies by score AND company context (ADVR-04) */}
        <ReportCallout className="mb-6">
          {overallStage === 'Foundational' &&
            `At ${overallPct}%, the organization requires foundational investments in strategy, operations, and financial visibility before advisory engagement can deliver returns.${companyContext === 'startup' ? ' This is expected for an early-stage company — focus on the 2-3 highest-impact foundations first.' : companyContext === 'established' ? ' For an established organization, this score indicates systemic gaps that need urgent attention.' : ''}`}
          {overallStage === 'Growing' &&
            `At ${overallPct}%, advisory readiness is developing. Partial foundations exist but significant gaps remain that would limit advisory ROI.${companyContext === 'startup' ? ' Good progress for a young company — targeted improvements will unlock advisory value.' : ''}`}
          {overallStage === 'Developing' &&
            `At ${overallPct}%, the organization has a functional base for advisory engagement. Key gaps in ${weakestCategory?.label ?? 'one category'} (${weakestCategory?.percentage ?? 0}%) should be addressed to maximize advisory impact.`}
          {overallStage === 'Advancing' &&
            `At ${overallPct}%, the organization demonstrates strong readiness for strategic advisory engagement. ${strongestCategory?.label ?? 'Key areas'} (${strongestCategory?.percentage ?? 0}%) is a notable strength, while targeted improvements in ${weakestCategory?.label ?? 'weaker categories'} (${weakestCategory?.percentage ?? 0}%) will maximize advisory ROI.`}
          {overallStage === 'Mature' &&
            `At ${overallPct}%, advisory readiness is strong across all categories. The organization is well-positioned to absorb, execute, and benefit from strategic advisory counsel.${companyContext === 'startup' ? ' This level of maturity in a young company is exceptional.' : ''}`}
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
            const interpretation = getCategoryInterpretation(cat.id, cat.percentage, companyContext);
            const actions = getCategoryActions(cat.id, cat.percentage, workspace, metrics);

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
