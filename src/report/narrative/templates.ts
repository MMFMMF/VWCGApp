/**
 * Narrative Template System
 *
 * Template functions that generate consultant-voice narrative text from
 * workspace data. Every template:
 *
 * - References the client's own words (SWOT items, vision statements, values)
 * - Applies conditional logic (sections appear only when data warrants them)
 * - Includes metric interpretation with business context
 * - Produces direct, quantified, active-voice prose
 */

import type { NarrativeContext, NarrativeSection, NarrativeTemplate } from './types.ts';

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Format a number as USD currency (e.g., "$125,000") */
function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Extract a random sample of up to `n` items from an array */
function sample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/** Safely join an array of strings with commas and "and" before the last item */
function joinWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Extract text strings from SWOT quadrant items */
function extractSwotTexts(items: Array<{ text?: string }> | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.text ?? '').filter((t) => t.length > 0);
}

/** Quote a client's own words in the narrative */
function quoteClient(text: string): string {
  // Truncate long entries for readability
  const trimmed = text.length > 80 ? text.slice(0, 77) + '...' : text;
  return `"${trimmed}"`;
}

/** Get leadership dimension gap (target - current) */
function getDimensionGap(
  dna: Record<string, number> | undefined,
  dimension: string
): number {
  if (!dna) return 0;
  const current = dna[`current_${dimension}`] ?? 5;
  const target = dna[`target_${dimension}`] ?? 8;
  return target - current;
}

/** Get all leadership gaps sorted by size */
function getLeadershipGaps(
  dna: Record<string, number> | undefined
): Array<{ dimension: string; current: number; target: number; gap: number }> {
  if (!dna) return [];
  const dimensions = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];
  return dimensions
    .map((dim) => ({
      dimension: dim,
      current: (dna[`current_${dim}`] ?? 5) as number,
      target: (dna[`target_${dim}`] ?? 8) as number,
      gap: getDimensionGap(dna, dim),
    }))
    .sort((a, b) => b.gap - a.gap);
}

// ---------------------------------------------------------------------------
// Metric Interpretation Templates
// ---------------------------------------------------------------------------

/**
 * Generate a one-sentence business-context interpretation for a named metric.
 * Every metric displayed in the report must include at least one sentence
 * of interpretation -- this function provides that sentence.
 */
export function interpretMetric(
  metricName: string,
  value: number | string,
  ctx: NarrativeContext
): string {
  const businessContext = ctx.workspace.tools?.['business-context'];
  const industry = businessContext?.industry ?? 'your industry';

  switch (metricName) {
    case 'executionAmbitionRatio': {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      if (numVal > 1.0) {
        return `At ${numVal.toFixed(2)}, your execution capacity exceeds the scope of your strategic ambitions -- you have room to take on more.`;
      }
      if (numVal >= 0.7) {
        return `At ${numVal.toFixed(2)}, your execution capacity roughly matches your strategic ambitions, though margin for error is thin.`;
      }
      return `At ${numVal.toFixed(2)}, your execution capacity falls short of your strategic ambitions -- the organization is attempting more than it can reliably deliver.`;
    }

    case 'founderDependencyIndex': {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      if (numVal <= 3) {
        return `A Founder Dependency Index of ${numVal.toFixed(1)} indicates healthy delegation -- the business can operate without the founder for meaningful periods.`;
      }
      if (numVal <= 6) {
        return `A Founder Dependency Index of ${numVal.toFixed(1)} reveals moderate single-person risk -- critical decisions still route through one individual.`;
      }
      return `A Founder Dependency Index of ${numVal.toFixed(1)} signals a critical vulnerability -- if the founder stepped away for 30 days, multiple operations would stall.`;
    }

    case 'strategicCoherence': {
      const strVal = String(value);
      if (strVal === 'aligned') {
        return 'Your vision, strengths, and operational priorities reinforce each other -- the strategy is internally consistent.';
      }
      if (strVal === 'partially_aligned') {
        return 'Parts of your strategy reinforce each other, but gaps exist between what you say you value and where you invest resources.';
      }
      return 'Your stated vision, operational strengths, and resource allocation point in different directions -- this misalignment erodes strategic effectiveness.';
    }

    case 'revenueRiskEstimate': {
      const riskObj = typeof value === 'object' ? value as unknown as { low: number; high: number } : null;
      if (!riskObj) return 'Revenue risk could not be estimated from current data.';
      return `Unresolved strategic gaps put ${formatUSD(riskObj.low)} to ${formatUSD(riskObj.high)} of annual revenue at risk in ${industry}.`;
    }

    case 'organizationalReadinessScore': {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      const label = ctx.metrics.organizationalReadinessLabel;
      if (numVal >= 76) {
        return `An Organizational Readiness score of ${numVal} ("${label}") means your team is primed for change -- the constraint is direction, not willingness.`;
      }
      if (numVal >= 51) {
        return `An Organizational Readiness score of ${numVal} ("${label}") suggests your team will accept change when the rationale is clear and the pace is manageable.`;
      }
      if (numVal >= 26) {
        return `An Organizational Readiness score of ${numVal} ("${label}") indicates change fatigue or skepticism -- any transformation effort needs extensive communication and visible quick wins.`;
      }
      return `An Organizational Readiness score of ${numVal} ("${label}") signals deep resistance -- force-fitting change here will backfire without first addressing trust and workload.`;
    }

    case 'leadershipArchetype': {
      const archetype = ctx.metrics.leadershipArchetype;
      return `Your leadership profile matches "${archetype.archetype}" -- ${archetype.description.toLowerCase()}.`;
    }

    default:
      return `The ${metricName} value of ${String(value)} should be evaluated in the context of your specific operational environment.`;
  }
}

