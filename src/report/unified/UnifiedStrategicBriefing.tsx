/**
 * Unified Strategic Briefing (USB)
 *
 * Flagship 12-16 page report that synthesizes all 6 assessments into a
 * single narrative-driven strategic briefing. Renders as an HTML div
 * (id="unified-strategic-briefing") for later PDF capture.
 *
 * Sections USB-01 through USB-12 are implemented in order.
 * Conditional sections (Contradictions, Cost) render only when
 * their data prerequisites are met.
 */

import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics, runSynthesis } from '@/engine';
import type { DerivedMetrics, Insight } from '@/engine';
import {
  createNarrativeContext,
  generateNarrative,
  generateMetricInterpretation,
  buildSectionTemplate,
} from '@/report/narrative';
import type { NarrativeContext } from '@/report/narrative';
import {
  ReportPage,
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCaption,
  ReportCallout,
  ReportList,
} from '@/report/components';
import { DotPlot, Gauge } from '@/report/charts';
import { REPORT_COLORS, SEVERITY_COLORS } from '@/report/design';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number as USD currency (e.g., "$125,000") */
function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Map severity string to a display color */
function severityColor(severity: string): string {
  if (severity === 'high') return SEVERITY_COLORS.high;
  if (severity === 'medium') return SEVERITY_COLORS.medium;
  return SEVERITY_COLORS.low;
}

/** Produce a human-readable date string */
function formatDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

/** Three-word descriptors characterizing the business for the executive snapshot */
function deriveDescriptors(metrics: DerivedMetrics): string[] {
  const descriptors: string[] = [];

  // Descriptor 1: based on strategic coherence
  if (metrics.strategicCoherence === 'aligned') descriptors.push('Strategically Aligned');
  else if (metrics.strategicCoherence === 'partially_aligned') descriptors.push('Partially Coherent');
  else descriptors.push('Strategically Fragmented');

  // Descriptor 2: based on founder dependency
  if (metrics.founderDependencyIndex <= 3) descriptors.push('Well-Delegated');
  else if (metrics.founderDependencyIndex <= 6) descriptors.push('Moderately Dependent');
  else descriptors.push('Founder-Dependent');

  // Descriptor 3: based on organizational readiness
  if (metrics.organizationalReadinessScore >= 76) descriptors.push('Change-Ready');
  else if (metrics.organizationalReadinessScore >= 51) descriptors.push('Open to Change');
  else if (metrics.organizationalReadinessScore >= 26) descriptors.push('Change-Cautious');
  else descriptors.push('Change-Resistant');

  return descriptors;
}

// ---------------------------------------------------------------------------
// Sub-components for individual pages / sections
// ---------------------------------------------------------------------------

/** USB-01: Cover Page */
function CoverPage({ clientName, date }: { clientName: string; date: string }) {
  return (
    <ReportPage variant="cover">
      {/* Logo placeholder */}
      <div className="text-7xl font-bold tracking-widest" style={{ color: REPORT_COLORS.white }}>
        VWCG
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-wide" style={{ color: REPORT_COLORS.white }}>
        Strategic Business Assessment
      </h1>

      {/* Client and date */}
      <div className="space-y-2 mt-8">
        <p className="text-xl font-semibold" style={{ color: REPORT_COLORS.white }}>
          Prepared for {clientName}
        </p>
        <p className="text-base opacity-80" style={{ color: REPORT_COLORS.white }}>
          {date}
        </p>
      </div>

      {/* Tagline */}
      <p
        className="text-lg italic mt-12 tracking-wide"
        style={{ color: REPORT_COLORS.white, opacity: 0.7 }}
      >
        Clarity. Strategy. Growth.
      </p>
    </ReportPage>
  );
}

