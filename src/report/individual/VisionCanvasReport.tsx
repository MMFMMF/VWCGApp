/**
 * Vision Canvas Individual Report (VIS-01 through VIS-04)
 *
 * Consulting-grade assessment of strategic vision clarity, pillar alignment,
 * vision-reality gaps, and core values operationalization status.
 *
 * Pages:
 *   VIS-01  Cover page
 *   VIS-02  Vision Assessment (north star, clarity rating, pillar analysis)
 *   VIS-03  Vision Reality Gap (requirements vs current state)
 *   VIS-04  Core Values Audit (operationalized vs aspirational)
 */

import { useWorkspaceStore } from '@/store/workspaceStore';
import {
  ReportPage,
  ReportHero,
  ReportSectionTitle,
  ReportSubsection,
  ReportBody,
  ReportCallout,
  ReportTable,
  ReportTableHeader,
  ReportTableRow,
  ReportTableCell,
} from '@/report/components';
import { REPORT_COLORS } from '@/report/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VisionPillar {
  name: string;
  kpi?: string;
}

interface SwotEntry {
  text: string;
}

interface SwotData {
  strengths: SwotEntry[];
  weaknesses: SwotEntry[];
  opportunities: SwotEntry[];
  threats: SwotEntry[];
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

type ClarityRating = 'Clear' | 'Directional' | 'Vague';

// ---------------------------------------------------------------------------
// Helper: Assess vision clarity
// ---------------------------------------------------------------------------

const GENERIC_TERMS = [
  'best',
  'leading',
  'world-class',
  'innovative',
  'excellent',
  'top',
  'premier',
  'great',
  'amazing',
  'outstanding',
];

const MEASURABLE_INDICATORS = [
  '%',
  'million',
  'billion',
  'revenue',
  'customers',
  'market share',
  'by 20',
  'within',
  'reduce',
  'increase',
  'double',
  'triple',
  'growth',
  'profit',
  'margin',
  'employee',
  'headcount',
  'annual',
  'quarterly',
];

function assessClarityRating(northStar: string): ClarityRating {
  if (!northStar || northStar.trim().length === 0) return 'Vague';

  const words = northStar.trim().split(/\s+/);
  const wordCount = words.length;
  const lowerText = northStar.toLowerCase();

  const hasGenericTerms = GENERIC_TERMS.some((term) => lowerText.includes(term));
  const hasMeasurableElements = MEASURABLE_INDICATORS.some((ind) =>
    lowerText.includes(ind)
  );

  if (wordCount < 10 || (hasGenericTerms && !hasMeasurableElements)) {
    return 'Vague';
  }

  if (wordCount > 20 && hasMeasurableElements) {
    return 'Clear';
  }

  // 10-20 words with some specificity
  if (wordCount >= 10 && !hasGenericTerms) {
    return 'Directional';
  }

  return 'Directional';
}

function getClarityColor(rating: ClarityRating): string {
  switch (rating) {
    case 'Clear':
      return REPORT_COLORS.green;
    case 'Directional':
      return REPORT_COLORS.amber;
    case 'Vague':
      return REPORT_COLORS.red;
  }
}

function getClarityExplanation(rating: ClarityRating, northStar: string): string {
  const wordCount = northStar.trim().split(/\s+/).length;

  switch (rating) {
    case 'Clear':
      return `This vision statement demonstrates strong strategic clarity. At ${wordCount} words, it provides sufficient specificity and includes measurable elements that allow the organization to track progress. A clear north star enables every team member to evaluate whether their daily work advances the mission.`;
    case 'Directional':
      return `This vision statement provides directional guidance but lacks the specificity needed for measurable accountability. At ${wordCount} words, it communicates intent without defining concrete outcomes. The organization can generally point toward the right direction, but individual contributors may interpret "success" differently.`;
    case 'Vague':
      return `This vision statement lacks the specificity required to drive strategic alignment. ${wordCount < 10 ? `At only ${wordCount} words, it provides insufficient detail for operational decision-making.` : 'It relies on generic language that could describe any organization in any industry.'} Without measurable elements, the organization cannot objectively assess whether it is making progress toward its stated aspiration.`;
  }
}

// ---------------------------------------------------------------------------
// Helper: Pillar analysis
// ---------------------------------------------------------------------------

function assessPillarFeasibility(
  pillarName: string,
  swot: SwotData | undefined
): 'Feasible' | 'Stretch' {
  if (!swot?.strengths || swot.strengths.length === 0) return 'Stretch';

  const pillarLower = pillarName.toLowerCase();
  const pillarTokens = pillarLower.split(/\s+/);

  const strengthText = swot.strengths
    .map((s) => s.text?.toLowerCase() || '')
    .join(' ');

  // Check if any pillar token appears in strengths
  const hasMatch = pillarTokens.some(
    (token) => token.length > 3 && strengthText.includes(token)
  );

  return hasMatch ? 'Feasible' : 'Stretch';
}

function assessPillarAlignment(
  pillarName: string,
  swot: SwotData | undefined
): 'Aligned' | 'Unclear' {
  if (!swot?.opportunities || swot.opportunities.length === 0) return 'Unclear';

  const pillarLower = pillarName.toLowerCase();
  const pillarTokens = pillarLower.split(/\s+/);

  const opportunityText = swot.opportunities
    .map((o) => o.text?.toLowerCase() || '')
    .join(' ');

  const hasMatch = pillarTokens.some(
    (token) => token.length > 3 && opportunityText.includes(token)
  );

  return hasMatch ? 'Aligned' : 'Unclear';
}

// ---------------------------------------------------------------------------
// Helper: Vision Reality Gap
// ---------------------------------------------------------------------------

interface GapRow {
  pillar: string;
  requirement: string;
  currentState: string;
  gapSeverity: 'Low' | 'Moderate' | 'High';
}

function buildGapAnalysis(
  pillars: VisionPillar[],
  swot: SwotData | undefined,
  aiReadiness: AiReadinessData | undefined
): GapRow[] {
  return pillars.map((pillar) => {
    const pillarLower = pillar.name.toLowerCase();

    // Determine requirement implied by pillar
    const requirement = pillar.kpi
      ? `Achieve "${pillar.kpi}" through ${pillar.name.toLowerCase()} capabilities`
      : `Build organizational capability in ${pillar.name.toLowerCase()}`;

    // Assess current state from SWOT strengths and AI readiness
    const strengthEvidence: string[] = [];

    if (swot?.strengths) {
      const pillarTokens = pillarLower.split(/\s+/);
      swot.strengths.forEach((s) => {
        const text = s.text?.toLowerCase() || '';
        if (pillarTokens.some((token) => token.length > 3 && text.includes(token))) {
          strengthEvidence.push(s.text);
        }
      });
    }

    // Check AI readiness for technology-related pillars
    const isTechPillar = /\b(ai|digital|technology|automation|data|tech)\b/.test(pillarLower);
    let aiScore: number | null = null;
    if (isTechPillar && aiReadiness) {
      const aiValues = [
        aiReadiness.Strategy,
        aiReadiness.Data,
        aiReadiness.Infrastructure,
        aiReadiness.Talent,
        aiReadiness.Governance,
        aiReadiness.Culture,
      ].filter((v): v is number => typeof v === 'number');

      if (aiValues.length > 0) {
        aiScore = Math.round(aiValues.reduce((a, b) => a + b, 0) / aiValues.length);
      }
    }

    let currentState: string;
    if (strengthEvidence.length > 0) {
      currentState = `Evidence of existing capability: "${strengthEvidence[0]}"`;
      if (aiScore !== null) {
        currentState += ` (AI readiness: ${aiScore}%)`;
      }
    } else if (aiScore !== null) {
      currentState = `AI readiness at ${aiScore}% — ${aiScore < 40 ? 'significant infrastructure gaps' : aiScore < 70 ? 'moderate capability in place' : 'strong foundation exists'}`;
    } else {
      currentState = 'No direct evidence of capability in current assessment data';
    }

    // Determine gap severity
    let gapSeverity: 'Low' | 'Moderate' | 'High';
    if (strengthEvidence.length > 0 && (aiScore === null || aiScore >= 50)) {
      gapSeverity = 'Low';
    } else if (strengthEvidence.length > 0 || (aiScore !== null && aiScore >= 40)) {
      gapSeverity = 'Moderate';
    } else {
      gapSeverity = 'High';
    }

    return { pillar: pillar.name, requirement, currentState, gapSeverity };
  });
}

function buildGapSynthesis(gaps: GapRow[]): string {
  const highGaps = gaps.filter((g) => g.gapSeverity === 'High');
  const moderateGaps = gaps.filter((g) => g.gapSeverity === 'Moderate');
  const lowGaps = gaps.filter((g) => g.gapSeverity === 'Low');

  if (highGaps.length === 0 && moderateGaps.length === 0) {
    return 'The organization demonstrates strong alignment between its vision and current capabilities. Existing strengths provide a solid foundation for executing against all stated pillars. The primary risk is complacency — maintaining current capabilities requires deliberate investment even when gaps appear small.';
  }

  if (highGaps.length >= gaps.length / 2) {
    return `The assessment reveals a significant vision-reality gap. ${highGaps.length} of ${gaps.length} strategic pillars lack supporting evidence in the current organizational profile. This pattern suggests the vision may be aspirational rather than achievable within the current planning horizon. The organization should either narrow its strategic focus to pillars where capability exists, or accept a multi-year capability-building timeline before these pillars can drive measurable outcomes.`;
  }

  const parts: string[] = [];
  if (highGaps.length > 0) {
    parts.push(
      `${highGaps.length} pillar${highGaps.length > 1 ? 's' : ''} (${highGaps.map((g) => g.pillar).join(', ')}) show${highGaps.length === 1 ? 's' : ''} high gaps requiring foundational investment`
    );
  }
  if (moderateGaps.length > 0) {
    parts.push(
      `${moderateGaps.length} pillar${moderateGaps.length > 1 ? 's' : ''} (${moderateGaps.map((g) => g.pillar).join(', ')}) show${moderateGaps.length === 1 ? 's' : ''} moderate gaps addressable through targeted capability-building`
    );
  }
  if (lowGaps.length > 0) {
    parts.push(
      `${lowGaps.length} pillar${lowGaps.length > 1 ? 's' : ''} (${lowGaps.map((g) => g.pillar).join(', ')}) are${lowGaps.length === 1 ? ' is' : ''} well-supported by existing strengths`
    );
  }

  return `The gap analysis reveals a mixed picture. ${parts.join('. ')}. Strategic sequencing should prioritize closing high-gap areas before expanding effort across all pillars simultaneously.`;
}

// ---------------------------------------------------------------------------
// Helper: Core Values Audit
// ---------------------------------------------------------------------------

interface ValueAssessment {
  value: string;
  status: 'Operationalized' | 'Aspirational';
  evidence: string;
}

function assessValues(
  values: string[],
  swot: SwotData | undefined,
  businessContext: BusinessContextData | undefined
): ValueAssessment[] {
  if (!values || values.length === 0) return [];

  const strengthText = (swot?.strengths || [])
    .map((s) => s.text?.toLowerCase() || '')
    .join(' ');
  const weaknessText = (swot?.weaknesses || [])
    .map((w) => w.text?.toLowerCase() || '')
    .join(' ');
  const opportunityText = (swot?.opportunities || [])
    .map((o) => o.text?.toLowerCase() || '')
    .join(' ');

  return values.map((value) => {
    const valueLower = value.toLowerCase();
    const valueTokens = valueLower.split(/\s+/).filter((t) => t.length > 3);

    // Check for evidence in SWOT strengths
    const mentionedInStrengths = valueTokens.some((token) =>
      strengthText.includes(token)
    );

    // Check for contradictions in weaknesses
    const contradictedByWeaknesses = valueTokens.some((token) =>
      weaknessText.includes(token)
    );

    // Check specific contradictions
    const isBalanceValue = /\b(balance|wellbeing|wellness|health|life)\b/.test(valueLower);
    const founderHoursContradict =
      isBalanceValue &&
      businessContext?.founderHours !== undefined &&
      businessContext.founderHours > 60;

    const isPeopleValue = /\b(people|team|empowerment|culture|talent)\b/.test(valueLower);
    const hasPeopleWeakness =
      isPeopleValue &&
      /\b(burnout|turnover|capacity|stretched|overwhelm)\b/.test(weaknessText);

    const isInnovationValue = /\b(innovation|creative|disrupt|cutting.edge)\b/.test(valueLower);
    const hasInnovationEvidence =
      isInnovationValue &&
      (/\b(innovation|creative|new|patent|research)\b/.test(strengthText) ||
        /\b(innovation|creative|technology)\b/.test(opportunityText));

    // Determine status
    if (founderHoursContradict) {
      return {
        value,
        status: 'Aspirational' as const,
        evidence: `Founder reports working ${businessContext?.founderHours}+ hours per week, which directly contradicts a "${value}" value. This value is not yet embedded in operational practice.`,
      };
    }

    if (hasPeopleWeakness) {
      return {
        value,
        status: 'Aspirational' as const,
        evidence: `SWOT weaknesses include capacity or burnout-related concerns, suggesting this value has not been fully operationalized despite its stated importance.`,
      };
    }

    if (contradictedByWeaknesses && !mentionedInStrengths) {
      return {
        value,
        status: 'Aspirational' as const,
        evidence: `Referenced in organizational weaknesses but absent from strengths, indicating this is a recognized gap rather than an embedded practice.`,
      };
    }

    if (mentionedInStrengths) {
      return {
        value,
        status: 'Operationalized' as const,
        evidence: `Reflected in SWOT strengths, suggesting this value is actively practiced and recognized as a competitive advantage.`,
      };
    }

    if (isInnovationValue && hasInnovationEvidence) {
      return {
        value,
        status: 'Operationalized' as const,
        evidence: `Evidence of innovation-oriented practices found in the strategic assessment, indicating active investment in this value.`,
      };
    }

    // Default: no evidence either way
    return {
      value,
      status: 'Aspirational' as const,
      evidence: `No direct evidence of operationalization found in the assessment data. This value may exist in culture but is not reflected in the strategic profile.`,
    };
  });
}

function buildValuesSummary(assessments: ValueAssessment[]): string {
  const operationalized = assessments.filter((a) => a.status === 'Operationalized');
  const aspirational = assessments.filter((a) => a.status === 'Aspirational');

  if (aspirational.length === 0) {
    return 'All stated values show evidence of operationalization in the assessment data. This alignment between stated values and organizational reality is a significant competitive advantage — it creates authentic culture that attracts talent and builds client trust.';
  }

  if (operationalized.length === 0) {
    return `None of the ${assessments.length} stated values show clear evidence of operationalization. This gap between espoused values and lived reality creates organizational cynicism over time. The immediate priority should be selecting one or two values for deliberate operationalization rather than attempting to activate all simultaneously.`;
  }

  return `Of ${assessments.length} stated values, ${operationalized.length} show${operationalized.length === 1 ? 's' : ''} evidence of operationalization while ${aspirational.length} remain${aspirational.length === 1 ? 's' : ''} aspirational. The operationalized values (${operationalized.map((a) => a.value).join(', ')}) represent authentic organizational strengths. The aspirational values require deliberate systems and processes to move from rhetoric to reality.`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VisionCanvasReport() {
  const tools = useWorkspaceStore((state) => state.tools);
  const metadata = useWorkspaceStore((state) => state.metadata);

  // Extract tool data
  const visionRaw = tools['vision-canvas'] as Record<string, unknown> | undefined;
  const swot = tools['swot'] as SwotData | undefined;
  const aiReadiness = tools['ai-readiness'] as AiReadinessData | undefined;
  const businessContext = tools['business-context'] as BusinessContextData | undefined;

  // Vision data with safe defaults — normalize both UI and seeded formats
  const northStar = (visionRaw?.northStar as string) || '';

  // Pillars may be { name, kpi } (component format) or { text, kpi } (stored format)
  const pillars: VisionPillar[] = (Array.isArray(visionRaw?.pillars) ? visionRaw.pillars : []).map(
    (p: Record<string, unknown>) => ({
      name: (p.name as string) || (p.text as string) || '',
      kpi: (p.kpi as string) || '',
    }),
  );

  // Values may be string[] or { text }[] (stored format)
  const values: string[] = (Array.isArray(visionRaw?.values) ? visionRaw.values : []).map(
    (v: unknown) => (typeof v === 'string' ? v : ((v as Record<string, unknown>)?.text as string) || ''),
  );

  // Assessments
  const clarityRating = assessClarityRating(northStar);
  const clarityColor = getClarityColor(clarityRating);
  const clarityExplanation = getClarityExplanation(clarityRating, northStar);

  const gapRows = buildGapAnalysis(pillars, swot, aiReadiness);
  const gapSynthesis = buildGapSynthesis(gapRows);

  const valueAssessments = assessValues(values, swot, businessContext);
  const valuesSummary = buildValuesSummary(valueAssessments);

  const clientName = metadata?.name || 'Your Organization';
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-0">
      {/* VIS-01: Cover Page */}
      <ReportPage variant="cover">
        <ReportHero className="text-white">Vision Canvas Assessment</ReportHero>
        <div className="text-xl text-white/80 font-light mt-4">{clientName}</div>
        <div className="text-sm text-white/60 mt-2">{reportDate}</div>
        <div className="text-base text-white/70 mt-8 max-w-md mx-auto leading-relaxed">
          Evaluating strategic vision clarity and alignment
        </div>
      </ReportPage>

      {/* VIS-02: Vision Assessment */}
      <ReportPage variant="standard" pageNumber={2}>
        <ReportSectionTitle>Vision Assessment</ReportSectionTitle>

        {/* North Star Quote */}
        {northStar ? (
          <div className="mb-8">
            <ReportSubsection>North Star Statement</ReportSubsection>
            <ReportCallout className="my-4">
              &ldquo;{northStar}&rdquo;
            </ReportCallout>
          </div>
        ) : (
          <div className="mb-8">
            <ReportSubsection>North Star Statement</ReportSubsection>
            <ReportBody className="italic text-report-gray">
              No north star statement has been defined. A clear north star is the
              foundation of strategic alignment.
            </ReportBody>
          </div>
        )}

        {/* Vision Clarity Rating */}
        <div className="mb-8">
          <ReportSubsection>Vision Clarity Rating</ReportSubsection>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="inline-flex items-center px-4 py-2 rounded-md text-white font-semibold text-lg"
              style={{ backgroundColor: clarityColor }}
            >
              {clarityRating}
            </div>
            <span className="text-sm text-report-gray">
              Based on specificity, measurability, and language analysis
            </span>
          </div>
          <ReportBody>{clarityExplanation}</ReportBody>
        </div>

        {/* Per-Pillar Analysis */}
        {pillars.length > 0 && (
          <div className="mt-8">
            <ReportSubsection>Strategic Pillar Analysis</ReportSubsection>
            <ReportTable>
              <ReportTableHeader>
                <ReportTableRow>
                  <ReportTableCell header>Pillar</ReportTableCell>
                  <ReportTableCell header>KPI Defined</ReportTableCell>
                  <ReportTableCell header>Feasibility</ReportTableCell>
                  <ReportTableCell header>Alignment</ReportTableCell>
                </ReportTableRow>
              </ReportTableHeader>
              <tbody>
                {pillars.map((pillar, index) => {
                  const feasibility = assessPillarFeasibility(pillar.name, swot);
                  const alignment = assessPillarAlignment(pillar.name, swot);
                  const hasKpi = pillar.kpi && pillar.kpi.trim().length > 0;

                  return (
                    <ReportTableRow
                      key={pillar.name}
                      variant={index % 2 === 1 ? 'alternate' : 'default'}
                    >
                      <ReportTableCell className="font-medium">
                        {pillar.name}
                      </ReportTableCell>
                      <ReportTableCell>
                        <span
                          style={{
                            color: hasKpi ? REPORT_COLORS.green : REPORT_COLORS.red,
                          }}
                          className="font-semibold"
                        >
                          {hasKpi ? 'Yes' : 'No'}
                        </span>
                      </ReportTableCell>
                      <ReportTableCell>
                        <span
                          style={{
                            color:
                              feasibility === 'Feasible'
                                ? REPORT_COLORS.green
                                : REPORT_COLORS.amber,
                          }}
                          className="font-semibold"
                        >
                          {feasibility}
                        </span>
                      </ReportTableCell>
                      <ReportTableCell>
                        <span
                          style={{
                            color:
                              alignment === 'Aligned'
                                ? REPORT_COLORS.green
                                : REPORT_COLORS.amber,
                          }}
                          className="font-semibold"
                        >
                          {alignment}
                        </span>
                      </ReportTableCell>
                    </ReportTableRow>
                  );
                })}
              </tbody>
            </ReportTable>
          </div>
        )}

        {pillars.length === 0 && (
          <div className="mt-8">
            <ReportSubsection>Strategic Pillar Analysis</ReportSubsection>
            <ReportBody className="italic text-report-gray">
              No strategic pillars have been defined. Pillars translate the north star
              into actionable focus areas.
            </ReportBody>
          </div>
        )}
      </ReportPage>

      {/* VIS-03: Vision Reality Gap */}
      <ReportPage variant="standard" pageNumber={3}>
        <ReportSectionTitle>Vision Reality Gap</ReportSectionTitle>

        {pillars.length > 0 ? (
          <>
            <ReportBody className="mb-6">
              The following analysis maps what the vision requires against current
              organizational evidence. Each pillar is assessed for supporting
              capability based on SWOT strengths and AI readiness data.
            </ReportBody>

            <ReportTable className="mb-8">
              <ReportTableHeader>
                <ReportTableRow>
                  <ReportTableCell header>Pillar</ReportTableCell>
                  <ReportTableCell header>What the Vision Requires</ReportTableCell>
                  <ReportTableCell header>Current State Evidence</ReportTableCell>
                  <ReportTableCell header>Gap</ReportTableCell>
                </ReportTableRow>
              </ReportTableHeader>
              <tbody>
                {gapRows.map((row, index) => {
                  const gapColor =
                    row.gapSeverity === 'High'
                      ? REPORT_COLORS.red
                      : row.gapSeverity === 'Moderate'
                        ? REPORT_COLORS.amber
                        : REPORT_COLORS.green;

                  return (
                    <ReportTableRow
                      key={row.pillar}
                      variant={index % 2 === 1 ? 'alternate' : 'default'}
                    >
                      <ReportTableCell className="font-medium whitespace-nowrap">
                        {row.pillar}
                      </ReportTableCell>
                      <ReportTableCell>{row.requirement}</ReportTableCell>
                      <ReportTableCell>{row.currentState}</ReportTableCell>
                      <ReportTableCell>
                        <span
                          style={{ color: gapColor }}
                          className="font-semibold"
                        >
                          {row.gapSeverity}
                        </span>
                      </ReportTableCell>
                    </ReportTableRow>
                  );
                })}
              </tbody>
            </ReportTable>

            <ReportSubsection>Gap Synthesis</ReportSubsection>
            <ReportBody>{gapSynthesis}</ReportBody>
          </>
        ) : (
          <ReportBody className="italic text-report-gray">
            No strategic pillars have been defined. Complete the Vision Canvas
            assessment to generate gap analysis.
          </ReportBody>
        )}
      </ReportPage>

      {/* VIS-04: Core Values Audit */}
      <ReportPage variant="standard" pageNumber={4}>
        <ReportSectionTitle>Core Values Audit</ReportSectionTitle>

        {values.length > 0 ? (
          <>
            <ReportBody className="mb-6">
              Each stated value is assessed against assessment data to determine
              whether it is actively operationalized in organizational practice or
              remains aspirational.
            </ReportBody>

            <div className="space-y-6 mb-8">
              {valueAssessments.map((assessment) => (
                <div
                  key={assessment.value}
                  className="border border-report-warm rounded-md p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-report-navy">
                      {assessment.value}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          assessment.status === 'Operationalized'
                            ? REPORT_COLORS.green
                            : REPORT_COLORS.amber,
                      }}
                    >
                      {assessment.status}
                    </span>
                  </div>
                  <ReportBody>{assessment.evidence}</ReportBody>
                </div>
              ))}
            </div>

            {values.length <= 3 && pillars.length > 0 && (
              <div className="mt-8">
                <ReportSubsection>Values-to-Strategy Connection</ReportSubsection>
                <ReportBody className="mb-4">
                  With {values.length} stated value{values.length !== 1 ? 's' : ''} supporting {pillars.length} strategic pillar{pillars.length !== 1 ? 's' : ''}, there is a risk that values serve as cultural slogans rather than strategic filters. Effective values guide every hiring decision, resource allocation, and partnership evaluation. The table below maps how each value could function as a decision-making lens.
                </ReportBody>
                <ReportTable>
                  <ReportTableHeader>
                    <ReportTableRow>
                      <ReportTableCell header>Value</ReportTableCell>
                      <ReportTableCell header>Strategic Question It Should Answer</ReportTableCell>
                    </ReportTableRow>
                  </ReportTableHeader>
                  <tbody>
                    {values.map((value, idx) => (
                      <ReportTableRow key={value} variant={idx % 2 === 1 ? 'alternate' : 'default'}>
                        <ReportTableCell className="font-medium">{value}</ReportTableCell>
                        <ReportTableCell>
                          Does this initiative strengthen our commitment to {value.toLowerCase()}? If not, what does pursuing it cost our culture?
                        </ReportTableCell>
                      </ReportTableRow>
                    ))}
                  </tbody>
                </ReportTable>
              </div>
            )}

            <ReportSubsection>Summary</ReportSubsection>
            <ReportBody>{valuesSummary}</ReportBody>
          </>
        ) : (
          <ReportBody className="italic text-report-gray">
            No core values have been defined. Complete the Vision Canvas assessment
            to generate a values audit.
          </ReportBody>
        )}
      </ReportPage>
    </div>
  );
}