// ---------------------------------------------------------------------------
// Section Builder Functions
// ---------------------------------------------------------------------------

/** Executive snapshot: the single most important finding */
function buildExecutiveHeadline(ctx: NarrativeContext): NarrativeSection {
  const highInsights = ctx.insights.filter((i) => i.severity === 'high');
  const metrics = ctx.metrics;
  const vision = ctx.workspace.tools?.['vision-canvas'];
  const northStar = vision?.northStar ?? '';

  let headline: string;

  if (highInsights.length >= 2) {
    headline = `This assessment identified ${highInsights.length} critical findings that require immediate attention. `;
    headline += `The most urgent: ${highInsights[0].title.toLowerCase()}. `;
    if (northStar) {
      headline += `Your stated ambition -- ${quoteClient(northStar)} -- is at risk until these structural issues are resolved.`;
    } else {
      headline += 'Without a clearly articulated North Star, these issues compound because the organization lacks a shared definition of success.';
    }
  } else if (highInsights.length === 1) {
    headline = `One critical finding emerged from this assessment: ${highInsights[0].title.toLowerCase()}. `;
    headline += highInsights[0].message;
  } else {
    headline = `No critical-severity findings emerged. `;
    headline += `Your Execution-Ambition Ratio is ${metrics.executionAmbitionRatio.toFixed(2)} and Organizational Readiness scores ${metrics.organizationalReadinessScore}/100 ("${metrics.organizationalReadinessLabel}"). `;
    headline += 'The primary opportunity is acceleration, not correction.';
  }

  return {
    id: 'executive-headline',
    title: 'Headline Finding',
    content: headline,
  };
}

/** "Where You're Strong" synthesis */
function buildStrengthsNarrative(ctx: NarrativeContext): NarrativeSection {
  const swot = ctx.workspace.tools?.swot;
  const strengths = extractSwotTexts(swot?.strengths);
  const strengthInsights = ctx.insights.filter((i) => i.type === 'strength');
  const dna = ctx.workspace.tools?.['leadership-dna'];
  const gaps = getLeadershipGaps(dna);
  const strongDimensions = gaps.filter((g) => g.current >= 7);

  const parts: string[] = [];

  if (strengths.length > 0) {
    const cited = sample(strengths, 3).map(quoteClient);
    parts.push(
      `Your team identified ${strengths.length} distinct strengths. Among them: ${joinWithAnd(cited)}.`
    );
  }

  if (strongDimensions.length > 0) {
    const dimNames = strongDimensions.map((d) => d.dimension);
    parts.push(
      `Leadership DNA scores are strongest in ${joinWithAnd(dimNames)}, each scoring 7 or above out of 10.`
    );
  }

  if (strengthInsights.length > 0) {
    for (const insight of strengthInsights) {
      parts.push(insight.message);
    }
  }

  if (parts.length === 0) {
    parts.push(
      'No dominant strengths emerged from the current data set. This does not mean strengths are absent -- it indicates the assessment tools have not yet captured them. Complete the SWOT and Leadership DNA assessments for a clearer picture.'
    );
  }

  return {
    id: 'strengths-narrative',
    title: 'Where You Are Strong',
    content: parts.join('\n\n'),
  };
}