/** USB-02: Executive Snapshot */
function ExecutiveSnapshot({
  ctx,
  metrics,
  insights,
}: {
  ctx: NarrativeContext;
  metrics: DerivedMetrics;
  insights: Insight[];
}) {
  // Generate headline narrative
  const headlineTemplate = buildSectionTemplate('executive-headline', ctx);
  const headlineNarrative = generateNarrative(headlineTemplate, ctx);
  const headlineText =
    headlineNarrative.sections.length > 0
      ? headlineNarrative.sections[0].content
      : 'Assessment data is being compiled.';

  const descriptors = deriveDescriptors(metrics);

  // Vital signs items
  const vitalSigns = [
    {
      label: 'Execution-Ambition Ratio',
      value: metrics.executionAmbitionRatio,
      maxValue: 2,
      interpretation: generateMetricInterpretation('executionAmbitionRatio', metrics.executionAmbitionRatio, ctx),
    },
    {
      label: 'Founder Dependency Index',
      value: metrics.founderDependencyIndex,
      maxValue: 10,
      interpretation: generateMetricInterpretation('founderDependencyIndex', metrics.founderDependencyIndex, ctx),
    },
    {
      label: 'Organizational Readiness',
      value: metrics.organizationalReadinessScore,
      maxValue: 100,
      interpretation: generateMetricInterpretation('organizationalReadinessScore', metrics.organizationalReadinessScore, ctx),
    },
  ];

  // Count high-severity insights for the vital signs summary
  const highCount = insights.filter((i) => i.severity === 'high').length;
  const totalCount = insights.length;

  return (
    <ReportPage variant="standard" pageNumber={2}>
      <ReportSectionTitle>Executive Snapshot</ReportSectionTitle>

      {/* Headline finding */}
      <ReportCallout className="mb-8">{headlineText}</ReportCallout>

      {/* Three-word descriptors */}
      <div className="flex items-center gap-4 mb-8">
        {descriptors.map((descriptor, i) => (
          <span
            key={i}
            className="px-4 py-2 text-sm font-semibold rounded"
            style={{
              backgroundColor: REPORT_COLORS.navy,
              color: REPORT_COLORS.white,
            }}
          >
            {descriptor}
          </span>
        ))}
      </div>

      {/* Vital signs dashboard */}
      <ReportSubsection>Vital Signs</ReportSubsection>
      <div className="space-y-6">
        {vitalSigns.map((sign, i) => (
          <div key={i}>
            <Gauge
              value={sign.value}
              maxValue={sign.maxValue}
              label={sign.label}
              variant="linear"
              className="mb-2"
            />
            <ReportCaption className="block mt-1">{sign.interpretation}</ReportCaption>
          </div>
        ))}

        {/* Insight summary */}
        <div className="pt-4 border-t border-report-warm">
          <ReportBody className="font-semibold">
            Synthesis Findings: {totalCount} insight{totalCount !== 1 ? 's' : ''} identified ({highCount} high-severity)
          </ReportBody>
        </div>

        {/* Leadership archetype */}
        <div className="pt-4 border-t border-report-warm">
          <ReportBody className="font-semibold">
            Leadership Archetype: {metrics.leadershipArchetype.archetype}
          </ReportBody>
          <ReportCaption className="block mt-1">
            {generateMetricInterpretation('leadershipArchetype', '', ctx)}
          </ReportCaption>
        </div>

        {/* Strategic coherence */}
        <div className="pt-4 border-t border-report-warm">
          <ReportBody className="font-semibold">
            Strategic Coherence: {metrics.strategicCoherence === 'aligned' ? 'Aligned' : metrics.strategicCoherence === 'partially_aligned' ? 'Partially Aligned' : 'Misaligned'}
          </ReportBody>
          <ReportCaption className="block mt-1">
            {generateMetricInterpretation('strategicCoherence', metrics.strategicCoherence, ctx)}
          </ReportCaption>
        </div>
      </div>
    </ReportPage>
  );
}

/** USB-03: Where You're Strong */
function StrengthsPage({ ctx }: { ctx: NarrativeContext }) {
  const template = buildSectionTemplate('strengths-narrative', ctx);
  const narrative = generateNarrative(template, ctx);
  const sections = narrative.sections;

  return (
    <ReportPage variant="standard" pageNumber={3}>
      <ReportSectionTitle>Where You Are Strong</ReportSectionTitle>
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {section.content.split('\n\n').map((paragraph, i) => (
            <ReportBody key={i}>{paragraph}</ReportBody>
          ))}
        </div>
      ))}
    </ReportPage>
  );
}

