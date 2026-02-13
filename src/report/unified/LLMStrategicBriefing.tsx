/**
 * LLM Strategic Briefing
 *
 * AI-generated strategic briefing using ChatGPT for narrative generation.
 * Renders the LLM-generated BriefingNarrative using existing report design system.
 */

import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics } from '@/engine';
import type { DerivedMetrics } from '@/engine';
import type { BriefingNarrative } from '@/engine/llm';
import {
  ReportPage,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCaption,
  ReportCallout,
} from '@/report/components';
import { DotPlot, Gauge } from '@/report/charts';
import { REPORT_COLORS, SEVERITY_COLORS } from '@/report/design';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Produce a human-readable date string */
function formatDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

/**
 * Helper: Render markdown-formatted text (bold, italic, paragraph breaks)
 * Converts **bold** and *italic* syntax to React elements
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((paragraph, pIndex) => {
    // Parse inline markdown
    const parts: React.ReactNode[] = [];
    let remaining = paragraph;
    let key = 0;

    while (remaining.length > 0) {
      // Check for **bold**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before bold
        if (boldMatch.index > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        // Add bold text
        parts.push(
          <strong key={`${pIndex}-${key++}`} style={{ fontWeight: 600 }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Check for *italic*
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        // Add text before italic
        if (italicMatch.index > 0) {
          parts.push(remaining.substring(0, italicMatch.index));
        }
        // Add italic text
        parts.push(
          <em key={`${pIndex}-${key++}`} style={{ fontStyle: 'italic' }}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No more markdown found, add remaining text
      parts.push(remaining);
      break;
    }

    return <ReportBody key={pIndex}>{parts}</ReportBody>;
  });
}

// ---------------------------------------------------------------------------
// Sub-components for individual pages
// ---------------------------------------------------------------------------

/** Cover Page */
function CoverPage({ clientName, date }: { clientName: string; date: string }) {
  return (
    <ReportPage variant="cover">
      <div className="text-7xl font-bold tracking-widest" style={{ color: REPORT_COLORS.white }}>
        VWCG
      </div>

      <h1 className="text-3xl font-bold tracking-wide" style={{ color: REPORT_COLORS.white }}>
        Strategic Business Assessment
      </h1>

      <div className="space-y-2 mt-8">
        <p className="text-xl font-semibold" style={{ color: REPORT_COLORS.white }}>
          Prepared for {clientName}
        </p>
        <p className="text-base opacity-80" style={{ color: REPORT_COLORS.white }}>
          {date}
        </p>
      </div>

      <p className="text-lg italic mt-12 tracking-wide" style={{ color: REPORT_COLORS.white, opacity: 0.7 }}>
        AI-Powered Strategic Narrative
      </p>
    </ReportPage>
  );
}