/** "Where You're Exposed" synthesis */
function buildExposureNarrative(ctx: NarrativeContext): NarrativeSection {
  const swot = ctx.workspace.tools?.swot;
  const weaknesses = extractSwotTexts(swot?.weaknesses);
  const threats = extractSwotTexts(swot?.threats);
  const riskInsights = ctx.insights.filter((i) => i.type === 'risk');
  const metrics = ctx.metrics;

  const parts: string[] = [];

  if (weaknesses.length > 0) {
    const cited = sample(weaknesses, 3).map(quoteClient);
    parts.push(
      `The SWOT analysis surfaced ${weaknesses.length} weaknesses. Notably: ${joinWithAnd(cited)}.`
    );
  }

  if (threats.length > 0) {
    parts.push(
      `${threats.length} external threats were identified. These compound internal weaknesses and widen the risk window.`
    );
  }

  if (metrics.founderDependencyIndex > 6) {
    parts.push(
      `Founder Dependency Index is ${metrics.founderDependencyIndex.toFixed(1)}/10 -- in the critical range. ${interpretMetric('founderDependencyIndex', metrics.founderDependencyIndex, ctx)}`
    );
  }

  if (riskInsights.length > 0) {
    const topRisks = riskInsights.slice(0, 3);
    for (const risk of topRisks) {
      parts.push(`${risk.title}: ${risk.message}`);
    }
  }

  if (parts.length === 0) {
    parts.push(
      'No significant exposure areas were detected with the current data. As more assessment tools are completed, blind spots may surface.'
    );
  }

  return {
    id: 'exposure-narrative',
    title: 'Where You Are Exposed',
    content: parts.join('\n\n'),
  };
}

/** "The Contradictions" section -- only rendered when >=2 conflict insights exist */
function buildContradictionsNarrative(ctx: NarrativeContext): NarrativeSection {
  const conflicts = ctx.insights.filter((i) => i.type === 'conflict');

  const parts: string[] = [];

  parts.push(
    `This assessment found ${conflicts.length} internal contradiction${conflicts.length === 1 ? '' : 's'} -- places where stated intentions conflict with observed behavior or data.`
  );

  for (const conflict of conflicts) {
    parts.push(`${conflict.title}. ${conflict.message}`);
    if (conflict.recommendation) {
      parts.push(`Recommended action: ${conflict.recommendation}`);
    }
  }

  const vision = ctx.workspace.tools?.['vision-canvas'];
  const values = vision?.values as string[] | undefined;
  if (values && values.length > 0) {
    const valuesList = joinWithAnd(values.slice(0, 4));
    parts.push(
      `Your stated values include ${valuesList}. The contradictions above suggest at least one of these values is aspirational rather than operational.`
    );
  }

  return {
    id: 'contradictions-narrative',
    title: 'The Contradictions',
    content: parts.join('\n\n'),
    condition: (c) => c.insights.filter((i) => i.type === 'conflict').length >= 2,
  };
}

/** "What This Is Costing You" -- only rendered when revenue data is available */
function buildCostNarrative(ctx: NarrativeContext): NarrativeSection {
  const metrics = ctx.metrics;
  const risk = metrics.revenueRiskEstimate;
  const businessContext = ctx.workspace.tools?.['business-context'];
  const revenueRange = businessContext?.revenueRange ?? '';
  const industry = businessContext?.industry ?? 'your industry';

  const parts: string[] = [];

  parts.push(
    `Based on your reported revenue range (${revenueRange}) and the strategic gaps identified, this assessment estimates ${formatUSD(risk.low)} to ${formatUSD(risk.high)} in annual revenue at risk.`
  );

  parts.push(
    'This figure represents revenue that may be lost, delayed, or never captured due to execution bottlenecks, misaligned strategy, or unaddressed vulnerabilities.'
  );

  if (metrics.founderDependencyIndex > 6) {
    parts.push(
      `A critical Founder Dependency Index (${metrics.founderDependencyIndex.toFixed(1)}/10) amplifies this risk. Key-person disruption in ${industry} typically compounds revenue loss by 15-30% beyond the baseline estimate.`
    );
  }

  if (metrics.strategicCoherence === 'misaligned') {
    parts.push(
      'Strategic misalignment means resources are being spent on activities that do not advance the stated vision. Every dollar invested in a misaligned initiative has reduced return.'
    );
  }

  const highInsights = ctx.insights.filter((i) => i.severity === 'high');
  if (highInsights.length > 0) {
    parts.push(
      `The ${highInsights.length} critical finding${highInsights.length > 1 ? 's' : ''} identified in this report -- if unresolved over the next 12 months -- will push actual losses toward the upper end of this range.`
    );
  }

  return {
    id: 'cost-narrative',
    title: 'What This Is Costing You',
    content: parts.join('\n\n'),
    condition: (c) => {
      const bc = c.workspace.tools?.['business-context'];
      return Boolean(bc?.revenueRange);
    },
  };
}