/** USB-04: Where You're Exposed */
function ExposurePage({
  ctx,
  pageStart,
}: {
  ctx: NarrativeContext;
  pageStart: number;
}) {
  const template = buildSectionTemplate('exposure-narrative', ctx);
  const narrative = generateNarrative(template, ctx);
  const sections = narrative.sections;

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>Where You Are Exposed</ReportSectionTitle>
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {section.content.split('\n\n').map((paragraph, i) => (
            <ReportBody key={i}>{paragraph}</ReportBody>
          ))}
        </div>
      ))}
    </ReportPage>
  );
}

/** USB-05: The Contradictions (CONDITIONAL) */
function ContradictionsPage({
  ctx,
  pageStart,
}: {
  ctx: NarrativeContext;
  pageStart: number;
}) {
  const template = buildSectionTemplate('contradictions-narrative', ctx);
  const narrative = generateNarrative(template, ctx);
  const sections = narrative.sections;

  // If the condition filtered out the section, render nothing
  if (sections.length === 0) return null;

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>The Contradictions</ReportSectionTitle>
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {section.content.split('\n\n').map((paragraph, i) => (
            <ReportBody key={i}>{paragraph}</ReportBody>
          ))}
        </div>
      ))}
    </ReportPage>
  );
}

/** USB-06: What This Is Costing You (CONDITIONAL) */
function CostPage({
  ctx,
  metrics,
  pageStart,
}: {
  ctx: NarrativeContext;
  metrics: DerivedMetrics;
  pageStart: number;
}) {
  const businessContext = ctx.workspace.tools?.['business-context'];
  const hasRevenue = Boolean(businessContext?.revenueRange);
  if (!hasRevenue) return null;

  const risk = metrics.revenueRiskEstimate;

  // Compute cost blocks
  const founderBottleneckCost = metrics.founderDependencyIndex > 4
    ? { low: Math.round(risk.low * 0.35), high: Math.round(risk.high * 0.4) }
    : { low: Math.round(risk.low * 0.15), high: Math.round(risk.high * 0.2) };

  const operationalCost = {
    low: Math.round(risk.low * 0.35),
    high: Math.round(risk.high * 0.35),
  };

  const strategicRiskCost = {
    low: Math.round(risk.low * 0.3),
    high: Math.round(risk.high * 0.25),
  };

  const costBlocks = [
    {
      title: 'Founder Bottleneck Cost',
      range: `${formatUSD(founderBottleneckCost.low)} - ${formatUSD(founderBottleneckCost.high)}`,
      description:
        'Revenue at risk from critical decisions and operations routing through a single individual. Includes opportunity cost of the founder spending time on operational tasks instead of strategic growth.',
    },
    {
      title: 'Operational Inefficiency Cost',
      range: `${formatUSD(operationalCost.low)} - ${formatUSD(operationalCost.high)}`,
      description:
        'Revenue impact of undocumented processes, inconsistent execution, and lack of operational scalability. Manifests as rework, missed deadlines, and inability to onboard talent efficiently.',
    },
    {
      title: 'Strategic Risk Exposure',
      range: `${formatUSD(strategicRiskCost.low)} - ${formatUSD(strategicRiskCost.high)}`,
      description:
        'Potential revenue loss from misaligned strategy, unaddressed market threats, and failure to capitalize on identified opportunities within the competitive window.',
    },
  ];

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>What This Is Costing You</ReportSectionTitle>
      <ReportBody className="mb-6">
        Based on your reported revenue range ({businessContext.revenueRange}) and the
        strategic gaps identified across all assessments, this briefing estimates{' '}
        <strong>{formatUSD(risk.low)} to {formatUSD(risk.high)}</strong> in annual
        revenue at risk.
      </ReportBody>

      <div className="space-y-8">
        {costBlocks.map((block, i) => (
          <div
            key={i}
            className="p-6 rounded-lg border-l-4"
            style={{
              borderColor: i === 0 ? REPORT_COLORS.red : i === 1 ? REPORT_COLORS.amber : REPORT_COLORS.blue,
              backgroundColor: REPORT_COLORS.warm,
            }}
          >
            <ReportSubsection>{block.title}</ReportSubsection>
            <ReportHero className="mb-3 text-3xl">{block.range}</ReportHero>
            <ReportBody>{block.description}</ReportBody>
          </div>
        ))}
      </div>

      <ReportCaption className="block mt-6">
        Methodology: Revenue risk is estimated by combining SWOT threat severity,
        Founder Dependency Index, operational maturity indicators, and financial
        health buffer scores. Ranges represent conservative (low) and aggressive
        (high) scenarios. These are directional estimates, not precise forecasts.
      </ReportCaption>
    </ReportPage>
  );
}

