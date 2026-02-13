/**
 * SWOT Analysis Individual Report
 *
 * Consulting-grade report covering:
 * SWOT-01: Cover page
 * SWOT-02: SWOT Summary with 2x2 priority matrix
 * SWOT-03: Strategic Connections (Leverage, Defend, Watch, Invest)
 * SWOT-04: SWOT Action Items (3 prioritized actions)
 */

import { useWorkspaceStore } from '@/store/workspaceStore';
import { computeDerivedMetrics } from '@/engine/derived-metrics';
import { runSynthesis } from '@/engine/synthesis';
import { createNarrativeContext, generateNarrative, buildSectionTemplate } from '@/report/narrative';
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
import { REPORT_COLORS } from '@/report/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwotItem {
  text: string;
  id?: string;
  impact?: string;
  confidence?: number;
}

interface StrategicConnection {
  label: string;
  subtitle: string;
  colorAccent: string;
  bgColor: string;
  item1Label: string;
  item2Label: string;
  item1: string;
  item2: string;
  narrative: string;
}

interface PrioritizedAction {
  rank: number;
  title: string;
  rationale: string;
  firstStep: string;
  expectedOutcome: string;
  accentColor: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTexts(items: SwotItem[] | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.text ?? '').filter((t) => t.length > 0);
}

/** Pick a deterministic "best" item from a list based on text length (proxy for specificity) */
function pickBest(items: string[]): string {
  if (items.length === 0) return 'Not specified';
  // Prefer longer, more specific entries
  return [...items].sort((a, b) => b.length - a.length)[0]!;
}

/** Pick a second-best item that differs from the first */
function pickSecondBest(items: string[], exclude: string): string {
  const filtered = items.filter((t) => t !== exclude);
  if (filtered.length === 0) return items[0] ?? 'Not specified';
  return [...filtered].sort((a, b) => b.length - a.length)[0]!;
}

/** Generate a strategic connection narrative */
function buildConnectionNarrative(
  type: 'leverage' | 'defend' | 'watch' | 'invest',
  item1: string,
  item2: string
): string {
  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 3) + '...' : text;

  const s1 = truncate(item1, 100);
  const s2 = truncate(item2, 100);

  switch (type) {
    case 'leverage':
      return `Your strength in "${s1}" positions you to capitalize on the opportunity "${s2}". This is your highest-leverage strategic combination -- investing here compounds existing advantages rather than building from scratch.`;
    case 'defend':
      return `Your strength in "${s1}" provides a natural buffer against the threat "${s2}". Maintaining and strengthening this capability is a defensive priority -- if it erodes, the threat exposure increases significantly.`;
    case 'watch':
      return `The weakness "${s1}" amplifies the threat "${s2}". This combination creates compounding risk -- the weakness makes you more vulnerable to the threat, and the threat makes the weakness more costly. Monitor this pairing closely.`;
    case 'invest':
      return `Addressing the weakness "${s1}" would unlock the opportunity "${s2}". This is an investment play -- the weakness currently blocks access to a valuable opportunity. Closing this gap has a clear return.`;
  }
}