// ---------------------------------------------------------------------------
// Individual Tool Section Narratives
// ---------------------------------------------------------------------------

/** Advisor Readiness narrative */
function buildAdvisorReadinessNarrative(ctx: NarrativeContext): NarrativeSection {
  const advisor = ctx.workspace.tools?.['advisor-readiness'];
  const parts: string[] = [];

  if (!advisor?.answers) {
    parts.push('The Advisor Readiness assessment has not been completed.');
    return { id: 'advisor-readiness-narrative', title: 'Advisor Readiness', content: parts.join('\n\n') };
  }

  const answers = advisor.answers as Record<string, number>;
  const scores = Object.values(answers).filter((v): v is number => typeof v === 'number');
  const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  parts.push(
    `Across ${scores.length} readiness dimensions, the average score is ${avg.toFixed(1)} out of 5. The strongest area scored ${maxScore}/5 and the weakest scored ${minScore}/5.`
  );

  if (avg >= 4) {
    parts.push(
      'This profile indicates strong advisory readiness. The organization has the operational foundations to absorb and act on strategic counsel.'
    );
  } else if (avg >= 3) {
    parts.push(
      'Advisory readiness is moderate. Some operational foundations exist, but gaps in delegation, financial systems, or team structure will slow the implementation of advisory recommendations.'
    );
  } else {
    parts.push(
      'Advisory readiness is limited. Before engaging external advisors, the organization should address basic operational maturity: documented processes, financial reporting, and delegation structures.'
    );
  }

  return {
    id: 'advisor-readiness-narrative',
    title: 'Advisor Readiness',
    content: parts.join('\n\n'),
    condition: (c) => Boolean(c.workspace.tools?.['advisor-readiness']?.answers),
  };
}

/** AI Readiness narrative */
function buildAIReadinessNarrative(ctx: NarrativeContext): NarrativeSection {
  const aiReadiness = ctx.workspace.tools?.['ai-readiness'];
  const parts: string[] = [];

  if (!aiReadiness) {
    parts.push('The AI Readiness assessment has not been completed.');
    return { id: 'ai-readiness-narrative', title: 'AI Readiness', content: parts.join('\n\n') };
  }

  const dimensions = ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture'] as const;
  const scored = dimensions
    .filter((d) => typeof aiReadiness[d] === 'number')
    .map((d) => ({ name: d, score: aiReadiness[d] as number }));

  if (scored.length === 0) {
    parts.push('AI Readiness scores have not been entered.');
    return { id: 'ai-readiness-narrative', title: 'AI Readiness', content: parts.join('\n\n') };
  }

  const avg = scored.reduce((s, d) => s + d.score, 0) / scored.length;
  const strongest = [...scored].sort((a, b) => b.score - a.score)[0];
  const weakest = [...scored].sort((a, b) => a.score - b.score)[0];

  parts.push(
    `Average AI Readiness across ${scored.length} dimensions is ${Math.round(avg)}%. ${strongest.name} leads at ${strongest.score}%. ${weakest.name} trails at ${weakest.score}%.`
  );

  if (avg < 30) {
    parts.push(
      'At this level, AI adoption should not be a near-term priority. Focus on data quality and process documentation first -- these are prerequisites for any meaningful AI deployment.'
    );
  } else if (avg < 60) {
    parts.push(
      'The organization is partially ready for targeted AI applications. Pilot projects in the strongest-scoring dimension will build institutional confidence while infrastructure gaps are closed.'
    );
  } else {
    parts.push(
      'AI Readiness is above 60%, indicating the organization can pursue production-grade AI initiatives. The constraint is likely strategic clarity, not technical capability.'
    );
  }

  // Highlight the gap between strongest and weakest
  const spread = strongest.score - weakest.score;
  if (spread > 40) {
    parts.push(
      `The ${spread}-point spread between ${strongest.name} (${strongest.score}%) and ${weakest.name} (${weakest.score}%) creates an internal bottleneck. AI initiatives that depend on ${weakest.name.toLowerCase()} will stall regardless of strength elsewhere.`
    );
  }

  return {
    id: 'ai-readiness-narrative',
    title: 'AI Readiness',
    content: parts.join('\n\n'),
    condition: (c) => {
      const ai = c.workspace.tools?.['ai-readiness'];
      return ai && ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture']
        .some((d) => typeof ai[d] === 'number');
    },
  };
}