/** USB-07: Benchmarking Context */
function BenchmarkingPage({
  ctx,
  pageStart,
}: {
  ctx: NarrativeContext;
  pageStart: number;
}) {
  const advisor = ctx.workspace.tools?.['advisor-readiness'];
  const aiReadiness = ctx.workspace.tools?.['ai-readiness'];
  const dna = ctx.workspace.tools?.['leadership-dna'];
  const swot = ctx.workspace.tools?.swot;

  // Compute advisor readiness average
  let advisorAvg = 0;
  if (advisor?.answers) {
    const scores = Object.values(advisor.answers as Record<string, number>).filter(
      (v): v is number => typeof v === 'number'
    );
    advisorAvg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  }

  // Compute AI readiness average
  let aiAvg = 0;
  const aiDimensions = ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture'] as const;
  if (aiReadiness) {
    const aiScores = aiDimensions
      .filter((d) => typeof aiReadiness[d] === 'number')
      .map((d) => aiReadiness[d] as number);
    aiAvg = aiScores.length > 0 ? aiScores.reduce((s, v) => s + v, 0) / aiScores.length : 0;
  }

  // Leadership DNA average current
  let leadershipAvg = 0;
  const ldDimensions = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'] as const;
  if (dna) {
    const ldScores = ldDimensions
      .filter((d) => typeof dna[`current_${d}`] === 'number')
      .map((d) => dna[`current_${d}`] as number);
    leadershipAvg = ldScores.length > 0 ? ldScores.reduce((s, v) => s + v, 0) / ldScores.length : 0;
  }

  // SWOT risk profile: ratio of weaknesses + threats to total items
  let swotRiskRatio = 0;
  if (swot) {
    const sCount = Array.isArray(swot.strengths) ? swot.strengths.length : 0;
    const wCount = Array.isArray(swot.weaknesses) ? swot.weaknesses.length : 0;
    const oCount = Array.isArray(swot.opportunities) ? swot.opportunities.length : 0;
    const tCount = Array.isArray(swot.threats) ? swot.threats.length : 0;
    const total = sCount + wCount + oCount + tCount;
    swotRiskRatio = total > 0 ? ((wCount + tCount) / total) * 100 : 50;
  }

  // General SMB benchmarks
  const smBenchmarks = {
    advisorReadiness: [
      { value: 2.5, label: 'Avg SMB' },
      { value: 4.0, label: 'Top 25%' },
    ],
    aiReadiness: [
      { value: 30, label: 'Avg SMB' },
      { value: 65, label: 'Top 25%' },
    ],
    leadershipDna: [
      { value: 5.0, label: 'Avg SMB' },
      { value: 7.5, label: 'Top 25%' },
    ],
    swotRisk: [
      { value: 45, label: 'Balanced' },
      { value: 65, label: 'High-Risk' },
    ],
  };

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>Benchmarking Context</ReportSectionTitle>
      <ReportBody className="mb-8">
        These benchmarks compare your assessment scores against general SMB
        averages and top-quartile performers. Use them as directional
        indicators, not absolute standards.
      </ReportBody>

      <div className="space-y-10">
        {/* Advisor Readiness */}
        <DotPlot
          value={advisorAvg}
          min={0}
          max={5}
          benchmarks={smBenchmarks.advisorReadiness}
          label="Advisor Readiness (avg score)"
        />

        {/* AI Readiness */}
        <DotPlot
          value={aiAvg}
          min={0}
          max={100}
          benchmarks={smBenchmarks.aiReadiness}
          label="AI Readiness (%)"
        />

        {/* Leadership DNA */}
        <DotPlot
          value={leadershipAvg}
          min={0}
          max={10}
          benchmarks={smBenchmarks.leadershipDna}
          label="Leadership DNA (avg current score)"
        />

        {/* SWOT Risk Profile */}
        <DotPlot
          value={swotRiskRatio}
          min={0}
          max={100}
          benchmarks={smBenchmarks.swotRisk}
          label="SWOT Risk Profile (% risk items)"
        />
      </div>

      <ReportCaption className="block mt-8">
        Benchmarks sourced from general SMB population data. Industry-specific
        benchmarks will replace these when available for your sector.
      </ReportCaption>
    </ReportPage>
  );
}