/** Classify SWOT items into a 2x2 priority matrix (Impact vs Urgency) */
function classifyQuadrant(
  item: SwotItem,
  quadrantType: 'strength' | 'weakness' | 'opportunity' | 'threat'
): { impact: 'high' | 'low'; urgency: 'high' | 'low' } {
  // Threats and weaknesses are more urgent by default
  // Longer/more specific items are treated as higher impact
  const isHighImpact = item.text.length > 30 || item.impact === 'High';
  const isHighUrgency =
    quadrantType === 'threat' ||
    quadrantType === 'weakness' ||
    (item.confidence !== undefined && item.confidence >= 4);

  return {
    impact: isHighImpact ? 'high' : 'low',
    urgency: isHighUrgency ? 'high' : 'low',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SwotReport() {
  const tools = useWorkspaceStore((s) => s.tools);
  const metadata = useWorkspaceStore((s) => s.metadata);
  const insights = useWorkspaceStore((s) => s.insights);

  const swot = tools['swot'] as
    | {
        strengths?: SwotItem[];
        weaknesses?: SwotItem[];
        opportunities?: SwotItem[];
        threats?: SwotItem[];
      }
    | undefined;

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

  // Extract text arrays
  const strengths = extractTexts(swot?.strengths);
  const weaknesses = extractTexts(swot?.weaknesses);
  const opportunities = extractTexts(swot?.opportunities);
  const threats = extractTexts(swot?.threats);

  const clientName = metadata.name || 'Your Organization';
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate SWOT narrative from the narrative engine
  const swotTemplate = buildSectionTemplate('swot-narrative', narrativeCtx);
  const swotNarrative = generateNarrative(swotTemplate, narrativeCtx);
  const summaryText =
    swotNarrative.sections[0]?.content ?? 'Complete the SWOT analysis to generate a strategic position summary.';

  // Classify items into priority matrix quadrants
  const matrixItems: {
    text: string;
    type: string;
    impact: 'high' | 'low';
    urgency: 'high' | 'low';
  }[] = [];

  const addToMatrix = (
    items: SwotItem[] | undefined,
    type: 'strength' | 'weakness' | 'opportunity' | 'threat'
  ) => {
    if (!items) return;
    for (const item of items) {
      if (!item.text) continue;
      const classification = classifyQuadrant(item, type);
      matrixItems.push({
        text: item.text,
        type,
        ...classification,
      });
    }
  };

  addToMatrix(swot?.strengths, 'strength');
  addToMatrix(swot?.weaknesses, 'weakness');
  addToMatrix(swot?.opportunities, 'opportunity');
  addToMatrix(swot?.threats, 'threat');

  // Quadrant buckets
  const critical = matrixItems.filter(
    (i) => i.impact === 'high' && i.urgency === 'high'
  );
  const quickWins = matrixItems.filter(
    (i) => i.impact === 'low' && i.urgency === 'high'
  );
  const strategic = matrixItems.filter(
    (i) => i.impact === 'high' && i.urgency === 'low'
  );
  const monitor = matrixItems.filter(
    (i) => i.impact === 'low' && i.urgency === 'low'
  );

  // Build strategic connections
  const bestStrength = pickBest(strengths);
  const bestWeakness = pickBest(weaknesses);
  const bestOpportunity = pickBest(opportunities);
  const bestThreat = pickBest(threats);
  const secondWeakness = pickSecondBest(weaknesses, bestWeakness);

  const connections: StrategicConnection[] = [
    {
      label: 'Leverage',
      subtitle: 'Strength + Opportunity',
      colorAccent: REPORT_COLORS.green,
      bgColor: `${REPORT_COLORS.green}08`,
      item1Label: 'Strength',
      item2Label: 'Opportunity',
      item1: bestStrength,
      item2: bestOpportunity,
      narrative: buildConnectionNarrative('leverage', bestStrength, bestOpportunity),
    },
    {
      label: 'Defend',
      subtitle: 'Strength + Threat',
      colorAccent: REPORT_COLORS.blue,
      bgColor: `${REPORT_COLORS.blue}08`,
      item1Label: 'Strength',
      item2Label: 'Threat',
      item1: bestStrength,
      item2: bestThreat,
      narrative: buildConnectionNarrative('defend', bestStrength, bestThreat),
    },
    {
      label: 'Watch',
      subtitle: 'Weakness + Threat',
      colorAccent: REPORT_COLORS.red,
      bgColor: `${REPORT_COLORS.red}08`,
      item1Label: 'Weakness',
      item2Label: 'Threat',
      item1: bestWeakness,
      item2: bestThreat,
      narrative: buildConnectionNarrative('watch', bestWeakness, bestThreat),
    },
    {
      label: 'Invest',
      subtitle: 'Weakness + Opportunity',
      colorAccent: REPORT_COLORS.amber,
      bgColor: `${REPORT_COLORS.amber}08`,
      item1Label: 'Weakness',
      item2Label: 'Opportunity',
      item1: bestWeakness,
      item2: bestOpportunity,
      narrative: buildConnectionNarrative('invest', bestWeakness, bestOpportunity),
    },
  ];

  // Find the most important connection (Leverage if we have both S+O, else Watch)
  const mostImportantConnection =
    strengths.length > 0 && opportunities.length > 0
      ? connections[0]!
      : connections[2]!;

  // Build 3 prioritized actions
  const actions: PrioritizedAction[] = [
    {
      rank: 1,
      title: 'Highest-Leverage Opportunity',
      rationale:
        strengths.length > 0 && opportunities.length > 0
          ? `Your strength in "${truncateText(bestStrength, 60)}" directly enables the opportunity "${truncateText(bestOpportunity, 60)}". This combination has the highest probability of near-term return because it builds on existing capability.`
          : 'Complete your SWOT Strengths and Opportunities sections to identify your highest-leverage strategic play.',
      firstStep:
        strengths.length > 0 && opportunities.length > 0
          ? `This week, identify the one resource or process behind "${truncateText(bestStrength, 40)}" that can be redirected toward "${truncateText(bestOpportunity, 40)}".`
          : 'Add at least 3 strengths and 3 opportunities to the SWOT tool.',
      expectedOutcome:
        'Accelerated movement toward the opportunity with minimal new resource investment.',
      accentColor: REPORT_COLORS.green,
    },
    {
      rank: 2,
      title: 'Most Urgent Defense',
      rationale:
        weaknesses.length > 0 && threats.length > 0
          ? `The weakness "${truncateText(bestWeakness, 60)}" leaves you exposed to the threat "${truncateText(bestThreat, 60)}". This pairing creates compounding risk that grows more expensive to address with each passing quarter.`
          : 'Complete your SWOT Weaknesses and Threats sections to identify urgent defensive priorities.',
      firstStep:
        weaknesses.length > 0 && threats.length > 0
          ? `Before end of this week, quantify the cost of inaction: what revenue or capability is at risk if "${truncateText(bestThreat, 50)}" materializes while "${truncateText(bestWeakness, 50)}" remains unaddressed?`
          : 'Add at least 3 weaknesses and 3 threats to the SWOT tool.',
      expectedOutcome:
        'Clear understanding of risk exposure and a concrete mitigation timeline.',
      accentColor: REPORT_COLORS.red,
    },
    {
      rank: 3,
      title: 'One Thing to Stop Doing',
      rationale:
        weaknesses.length > 0
          ? `The weakness "${truncateText(secondWeakness !== 'Not specified' ? secondWeakness : bestWeakness, 60)}" often persists because resources are being spent on activities that sustain it. Stopping the activity that feeds this weakness frees capacity for higher-value work.`
          : 'Complete your SWOT Weaknesses section to identify activities draining resources.',
      firstStep:
        weaknesses.length > 0
          ? `Identify one recurring meeting, report, or process that exists primarily because of "${truncateText(secondWeakness !== 'Not specified' ? secondWeakness : bestWeakness, 50)}" and cancel or restructure it this week.`
          : 'Add weaknesses to the SWOT tool, focusing on resource-draining patterns.',
      expectedOutcome:
        'Recovered capacity that can be redirected toward strategic priorities.',
      accentColor: REPORT_COLORS.amber,
    },
  ];

  return (
    <div className="space-y-0">
      {/* ----------------------------------------------------------------- */}
      {/* SWOT-01: Cover Page */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="cover">
        <ReportCaption className="uppercase tracking-widest text-blue-200 block mb-4">
          Individual Assessment Report
        </ReportCaption>
        <ReportHero className="text-white">SWOT Analysis</ReportHero>
        <ReportBody className="text-blue-100 text-lg mt-4 max-w-xl mx-auto">
          Strategic position assessment with actionable connections
        </ReportBody>
        <div className="mt-12 space-y-2">
          <p className="text-xl font-semibold text-white">{clientName}</p>
          <p className="text-blue-200">{reportDate}</p>
        </div>
      </ReportPage>

      {/* ----------------------------------------------------------------- */}
      {/* SWOT-02: SWOT Summary with Priority Matrix */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={2}>
        <div className="space-y-8">
          <ReportSectionTitle>SWOT Summary</ReportSectionTitle>

          {/* 2x2 Priority Matrix */}
          <div>
            <ReportSubsection>Priority Matrix</ReportSubsection>
            <ReportCaption className="block mb-4">
              SWOT items classified by strategic impact and urgency
            </ReportCaption>

            <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
              {/* Column headers */}
              <div className="col-span-2 grid grid-cols-[60px_1fr_1fr]">
                <div />
                <div className="text-center text-xs font-semibold text-gray-500 py-2 border-b border-gray-300">
                  Low Impact
                </div>
                <div className="text-center text-xs font-semibold text-gray-500 py-2 border-b border-gray-300">
                  High Impact
                </div>
              </div>

              {/* High Urgency row */}
              <div className="col-span-2 grid grid-cols-[60px_1fr_1fr] min-h-[140px]">
                <div className="flex items-center justify-center border-r border-gray-300">
                  <span className="text-xs font-semibold text-gray-500 -rotate-90 whitespace-nowrap">
                    High Urgency
                  </span>
                </div>

                {/* Quick Wins (high urgency, low impact) */}
                <div className="p-3 border-r border-b border-gray-300 bg-amber-50/50">
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: REPORT_COLORS.amber }}
                  >
                    Quick Wins
                  </p>
                  <ReportList>
                    {quickWins.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs">
                        <MatrixItemBadge type={item.type} />
                        {truncateText(item.text, 50)}
                      </li>
                    ))}
                    {quickWins.length === 0 && (
                      <li className="text-xs text-gray-400 italic">
                        No items in this quadrant
                      </li>
                    )}
                  </ReportList>
                </div>

                {/* Critical (high urgency, high impact) */}
                <div className="p-3 border-b border-gray-300 bg-red-50/50">
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: REPORT_COLORS.red }}
                  >
                    Critical
                  </p>
                  <ReportList>
                    {critical.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs">
                        <MatrixItemBadge type={item.type} />
                        {truncateText(item.text, 50)}
                      </li>
                    ))}
                    {critical.length === 0 && (
                      <li className="text-xs text-gray-400 italic">
                        No items in this quadrant
                      </li>
                    )}
                  </ReportList>
                </div>
              </div>

              {/* Low Urgency row */}
              <div className="col-span-2 grid grid-cols-[60px_1fr_1fr] min-h-[140px]">
                <div className="flex items-center justify-center border-r border-gray-300">
                  <span className="text-xs font-semibold text-gray-500 -rotate-90 whitespace-nowrap">
                    Low Urgency
                  </span>
                </div>

                {/* Monitor (low urgency, low impact) */}
                <div className="p-3 border-r border-gray-300 bg-gray-50/50">
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: REPORT_COLORS.gray }}
                  >
                    Monitor
                  </p>
                  <ReportList>
                    {monitor.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs">
                        <MatrixItemBadge type={item.type} />
                        {truncateText(item.text, 50)}
                      </li>
                    ))}
                    {monitor.length === 0 && (
                      <li className="text-xs text-gray-400 italic">
                        No items in this quadrant
                      </li>
                    )}
                  </ReportList>
                </div>

                {/* Strategic (low urgency, high impact) */}
                <div className="p-3 bg-blue-50/50">
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: REPORT_COLORS.blue }}
                  >
                    Strategic
                  </p>
                  <ReportList>
                    {strategic.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs">
                        <MatrixItemBadge type={item.type} />
                        {truncateText(item.text, 50)}
                      </li>
                    ))}
                    {strategic.length === 0 && (
                      <li className="text-xs text-gray-400 italic">
                        No items in this quadrant
                      </li>
                    )}
                  </ReportList>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic position summary */}
          <div>
            <ReportSubsection>Strategic Position Summary</ReportSubsection>
            <ReportBody>{summaryText}</ReportBody>
          </div>
        </div>
      </ReportPage>

      {/* ----------------------------------------------------------------- */}
      {/* SWOT-03: Strategic Connections */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={3}>
        <div className="space-y-8">
          <ReportSectionTitle>Strategic Connections</ReportSectionTitle>
          <ReportBody>
            Strategic value comes not from individual SWOT items but from the
            connections between them. The four connection types below reveal
            where your strengths, weaknesses, opportunities, and threats
            interact.
          </ReportBody>

          {/* 2x2 connection grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connections.map((conn) => (
              <div
                key={conn.label}
                className="rounded-lg border p-5 space-y-3"
                style={{
                  borderColor: conn.colorAccent,
                  backgroundColor: conn.bgColor,
                }}
              >
                {/* Header */}
                <div>
                  <h4
                    className="text-base font-bold"
                    style={{ color: conn.colorAccent }}
                  >
                    {conn.label}
                  </h4>
                  <ReportCaption className="block">{conn.subtitle}</ReportCaption>
                </div>

                {/* Matched items */}
                <div className="space-y-1">
                  <p className="text-xs">
                    <span className="font-semibold text-gray-600">
                      {conn.item1Label}:
                    </span>{' '}
                    <span className="text-gray-800">
                      {truncateText(conn.item1, 80)}
                    </span>
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold text-gray-600">
                      {conn.item2Label}:
                    </span>{' '}
                    <span className="text-gray-800">
                      {truncateText(conn.item2, 80)}
                    </span>
                  </p>
                </div>

                {/* Narrative */}
                <ReportBody className="text-xs leading-relaxed">
                  {conn.narrative}
                </ReportBody>
              </div>
            ))}
          </div>

          {/* Most important connection callout */}
          <ReportCallout>
            Priority connection: {mostImportantConnection.label} ({mostImportantConnection.subtitle}).{' '}
            {mostImportantConnection.label === 'Leverage'
              ? 'This is your highest-return strategic move -- it builds on what you already do well.'
              : 'This pairing represents your most significant risk exposure and warrants immediate attention.'}
          </ReportCallout>
        </div>
      </ReportPage>

      {/* ----------------------------------------------------------------- */}
      {/* SWOT-04: SWOT Action Items */}
      {/* ----------------------------------------------------------------- */}
      <ReportPage variant="standard" pageNumber={4}>
        <div className="space-y-8">
          <ReportSectionTitle>SWOT Action Items</ReportSectionTitle>
          <ReportBody>
            Three prioritized actions derived from your SWOT analysis. Each
            action targets a specific strategic connection and includes a
            concrete first step.
          </ReportBody>

          <div className="space-y-6">
            {actions.map((action) => (
              <div
                key={action.rank}
                className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Rank header */}
                <div
                  className="px-6 py-3 flex items-center gap-3"
                  style={{ backgroundColor: action.accentColor }}
                >
                  <span className="text-white text-2xl font-bold">
                    {action.rank}
                  </span>
                  <span className="text-white font-semibold text-base">
                    {action.title}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Rationale */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Rationale
                    </p>
                    <ReportBody>{action.rationale}</ReportBody>
                  </div>

                  {/* First step */}
                  <div
                    className="rounded p-3"
                    style={{ backgroundColor: `${action.accentColor}10` }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: action.accentColor }}
                    >
                      First Step
                    </p>
                    <ReportBody className="font-medium">
                      {action.firstStep}
                    </ReportBody>
                  </div>

                  {/* Expected outcome */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Expected Outcome
                    </p>
                    <ReportBody>{action.expectedOutcome}</ReportBody>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ReportPage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Small badge indicating the SWOT type of a matrix item */
function MatrixItemBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    strength: REPORT_COLORS.green,
    weakness: REPORT_COLORS.red,
    opportunity: REPORT_COLORS.blue,
    threat: REPORT_COLORS.amber,
  };

  const labelMap: Record<string, string> = {
    strength: 'S',
    weakness: 'W',
    opportunity: 'O',
    threat: 'T',
  };

  const color = colorMap[type] ?? REPORT_COLORS.gray;
  const label = labelMap[type] ?? '?';

  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold mr-1.5 flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