/** Leadership DNA narrative */
function buildLeadershipDNANarrative(ctx: NarrativeContext): NarrativeSection {
  const dna = ctx.workspace.tools?.['leadership-dna'];
  const parts: string[] = [];

  if (!dna) {
    parts.push('The Leadership DNA assessment has not been completed.');
    return { id: 'leadership-dna-narrative', title: 'Leadership DNA', content: parts.join('\n\n') };
  }

  const archetype = ctx.metrics.leadershipArchetype;
  parts.push(
    `Your leadership profile: ${archetype.archetype}. ${archetype.description}.`
  );

  const gaps = getLeadershipGaps(dna);
  const significantGaps = gaps.filter((g) => g.gap > 2);
  const dimStrengths = gaps.filter((g) => g.current >= 7);

  if (dimStrengths.length > 0) {
    const names = dimStrengths.map((s) => `${s.dimension} (${s.current}/10)`);
    parts.push(`Strong dimensions: ${joinWithAnd(names)}.`);
  }

  if (significantGaps.length > 0) {
    const gapDescriptions = significantGaps.map(
      (g) => `${g.dimension} (current ${g.current}, target ${g.target}, gap of ${g.gap.toFixed(1)})`
    );
    parts.push(
      `Significant gaps (>2 points between current and target): ${joinWithAnd(gapDescriptions)}.`
    );
    parts.push(archetype.recommendation);
  }

  if (significantGaps.length === 0 && dimStrengths.length > 0) {
    parts.push(
      'No leadership dimension shows a gap greater than 2 points. Incremental improvement is the priority, not transformation.'
    );
  }

  return {
    id: 'leadership-dna-narrative',
    title: 'Leadership DNA',
    content: parts.join('\n\n'),
    condition: (c) => Boolean(c.workspace.tools?.['leadership-dna']),
  };
}

/** SWOT narrative */
function buildSwotNarrative(ctx: NarrativeContext): NarrativeSection {
  const swot = ctx.workspace.tools?.swot;
  const parts: string[] = [];

  if (!swot) {
    parts.push('The SWOT analysis has not been completed.');
    return { id: 'swot-narrative', title: 'SWOT Analysis', content: parts.join('\n\n') };
  }

  const strengths = extractSwotTexts(swot.strengths);
  const weaknesses = extractSwotTexts(swot.weaknesses);
  const opportunities = extractSwotTexts(swot.opportunities);
  const threats = extractSwotTexts(swot.threats);

  const total = strengths.length + weaknesses.length + opportunities.length + threats.length;
  parts.push(
    `The SWOT analysis captured ${total} items: ${strengths.length} strengths, ${weaknesses.length} weaknesses, ${opportunities.length} opportunities, and ${threats.length} threats.`
  );

  // Balance analysis
  const internalPositive = strengths.length;
  const internalNegative = weaknesses.length;
  if (internalNegative > internalPositive * 2) {
    parts.push(
      `The internal assessment skews negative -- ${internalNegative} weaknesses versus ${internalPositive} strengths. This may reflect genuine vulnerability or a self-critical team culture. Either reading has strategic implications.`
    );
  } else if (internalPositive > internalNegative * 2) {
    parts.push(
      `The internal assessment skews positive -- ${internalPositive} strengths versus ${internalNegative} weaknesses. Verify this reflects operational reality rather than blind spots.`
    );
  }

  // Quote specific items for personalization
  if (strengths.length > 0) {
    const cited = sample(strengths, 2).map(quoteClient);
    parts.push(`Key strengths in your team's own words: ${joinWithAnd(cited)}.`);
  }

  if (weaknesses.length > 0) {
    const cited = sample(weaknesses, 2).map(quoteClient);
    parts.push(`Acknowledged weaknesses: ${joinWithAnd(cited)}.`);
  }

  if (opportunities.length > 0 && threats.length > 0) {
    parts.push(
      `The external landscape presents ${opportunities.length} opportunities and ${threats.length} threats. The ratio suggests a ${opportunities.length >= threats.length ? 'favorable' : 'challenging'} environment -- but only if internal capacity exists to act on opportunities before threats materialize.`
    );
  }

  return {
    id: 'swot-narrative',
    title: 'SWOT Analysis',
    content: parts.join('\n\n'),
    condition: (c) => Boolean(c.workspace.tools?.swot),
  };
}