/** Executive Snapshot */
function ExecutiveSnapshot({
  narrative,
  metrics,
}: {
  narrative: BriefingNarrative;
  metrics: DerivedMetrics;
}) {
  const vitalSigns = [
    {
      label: 'Execution-Ambition Ratio',
      value: metrics.executionAmbitionRatio,
      maxValue: 2,
    },
    {
      label: 'Founder Dependency Index',
      value: metrics.founderDependencyIndex,
      maxValue: 10,
    },
    {
      label: 'Organizational Readiness',
      value: metrics.organizationalReadinessScore,
      maxValue: 100,
    },
  ];

  return (
    <ReportPage variant="standard" pageNumber={2}>
      <ReportSectionTitle>Executive Snapshot</ReportSectionTitle>

      {/* Headline finding */}
      <ReportCallout className="mb-8">{narrative.headline_finding}</ReportCallout>

      {/* Three-word descriptors */}
      <div className="flex items-center gap-4 mb-8">
        {narrative.three_words.map((word, i) => (
          <span
            key={i}
            className="px-4 py-2 text-sm font-semibold rounded"
            style={{
              backgroundColor: REPORT_COLORS.navy,
              color: REPORT_COLORS.white,
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Vital signs dashboard */}
      <ReportSubsection>Vital Signs</ReportSubsection>
      <div className="space-y-6">
        {vitalSigns.map((sign, i) => (
          <div key={i}>
            <Gauge value={sign.value} maxValue={sign.maxValue} label={sign.label} variant="linear" className="mb-2" />
          </div>
        ))}

        {/* Leadership archetype */}
        <div className="pt-4 border-t border-report-warm">
          <ReportBody className="font-semibold">Leadership Archetype: {metrics.leadershipArchetype.archetype}</ReportBody>
          <ReportCaption className="block mt-1">{metrics.leadershipArchetype.description}</ReportCaption>
        </div>

        {/* Strategic coherence */}
        <div className="pt-4 border-t border-report-warm">
          <ReportBody className="font-semibold">
            Strategic Coherence:{' '}
            {metrics.strategicCoherence === 'aligned'
              ? 'Aligned'
              : metrics.strategicCoherence === 'partially_aligned'
                ? 'Partially Aligned'
                : 'Misaligned'}
          </ReportBody>
          <ReportCaption className="block mt-1">{metrics.strategicCoherenceDetails}</ReportCaption>
        </div>
      </div>
    </ReportPage>
  );
}

/** Where You Are Strong */
function StrengthsPage({ narrative }: { narrative: BriefingNarrative }) {
  return (
    <ReportPage variant="standard" pageNumber={3}>
      <ReportSectionTitle>Where You Are Strong</ReportSectionTitle>
      <div className="space-y-4">{renderMarkdown(narrative.strengths_narrative)}</div>
    </ReportPage>
  );
}

/** Where You Are Exposed */
function ExposurePage({ narrative, pageNumber }: { narrative: BriefingNarrative; pageNumber: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>Where You Are Exposed</ReportSectionTitle>
      <div className="space-y-4">{renderMarkdown(narrative.exposure_narrative)}</div>
    </ReportPage>
  );
}

/** The Contradictions */
function ContradictionsPage({ narrative, pageNumber }: { narrative: BriefingNarrative; pageNumber: number }) {
  if (!narrative.contradictions || narrative.contradictions.length === 0) {
    return null;
  }

  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>The Contradictions</ReportSectionTitle>
      <div className="space-y-8">
        {narrative.contradictions.map((contradiction, i) => (
          <div key={i}>
            <ReportSubsection>{contradiction.title}</ReportSubsection>
            <div className="space-y-4 mt-2">{renderMarkdown(contradiction.narrative)}</div>
          </div>
        ))}
      </div>
    </ReportPage>
  );
}

/** What This Is Costing You */
function CostPage({ narrative, pageNumber }: { narrative: BriefingNarrative; pageNumber: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>What This Is Costing You</ReportSectionTitle>
      <div className="space-y-6">
        {narrative.financial_impact.map((impact, i) => (
          <div
            key={i}
            className="p-6 rounded-lg"
            style={{
              backgroundColor: REPORT_COLORS.warm,
              borderLeft: `4px solid ${SEVERITY_COLORS.high}`,
            }}
          >
            <div className="text-6xl font-bold leading-tight" style={{ color: SEVERITY_COLORS.high }}>
              {impact.amount_range}
            </div>
            <ReportBody className="font-semibold mt-2">{impact.label}</ReportBody>
            <ReportCaption className="block mt-2">{impact.explanation}</ReportCaption>
          </div>
        ))}

        {/* Total summary */}
        <div className="pt-6 border-t border-report-navy">
          <ReportCallout>{narrative.financial_impact_total}</ReportCallout>
        </div>
      </div>
    </ReportPage>
  );
}

/** Benchmarking Context (with DotPlot charts + LLM interpretation) */
function BenchmarkingPage({ narrative, pageNumber, tools }: { narrative: BriefingNarrative; pageNumber: number; tools: Record<string, any> }) {
  // Extract scores from tools for DotPlot charts
  const advisorData = tools['advisor-readiness'] || {};
  const aiData = tools['ai-readiness'] || {};
  const dnaData = tools['leadership-dna'] || {};
  const swotData = tools['swot'] || {};

  // Advisor Readiness score
  const advisorScore = advisorData.overallScore || 50;

  // AI Readiness average
  const aiScores = [
    aiData.Strategy ?? 0,
    aiData.Data ?? 0,
    aiData.Infrastructure ?? 0,
    aiData.Talent ?? 0,
    aiData.Governance ?? 0,
    aiData.Culture ?? 0,
  ];
  const aiAverage = Math.round(aiScores.reduce((sum, val) => sum + val, 0) / 6);

  // Leadership DNA average current score
  const dnaScores = [
    dnaData.current_Vision ?? 5,
    dnaData.current_Execution ?? 5,
    dnaData.current_Empowerment ?? 5,
    dnaData.current_Decisiveness ?? 5,
    dnaData.current_Adaptability ?? 5,
    dnaData.current_Integrity ?? 5,
  ];
  const dnaAverage = Math.round((dnaScores.reduce((sum, val) => sum + val, 0) / 6 / 10) * 100);

  // SWOT risk profile (high-impact threats / total threats)
  const threats = swotData.threats || [];
  const highImpactThreats = threats.filter((t: any) => t.impact === 'High' || (t.confidence && t.confidence >= 4));
  const swotRiskScore = threats.length > 0 ? Math.round((highImpactThreats.length / threats.length) * 100) : 0;

  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>Benchmarking Context</ReportSectionTitle>

      <div className="space-y-8">
        {/* Advisor Readiness */}
        <div>
          <ReportSubsection>Advisor Readiness</ReportSubsection>
          <DotPlot
            value={advisorScore}
            min={0}
            max={100}
            label="Overall Readiness"
            benchmarks={[{ value: 50, label: 'Peer Median' }]}
            className="mb-2"
          />
          <ReportCaption className="block mt-2">{narrative.benchmarking_interpretations.advisor_readiness}</ReportCaption>
        </div>

        {/* AI Readiness */}
        <div>
          <ReportSubsection>AI Readiness</ReportSubsection>
          <DotPlot
            value={aiAverage}
            min={0}
            max={100}
            label="AI Readiness Score"
            benchmarks={[{ value: 50, label: 'Peer Median' }]}
            className="mb-2"
          />
          <ReportCaption className="block mt-2">{narrative.benchmarking_interpretations.ai_readiness}</ReportCaption>
        </div>

        {/* Leadership DNA */}
        <div>
          <ReportSubsection>Leadership DNA</ReportSubsection>
          <DotPlot
            value={dnaAverage}
            min={0}
            max={100}
            label="Leadership Score"
            benchmarks={[{ value: 70, label: 'Target Excellence' }]}
            className="mb-2"
          />
          <ReportCaption className="block mt-2">{narrative.benchmarking_interpretations.leadership_dna}</ReportCaption>
        </div>

        {/* SWOT Risk Profile */}
        <div>
          <ReportSubsection>SWOT Risk Profile</ReportSubsection>
          <DotPlot
            value={swotRiskScore}
            min={0}
            max={100}
            label="Threat Severity"
            benchmarks={[{ value: 30, label: 'Acceptable Risk' }]}
            className="mb-2"
          />
          <ReportCaption className="block mt-2">{narrative.benchmarking_interpretations.swot_risk_profile}</ReportCaption>
        </div>
      </div>
    </ReportPage>
  );
}

/** Top 3 Recommendations */
function RecommendationsPage({ narrative, pageNumber }: { narrative: BriefingNarrative; pageNumber: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>Top 3 Recommendations</ReportSectionTitle>
      <div className="space-y-8">
        {narrative.recommendations.map((rec, i) => (
          <div
            key={i}
            className="p-6 rounded-lg"
            style={{
              backgroundColor: REPORT_COLORS.warm,
              borderLeft: `4px solid ${REPORT_COLORS.navy}`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: REPORT_COLORS.navy,
                  color: REPORT_COLORS.white,
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <ReportBody className="font-bold text-lg mb-4">{rec.title}</ReportBody>

                <div className="space-y-4">
                  <div>
                    <ReportCaption className="font-semibold">Why This First:</ReportCaption>
                    <ReportBody className="mt-1">{rec.why_first}</ReportBody>
                  </div>

                  <div>
                    <ReportCaption className="font-semibold">What It Looks Like:</ReportCaption>
                    <ReportBody className="mt-1">{rec.what_it_looks_like}</ReportBody>
                  </div>

                  <div>
                    <ReportCaption className="font-semibold">Estimated Impact:</ReportCaption>
                    <ReportBody className="mt-1">{rec.estimated_impact}</ReportBody>
                  </div>

                  <div
                    className="p-3 rounded"
                    style={{ backgroundColor: REPORT_COLORS.white, border: `1px solid ${REPORT_COLORS.navy}` }}
                  >
                    <ReportCaption className="font-semibold">First Step This Week:</ReportCaption>
                    <ReportBody className="mt-1">{rec.first_step}</ReportBody>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ReportPage>
  );
}

/** 90-Day Quick Wins */
function QuickWinsPage({ narrative, pageNumber }: { narrative: BriefingNarrative; pageNumber: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>90-Day Quick Wins</ReportSectionTitle>
      <div className="space-y-6">
        {narrative.quick_wins.map((win, i) => (
          <div
            key={i}
            className="p-6 rounded-lg"
            style={{
              backgroundColor: REPORT_COLORS.warm,
              borderLeft: `4px solid ${SEVERITY_COLORS.medium}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 text-xs font-bold rounded"
                style={{
                  backgroundColor: REPORT_COLORS.navy,
                  color: REPORT_COLORS.white,
                }}
              >
                {win.phase}
              </span>
              <ReportBody className="font-bold">{win.title}</ReportBody>
            </div>
            <ReportBody>{win.description}</ReportBody>
          </div>
        ))}
      </div>
    </ReportPage>
  );
}

/** How to Use This Report (static content) */
function HowToUsePage({ pageNumber }: { pageNumber: number }) {
  return (
    <ReportPage variant="standard" pageNumber={pageNumber}>
      <ReportSectionTitle>How to Use This Report</ReportSectionTitle>
      <div className="space-y-4">
        <ReportBody>
          This AI-generated strategic briefing synthesizes data from six assessment modules to provide a comprehensive
          view of your business's current state and strategic opportunities.
        </ReportBody>
        <ReportBody>
          <strong>Start with the recommendations.</strong> These are sequenced by strategic urgency and include
          specific first steps you can take this week.
        </ReportBody>
        <ReportBody>
          <strong>Review the contradictions section.</strong> These highlight internal misalignments that may be
          limiting growth or creating organizational friction.
        </ReportBody>
        <ReportBody>
          <strong>Use the benchmarking context</strong> to understand how your scores compare to peer organizations in
          similar stages of growth.
        </ReportBody>
        <ReportBody>
          <strong>Revisit the financial impact section</strong> when making budget decisions. These estimates are
          directional indicators to help prioritize investments.
        </ReportBody>
      </div>
    </ReportPage>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export interface LLMStrategicBriefingProps {
  narrative: BriefingNarrative;
}

export function LLMStrategicBriefing({ narrative }: LLMStrategicBriefingProps) {
  const { tools, metadata } = useWorkspaceStore();

  // Compute derived metrics for vital signs and benchmarking
  const metrics = useMemo(() => computeDerivedMetrics({ tools, metadata }), [tools, metadata]);

  const clientName = metadata.name || 'Client';
  const date = formatDate(metadata.lastModified || metadata.createdAt);

  // Page numbering
  let pageNumber = 2; // Cover is page 1, Executive Snapshot is page 2

  return (
    <div id="llm-strategic-briefing" className="space-y-0">
      <CoverPage clientName={clientName} date={date} />
      <ExecutiveSnapshot narrative={narrative} metrics={metrics} />
      <StrengthsPage narrative={narrative} />
      <ExposurePage narrative={narrative} pageNumber={(pageNumber += 1)} />
      {narrative.contradictions && narrative.contradictions.length > 0 && (
        <ContradictionsPage narrative={narrative} pageNumber={(pageNumber += 1)} />
      )}
      <CostPage narrative={narrative} pageNumber={(pageNumber += 1)} />
      <BenchmarkingPage narrative={narrative} pageNumber={(pageNumber += 1)} tools={tools} />
      <RecommendationsPage narrative={narrative} pageNumber={(pageNumber += 1)} />
      <QuickWinsPage narrative={narrative} pageNumber={(pageNumber += 1)} />
      <HowToUsePage pageNumber={(pageNumber += 1)} />
    </div>
  );
}