/** USB-08: Top 3 Prioritized Recommendations */
function RecommendationsPage({
  insights,
  pageStart,
}: {
  insights: Insight[];
  pageStart: number;
}) {
  // Take top 3 high-severity insights
  const highInsights = insights.filter((i) => i.severity === 'high');
  const topInsights = highInsights.length >= 3
    ? highInsights.slice(0, 3)
    : [...highInsights, ...insights.filter((i) => i.severity === 'medium')].slice(0, 3);

  if (topInsights.length === 0) {
    return (
      <ReportPage variant="standard" pageNumber={pageStart}>
        <ReportSectionTitle>Top Prioritized Recommendations</ReportSectionTitle>
        <ReportBody>
          No critical findings require immediate prioritization. The primary
          opportunity is acceleration and refinement of existing strengths. As
          more assessment data is entered, specific recommendations will
          surface.
        </ReportBody>
      </ReportPage>
    );
  }

  return (
    <>
      <ReportPage variant="standard" pageNumber={pageStart}>
        <ReportSectionTitle>Top 3 Prioritized Recommendations</ReportSectionTitle>
        <ReportBody className="mb-8">
          These recommendations emerge directly from the assessment findings.
          They are sequenced by strategic urgency: resolve the first before
          investing in the second.
        </ReportBody>

        {topInsights.map((insight, i) => (
          <div
            key={insight.id}
            className="mb-8 p-6 rounded-lg"
            style={{ backgroundColor: REPORT_COLORS.warm }}
          >
            {/* Recommendation number and title */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: severityColor(insight.severity),
                  color: REPORT_COLORS.white,
                }}
              >
                {i + 1}
              </div>
              <div>
                <ReportSubsection>{insight.title}</ReportSubsection>
                <ReportCaption className="block">
                  Severity: {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} |
                  Related tools: {insight.relatedTools.join(', ')}
                </ReportCaption>
              </div>
            </div>

            {/* Why This First */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-report-navy">Why This First: </span>
              <ReportBody className="inline">{insight.message}</ReportBody>
            </div>

            {/* What It Looks Like */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-report-navy">What It Looks Like: </span>
              <ReportBody className="inline">
                {insight.type === 'risk'
                  ? 'Unresolved, this risk compounds over time and limits your ability to pursue growth initiatives with confidence.'
                  : insight.type === 'conflict'
                    ? 'This internal contradiction creates confusion in the team and erodes trust in strategic direction.'
                    : 'Addressing this gap opens capacity for the recommendations that follow.'}
              </ReportBody>
            </div>

            {/* Estimated Impact */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-report-navy">Estimated Impact: </span>
              <ReportBody className="inline">
                {insight.severity === 'high'
                  ? 'Significant -- affects multiple strategic areas and has compounding consequences if delayed.'
                  : 'Moderate -- targeted improvement with measurable outcomes within 60-90 days.'}
              </ReportBody>
            </div>

            {/* First Step */}
            <div>
              <span className="text-sm font-semibold text-report-navy">First Step: </span>
              <ReportBody className="inline">{insight.recommendation}</ReportBody>
            </div>
          </div>
        ))}
      </ReportPage>
    </>
  );
}

/** USB-09: 90-Day Quick Wins */
function QuickWinsPage({
  insights,
  ctx,
  pageStart,
}: {
  insights: Insight[];
  ctx: NarrativeContext;
  pageStart: number;
}) {
  // Derive quick wins from insights and roadmap
  const roadmap = ctx.workspace.tools?.roadmap;
  const roadmapTasks = (roadmap?.tasks ?? []) as Array<{ title?: string; owner?: string }>;

  // Build time-boxed actions from available data
  const week12Actions: string[] = [];
  const week34Actions: string[] = [];
  const week58Actions: string[] = [];

  // Prioritize from highest-severity insights
  const actionableInsights = insights.filter((i) => i.recommendation);

  if (actionableInsights.length > 0) {
    week12Actions.push(actionableInsights[0].recommendation);
  }
  if (actionableInsights.length > 1) {
    week34Actions.push(actionableInsights[1].recommendation);
  }
  if (actionableInsights.length > 2) {
    week58Actions.push(actionableInsights[2].recommendation);
  }

  // Fill from roadmap tasks
  const usedTitles = new Set<string>();
  for (const task of roadmapTasks.slice(0, 6)) {
    const title = task.title ?? '';
    if (!title || usedTitles.has(title)) continue;
    usedTitles.add(title);
    if (week12Actions.length < 2) week12Actions.push(title);
    else if (week34Actions.length < 2) week34Actions.push(title);
    else if (week58Actions.length < 2) week58Actions.push(title);
  }

  // Fallback content if no data
  if (week12Actions.length === 0) week12Actions.push('Conduct a leadership alignment session to review these findings with your core team.');
  if (week34Actions.length === 0) week34Actions.push('Identify and document the 3 most critical undocumented processes.');
  if (week58Actions.length === 0) week58Actions.push('Implement one delegation change to reduce single-point-of-failure risk.');

  const phases = [
    {
      label: 'Week 1-2',
      title: 'Immediate Alignment',
      actions: week12Actions,
      outcome: 'Shared understanding of priorities and clear ownership of first actions.',
    },
    {
      label: 'Week 3-4',
      title: 'Foundation Building',
      actions: week34Actions,
      outcome: 'Operational gaps addressed and key processes documented or improved.',
    },
    {
      label: 'Week 5-8',
      title: 'Momentum and Measurement',
      actions: week58Actions,
      outcome: 'Measurable progress on strategic priorities with tracking in place.',
    },
  ];

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>90-Day Quick Wins</ReportSectionTitle>
      <ReportBody className="mb-8">
        Three time-boxed action phases to translate this briefing into
        operational progress. Each phase builds on the previous one.
      </ReportBody>

      <div className="space-y-8">
        {phases.map((phase, i) => (
          <div
            key={i}
            className="p-6 rounded-lg border-l-4"
            style={{
              borderColor: REPORT_COLORS.blue,
              backgroundColor: REPORT_COLORS.warm,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 text-xs font-bold rounded"
                style={{ backgroundColor: REPORT_COLORS.navy, color: REPORT_COLORS.white }}
              >
                {phase.label}
              </span>
              <ReportSubsection className="mb-0">{phase.title}</ReportSubsection>
            </div>

            <ReportList>
              {phase.actions.map((action, j) => (
                <li key={j}>{action}</li>
              ))}
            </ReportList>

            <div className="mt-3 pt-3 border-t border-report-warm">
              <ReportCaption className="block">
                <strong>Expected Outcome:</strong> {phase.outcome}
              </ReportCaption>
            </div>
          </div>
        ))}
      </div>
    </ReportPage>
  );
}

/** USB-10: How to Use This Briefing */
function HowToUsePage({ pageStart }: { pageStart: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>How to Use This Briefing</ReportSectionTitle>

      <div className="space-y-6">
        <ReportBody>
          This Strategic Business Assessment is designed as a decision-making
          tool, not a shelf document. The findings and recommendations within
          these pages will deliver maximum value when acted upon within the
          first 90 days.
        </ReportBody>

        <ReportSubsection>Recommended Reading Path</ReportSubsection>
        <ReportList variant="number">
          <li>
            <strong>Start with the Executive Snapshot</strong> (page 2) to
            understand the headline finding and vital signs at a glance.
          </li>
          <li>
            <strong>Review Strengths and Exposure</strong> (pages 3-5) to
            understand the full picture before jumping to solutions.
          </li>
          <li>
            <strong>Study the Top 3 Recommendations</strong> to identify where
            your first investment of time and resources should go.
          </li>
          <li>
            <strong>Use the 90-Day Quick Wins</strong> as your operational
            implementation plan for the next quarter.
          </li>
        </ReportList>

        <ReportSubsection>Sharing This Briefing</ReportSubsection>
        <ReportBody>
          Share the Executive Snapshot and Recommendations sections with your
          leadership team. The full briefing, including benchmarking and cost
          analysis, is best discussed in a facilitated strategy session.
        </ReportBody>

        <ReportCallout>
          This briefing is most powerful when combined with expert facilitation.
          A strategic advisor can help translate findings into a customized
          implementation plan tailored to your organization&apos;s pace,
          culture, and competitive landscape.
        </ReportCallout>

        <ReportSubsection>Keeping This Briefing Current</ReportSubsection>
        <ReportBody>
          Assessment data evolves as your business changes. Revisit and update
          individual assessments quarterly. Each update recalculates your
          derived metrics and generates updated insights, keeping this briefing
          a living strategic document.
        </ReportBody>
      </div>
    </ReportPage>
  );
}

/** USB-11: Individual Report Downloads */
function ReportDownloadsPage({ pageStart }: { pageStart: number }) {
  const reports = [
    {
      name: 'Leadership DNA Profile',
      description: 'Detailed leadership archetype analysis with dimension-by-dimension scoring and development recommendations.',
    },
    {
      name: 'Vision Canvas Report',
      description: 'North Star alignment, strategic pillar evaluation, and values coherence analysis.',
    },
    {
      name: 'SWOT Analysis Report',
      description: 'Full internal and external environment assessment with keyword analysis and competitive positioning.',
    },
    {
      name: 'AI Readiness Assessment',
      description: 'Six-dimension AI maturity evaluation with adoption roadmap and investment priorities.',
    },
    {
      name: 'Advisor Readiness Report',
      description: 'Organizational readiness for external advisory engagement with operational maturity scoring.',
    },
    {
      name: '90-Day Roadmap Report',
      description: 'Task-level execution plan with owner assignments, dependencies, and progress tracking.',
    },
  ];

  return (
    <ReportPage variant="standard" pageNumber={pageStart}>
      <ReportSectionTitle>Individual Assessment Reports</ReportSectionTitle>
      <ReportBody className="mb-8">
        Each assessment generates a detailed standalone report. These dive
        deeper into specific areas than this unified briefing covers. Use them
        for departmental planning, team development, or stakeholder
        communication.
      </ReportBody>

      <div className="space-y-4">
        {reports.map((report, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg"
            style={{ backgroundColor: REPORT_COLORS.warm }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: REPORT_COLORS.navy, color: REPORT_COLORS.white }}
            >
              {i + 1}
            </div>
            <div>
              <ReportBody className="font-semibold">{report.name}</ReportBody>
              <ReportCaption className="block mt-1">{report.description}</ReportCaption>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg border" style={{ borderColor: REPORT_COLORS.blue }}>
        <ReportSubsection>Sharing Guidance</ReportSubsection>
        <ReportBody>
          Share the Unified Strategic Briefing with decision-makers and board
          members. Share individual reports with the teams and stakeholders
          responsible for each area. Avoid sharing cost analysis and
          benchmarking data externally without context.
        </ReportBody>
      </div>
    </ReportPage>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * UnifiedStrategicBriefing
 *
 * Renders the complete 12-16 page Unified Strategic Briefing.
 * Reads workspace data from the Zustand store, computes derived metrics
 * and synthesis insights, then renders each section in order.
 *
 * Conditional sections:
 * - Contradictions: only when >= 2 conflict insights exist
 * - Cost: only when revenue data (business-context.revenueRange) exists
 */
export function UnifiedStrategicBriefing() {
  // Read workspace data from store
  const tools = useWorkspaceStore((state) => state.tools);
  const metadata = useWorkspaceStore((state) => state.metadata);
  const storeInsights = useWorkspaceStore((state) => state.insights);

  // Build workspace object for engine functions
  const workspace = useMemo(
    () => ({ tools, metadata }),
    [tools, metadata]
  );

  // Compute derived metrics
  const metrics = useMemo(
    () => computeDerivedMetrics(workspace),
    [workspace]
  );

  // Run synthesis (or fall back to store insights)
  const insights = useMemo(() => {
    const computed = runSynthesis(workspace);
    return computed.length > 0 ? computed : storeInsights;
  }, [workspace, storeInsights]);

  // Build narrative context
  const clientName = metadata?.name || 'Your Organization';
  const ctx = useMemo(
    () => createNarrativeContext(workspace, metrics, insights, clientName),
    [workspace, metrics, insights, clientName]
  );

  // Determine which conditional sections render
  const hasContradictions = insights.filter((i) => i.type === 'conflict').length >= 2;
  const businessContext = tools?.['business-context'];
  const hasRevenue = Boolean(businessContext?.revenueRange);

  // Compute sequential page numbers
  // Fixed pages: Cover(1), Executive(2), Strengths(3), Exposure(4-5)
  let nextPage = 5;

  const contradictionsPage = hasContradictions ? nextPage++ : -1;
  const costPage = hasRevenue ? nextPage++ : -1;
  const benchmarkingPage = nextPage++;
  const recommendationsPage = nextPage++;
  // Recommendations may span 2 pages
  nextPage++;
  const quickWinsPage = nextPage++;
  const howToUsePage = nextPage++;
  const downloadsPage = nextPage++;

  return (
    <div id="unified-strategic-briefing" className="bg-white">
      {/* USB-01: Cover Page */}
      <CoverPage
        clientName={clientName}
        date={formatDate(metadata?.createdAt)}
      />

      {/* USB-02: Executive Snapshot */}
      <ExecutiveSnapshot
        ctx={ctx}
        metrics={metrics}
        insights={insights}
      />

      {/* USB-03: Where You're Strong */}
      <StrengthsPage ctx={ctx} />

      {/* USB-04: Where You're Exposed */}
      <ExposurePage ctx={ctx} pageStart={4} />

      {/* USB-05: The Contradictions (CONDITIONAL) */}
      {hasContradictions && (
        <ContradictionsPage ctx={ctx} pageStart={contradictionsPage} />
      )}

      {/* USB-06: What This Is Costing You (CONDITIONAL) */}
      {hasRevenue && (
        <CostPage ctx={ctx} metrics={metrics} pageStart={costPage} />
      )}

      {/* USB-07: Benchmarking Context */}
      <BenchmarkingPage ctx={ctx} pageStart={benchmarkingPage} />

      {/* USB-08: Top 3 Prioritized Recommendations */}
      <RecommendationsPage insights={insights} pageStart={recommendationsPage} />

      {/* USB-09: 90-Day Quick Wins */}
      <QuickWinsPage insights={insights} ctx={ctx} pageStart={quickWinsPage} />

      {/* USB-10: How to Use This Briefing */}
      <HowToUsePage pageStart={howToUsePage} />

      {/* USB-11: Individual Report Downloads */}
      <ReportDownloadsPage pageStart={downloadsPage} />
    </div>
  );
}