/** Vision Canvas narrative */
function buildVisionCanvasNarrative(ctx: NarrativeContext): NarrativeSection {
  const vision = ctx.workspace.tools?.['vision-canvas'];
  const parts: string[] = [];

  if (!vision) {
    parts.push('The Vision Canvas has not been completed.');
    return { id: 'vision-canvas-narrative', title: 'Vision Canvas', content: parts.join('\n\n') };
  }

  const northStar = vision.northStar ?? '';
  const pillars = (vision.pillars ?? []) as Array<{ name?: string; kpi?: string }>;
  const values = (vision.values ?? []) as string[];

  if (northStar) {
    parts.push(
      `North Star: ${quoteClient(northStar)}. This statement anchors every strategic decision that follows.`
    );
  } else {
    parts.push(
      'No North Star statement has been defined. Without one, the organization lacks a shared reference point for prioritization.'
    );
  }

  if (pillars.length > 0) {
    const pillarDescriptions = pillars.map((p) => {
      const name = p.name ?? 'Unnamed';
      const kpi = p.kpi ? ` (measured by: ${p.kpi})` : '';
      return `${name}${kpi}`;
    });
    parts.push(
      `${pillars.length} strategic pillars support the vision: ${joinWithAnd(pillarDescriptions)}.`
    );

    const pillarsWithKPI = pillars.filter((p) => p.kpi && p.kpi.trim().length > 0);
    if (pillarsWithKPI.length < pillars.length) {
      const missing = pillars.length - pillarsWithKPI.length;
      parts.push(
        `${missing} of ${pillars.length} pillars lack a defined KPI. Without measurable indicators, progress on these pillars cannot be tracked or verified.`
      );
    }
  }

  if (values.length > 0) {
    parts.push(
      `Stated core values: ${joinWithAnd(values)}. These values should drive hiring, performance reviews, and strategic trade-offs -- not just decorate the website.`
    );
  }

  // Coherence interpretation
  parts.push(interpretMetric('strategicCoherence', ctx.metrics.strategicCoherence, ctx));

  return {
    id: 'vision-canvas-narrative',
    title: 'Vision Canvas',
    content: parts.join('\n\n'),
    condition: (c) => Boolean(c.workspace.tools?.['vision-canvas']),
  };
}

/** 90-Day Roadmap narrative */
function buildRoadmapNarrative(ctx: NarrativeContext): NarrativeSection {
  const roadmap = ctx.workspace.tools?.roadmap;
  const parts: string[] = [];

  if (!roadmap?.tasks || !Array.isArray(roadmap.tasks) || roadmap.tasks.length === 0) {
    parts.push('The 90-Day Roadmap has not been populated.');
    return { id: 'roadmap-narrative', title: '90-Day Roadmap', content: parts.join('\n\n') };
  }

  const tasks = roadmap.tasks as Array<{ title?: string; owner?: string }>;
  parts.push(
    `The 90-day roadmap contains ${tasks.length} tasks.`
  );

  // Owner concentration analysis
  const ownerCounts: Record<string, number> = {};
  for (const task of tasks) {
    const owner = (task.owner || 'Unassigned').trim();
    ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
  }

  const uniqueOwners = Object.keys(ownerCounts);
  const maxOwner = uniqueOwners.reduce((a, b) =>
    (ownerCounts[a] ?? 0) > (ownerCounts[b] ?? 0) ? a : b,
    uniqueOwners[0] ?? 'Unassigned'
  );
  const maxCount = ownerCounts[maxOwner] ?? 0;
  const concentration = tasks.length > 0 ? maxCount / tasks.length : 0;

  parts.push(
    `${uniqueOwners.length} unique owners are assigned across all tasks. "${maxOwner}" holds ${maxCount} of ${tasks.length} tasks (${Math.round(concentration * 100)}% concentration).`
  );

  if (concentration > 0.7) {
    parts.push(
      `Task concentration above 70% on a single owner creates a critical execution bottleneck. If "${maxOwner}" is unavailable, ${Math.round(concentration * 100)}% of the 90-day plan stalls.`
    );
  } else if (concentration > 0.5) {
    parts.push(
      `Moderate task concentration on "${maxOwner}" (${Math.round(concentration * 100)}%). Consider redistributing 2-3 tasks to build team capability and reduce single-point-of-failure risk.`
    );
  }

  const unassigned = ownerCounts['Unassigned'] ?? ownerCounts['unassigned'] ?? 0;
  if (unassigned > 0) {
    parts.push(
      `${unassigned} task${unassigned > 1 ? 's remain' : ' remains'} unassigned. Tasks without owners do not get completed.`
    );
  }

  return {
    id: 'roadmap-narrative',
    title: '90-Day Roadmap',
    content: parts.join('\n\n'),
    condition: (c) => {
      const rm = c.workspace.tools?.roadmap;
      return rm?.tasks && Array.isArray(rm.tasks) && rm.tasks.length > 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Full Report Template Assembly
// ---------------------------------------------------------------------------

/**
 * Build the complete report narrative template from workspace context.
 * Returns a NarrativeTemplate whose sections are populated with data-driven
 * content and conditional rendering logic.
 */
export function buildReportTemplate(ctx: NarrativeContext): NarrativeTemplate {
  return {
    id: 'full-report',
    sections: [
      buildExecutiveHeadline(ctx),
      buildStrengthsNarrative(ctx),
      buildExposureNarrative(ctx),
      buildContradictionsNarrative(ctx),
      buildCostNarrative(ctx),
      buildLeadershipDNANarrative(ctx),
      buildVisionCanvasNarrative(ctx),
      buildSwotNarrative(ctx),
      buildAIReadinessNarrative(ctx),
      buildAdvisorReadinessNarrative(ctx),
      buildRoadmapNarrative(ctx),
    ],
  };
}

/**
 * Build a template for a single report section by ID.
 * Useful for rendering one section at a time (e.g., in a tabbed UI).
 */
export function buildSectionTemplate(
  sectionId: string,
  ctx: NarrativeContext
): NarrativeTemplate {
  const builders: Record<string, (c: NarrativeContext) => NarrativeSection> = {
    'executive-headline': buildExecutiveHeadline,
    'strengths-narrative': buildStrengthsNarrative,
    'exposure-narrative': buildExposureNarrative,
    'contradictions-narrative': buildContradictionsNarrative,
    'cost-narrative': buildCostNarrative,
    'leadership-dna-narrative': buildLeadershipDNANarrative,
    'vision-canvas-narrative': buildVisionCanvasNarrative,
    'swot-narrative': buildSwotNarrative,
    'ai-readiness-narrative': buildAIReadinessNarrative,
    'advisor-readiness-narrative': buildAdvisorReadinessNarrative,
    'roadmap-narrative': buildRoadmapNarrative,
  };

  const builder = builders[sectionId];
  if (!builder) {
    return {
      id: `single-${sectionId}`,
      sections: [{
        id: sectionId,
        title: 'Unknown Section',
        content: `No template exists for section "${sectionId}".`,
      }],
    };
  }

  return {
    id: `single-${sectionId}`,
    sections: [builder(ctx)],
  };
}

/**
 * Convenience: get all section IDs that the template system supports.
 */
export function getAvailableSectionIds(): string[] {
  return [
    'executive-headline',
    'strengths-narrative',
    'exposure-narrative',
    'contradictions-narrative',
    'cost-narrative',
    'leadership-dna-narrative',
    'vision-canvas-narrative',
    'swot-narrative',
    'ai-readiness-narrative',
    'advisor-readiness-narrative',
    'roadmap-narrative',
  ];
}
