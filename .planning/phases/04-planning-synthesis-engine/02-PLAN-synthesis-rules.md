---
wave: 2
depends_on:
  - 01-PLAN-90day-roadmap
files_modified:
  - src/lib/synthesis/rules/E1-execution-gap.ts
  - src/lib/synthesis/rules/E2-unmitigated-threat.ts
  - src/lib/synthesis/rules/E3-burnout-risk.ts
  - src/lib/synthesis/rules/E4-strength-leverage.ts
  - src/lib/synthesis/rules/E5-sop-metric-missing.ts
  - src/lib/synthesis/rules/E10-opportunity-match.ts
  - src/lib/synthesis/rules/E11-strength-multiplication.ts
  - src/lib/synthesis/rules/index.ts
autonomous: true
---

# Plan: Synthesis Rules (E1-E5, E10-E11)

## Objective

Implement 7 synthesis rules that analyze data across multiple tools to generate cross-functional insights: execution gaps, threat warnings, burnout risks, strength opportunities, and multiplicative advantages.

## Tasks

### Task 1: Create E1 - Execution Capability Gap Rule

**Action:** Create rule detecting when leadership execution is low but strategic pillars are too ambitious
**Files:** src/lib/synthesis/rules/E1-execution-gap.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E1-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E1 — Execution Capability Gap
 * Triggers when Leadership Execution score < 6 AND Vision Canvas has more pillars than capacity suggests
 */
const E1ExecutionGapRule: SynthesisRule = {
  id: 'E1-execution-capability-gap',
  name: 'Execution Capability Gap',
  description: 'Detects mismatch between execution capability and strategic ambition',
  requiredTools: ['leadership-dna', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const leadershipData = context.tools['leadership-dna'] as {
      dimensions?: { execution?: { current: number } };
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      pillars?: { id: string; title: string }[];
    } | undefined;

    if (!leadershipData?.dimensions?.execution || !visionData?.pillars) {
      return insights;
    }

    const executionScore = leadershipData.dimensions.execution.current;
    const pillarCount = visionData.pillars.length;

    // Dynamic limit: higher execution = can handle more pillars
    // Execution 10 → 6 pillars, Execution 5 → 3 pillars, Execution 1 → 1 pillar
    const pillarLimit = Math.max(1, Math.floor(executionScore * 0.6));

    if (executionScore < 6 && pillarCount > pillarLimit) {
      insights.push({
        id: generateInsightId(),
        ruleId: 'E1-execution-capability-gap',
        type: 'gap',
        severity: 4,
        title: 'Execution Capability Gap',
        description: `Your current execution capability score (${executionScore}/10) may not support ${pillarCount} strategic pillars. With current execution strength, ${pillarLimit} pillars would be more manageable.`,
        recommendation: 'Consider: (1) Prioritize to ${pillarLimit} pillars for near-term focus, (2) Invest in execution capabilities before expanding scope, or (3) Delegate pillar ownership to reduce personal execution load.',
        affectedTools: ['leadership-dna', 'vision-canvas'],
        data: {
          executionScore,
          pillarCount,
          recommendedPillars: pillarLimit,
          gap: pillarCount - pillarLimit
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E1ExecutionGapRule);
export default E1ExecutionGapRule;
```

### Task 2: Create E2 - Unmitigated Threat Rule

**Action:** Create rule detecting high-confidence SWOT threats without addressing roadmap tasks
**Files:** src/lib/synthesis/rules/E2-unmitigated-threat.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E2-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E2 — Unmitigated Threat
 * Triggers when high-confidence threats exist but no roadmap tasks address them
 */
const E2UnmitigatedThreatRule: SynthesisRule = {
  id: 'E2-unmitigated-threat',
  name: 'Unmitigated Threat Warning',
  description: 'Identifies high-confidence threats without corresponding action plans',
  requiredTools: ['swot-analysis', '90day-roadmap'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      threats?: { id: string; text: string; confidence: number }[];
    } | undefined;

    const roadmapData = context.tools['90day-roadmap'] as {
      tasks?: { id: string; title: string; notes: string }[];
    } | undefined;

    if (!swotData?.threats || !roadmapData?.tasks) {
      return insights;
    }

    // Find high-confidence threats (4 or 5)
    const highConfidenceThreats = swotData.threats.filter(t => t.confidence >= 4);

    // Check if any roadmap task addresses the threat (simple keyword matching)
    const taskTexts = roadmapData.tasks
      .map(t => `${t.title} ${t.notes}`.toLowerCase())
      .join(' ');

    for (const threat of highConfidenceThreats) {
      // Extract keywords from threat text (words > 4 chars)
      const keywords = threat.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4);

      const isAddressed = keywords.some(keyword => taskTexts.includes(keyword));

      if (!isAddressed) {
        insights.push({
          id: generateInsightId(),
          ruleId: 'E2-unmitigated-threat',
          type: 'warning',
          severity: threat.confidence >= 5 ? 5 : 4,
          title: 'Unmitigated Threat',
          description: `High-confidence threat "${threat.text}" (confidence: ${threat.confidence}/5) has no corresponding action item in your 90-day roadmap.`,
          recommendation: 'Add a specific task to your roadmap to address this threat. Consider: mitigation strategies, contingency planning, or risk monitoring.',
          affectedTools: ['swot-analysis', '90day-roadmap'],
          data: {
            threatText: threat.text,
            threatConfidence: threat.confidence,
            threatId: threat.id
          }
        });
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E2UnmitigatedThreatRule);
export default E2UnmitigatedThreatRule;
```

### Task 3: Create E3 - Burnout Risk Rule

**Action:** Create rule detecting when advisor readiness is low but roadmap is overloaded
**Files:** src/lib/synthesis/rules/E3-burnout-risk.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E3-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E3 — Burnout Risk
 * Triggers when advisor readiness < 50% AND roadmap tasks exceed safe capacity
 */
const E3BurnoutRiskRule: SynthesisRule = {
  id: 'E3-burnout-risk',
  name: 'Burnout Risk Warning',
  description: 'Identifies risk of burnout from low readiness combined with high workload',
  requiredTools: ['advisor-readiness', '90day-roadmap'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const advisorData = context.tools['advisor-readiness'] as {
      answers?: Record<string, number>;
    } | undefined;

    const roadmapData = context.tools['90day-roadmap'] as {
      tasks?: { id: string; week: number }[];
    } | undefined;

    if (!advisorData?.answers || !roadmapData?.tasks) {
      return insights;
    }

    // Calculate advisor readiness percentage
    const answerValues = Object.values(advisorData.answers);
    const totalScore = answerValues.reduce((sum, v) => sum + v, 0);
    const maxScore = answerValues.length * 5;
    const readinessPercentage = Math.round((totalScore / maxScore) * 100);

    // Calculate task density (tasks per week average for weeks with tasks)
    const tasksByWeek = roadmapData.tasks.reduce((acc, t) => {
      acc[t.week] = (acc[t.week] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const activeWeeks = Object.keys(tasksByWeek).length;
    const avgTasksPerWeek = activeWeeks > 0
      ? roadmapData.tasks.length / activeWeeks
      : 0;

    // Safe capacity: readiness 100% = 5 tasks/week, 50% = 2.5, 0% = 0
    const safeCapacity = (readinessPercentage / 100) * 5;

    if (readinessPercentage < 50 && avgTasksPerWeek > safeCapacity) {
      insights.push({
        id: generateInsightId(),
        ruleId: 'E3-burnout-risk',
        type: 'warning',
        severity: readinessPercentage < 30 ? 5 : 4,
        title: 'Burnout Risk Detected',
        description: `Your advisor readiness score (${readinessPercentage}%) suggests limited capacity, but your roadmap averages ${avgTasksPerWeek.toFixed(1)} tasks per active week. This exceeds the recommended ${safeCapacity.toFixed(1)} tasks/week for your current state.`,
        recommendation: 'Consider: (1) Reduce roadmap scope or extend timeline, (2) Delegate tasks to improve capacity, (3) Focus on improving operational maturity before scaling execution.',
        affectedTools: ['advisor-readiness', '90day-roadmap'],
        data: {
          readinessPercentage,
          avgTasksPerWeek,
          safeCapacity,
          totalTasks: roadmapData.tasks.length,
          overloadFactor: avgTasksPerWeek / safeCapacity
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E3BurnoutRiskRule);
export default E3BurnoutRiskRule;
```

### Task 4: Create E4 - Strength Leverage Rule

**Action:** Create rule detecting underutilized high-confidence strengths
**Files:** src/lib/synthesis/rules/E4-strength-leverage.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E4-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E4 — Strength Leverage
 * Triggers when high-confidence strengths aren't connected to strategic pillars
 */
const E4StrengthLeverageRule: SynthesisRule = {
  id: 'E4-strength-leverage',
  name: 'Untapped Strength Opportunity',
  description: 'Identifies high-confidence strengths not leveraged in strategy',
  requiredTools: ['swot-analysis', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      strengths?: { id: string; text: string; confidence: number }[];
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      pillars?: { id: string; title: string; description: string }[];
      coreValues?: string[];
    } | undefined;

    if (!swotData?.strengths || !visionData?.pillars) {
      return insights;
    }

    // Get high-confidence strengths
    const highConfidenceStrengths = swotData.strengths.filter(s => s.confidence >= 4);

    // Combine all strategic text for matching
    const pillarText = visionData.pillars
      .map(p => `${p.title} ${p.description}`)
      .join(' ')
      .toLowerCase();

    const valuesText = (visionData.coreValues || []).join(' ').toLowerCase();
    const strategicText = `${pillarText} ${valuesText}`;

    for (const strength of highConfidenceStrengths) {
      // Extract keywords from strength
      const keywords = strength.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4);

      const isLeveraged = keywords.some(keyword => strategicText.includes(keyword));

      if (!isLeveraged) {
        insights.push({
          id: generateInsightId(),
          ruleId: 'E4-strength-leverage',
          type: 'opportunity',
          severity: 3,
          title: 'Untapped Strength',
          description: `High-confidence strength "${strength.text}" (${strength.confidence}/5) doesn't appear to be reflected in your strategic pillars or core values.`,
          recommendation: 'Consider how this strength could inform a strategic pillar, differentiate your value proposition, or accelerate existing initiatives.',
          affectedTools: ['swot-analysis', 'vision-canvas'],
          data: {
            strengthText: strength.text,
            strengthConfidence: strength.confidence,
            strengthId: strength.id
          }
        });
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E4StrengthLeverageRule);
export default E4StrengthLeverageRule;
```

### Task 5: Create E5 - SOP Metric Missing Rule

**Action:** Create rule detecting when metrics are defined but SOP maturity is too low
**Files:** src/lib/synthesis/rules/E5-sop-metric-missing.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E5-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E5 — SOP Metric Missing
 * Triggers when trying to track metrics without proper process documentation
 */
const E5SOPMetricMissingRule: SynthesisRule = {
  id: 'E5-sop-metric-missing',
  name: 'SOP Foundation Missing',
  description: 'Identifies areas where metrics cannot be trusted due to immature processes',
  requiredTools: ['sop-maturity', 'vision-canvas'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const sopData = context.tools['sop-maturity'] as {
      areas?: { id: string; name: string; maturity: number; importance: number }[];
    } | undefined;

    const visionData = context.tools['vision-canvas'] as {
      northStar?: { metric: string; target: string };
    } | undefined;

    if (!sopData?.areas || !visionData?.northStar?.metric) {
      return insights;
    }

    // Check if critical processes are immature
    const criticalImmatureSOPs = sopData.areas.filter(
      area => area.importance >= 4 && area.maturity < 3
    );

    if (criticalImmatureSOPs.length > 0) {
      const sopNames = criticalImmatureSOPs.map(s => s.name).join(', ');

      insights.push({
        id: generateInsightId(),
        ruleId: 'E5-sop-metric-missing',
        type: 'warning',
        severity: 4,
        title: 'Unreliable Metrics Risk',
        description: `You're tracking "${visionData.northStar.metric}" as your North Star, but ${criticalImmatureSOPs.length} critical process(es) lack mature SOPs: ${sopNames}. Without standardized processes, metrics may be inconsistent or misleading.`,
        recommendation: 'Prioritize documenting and standardizing these critical processes before heavily relying on metrics. Immature processes produce unreliable data.',
        affectedTools: ['sop-maturity', 'vision-canvas'],
        data: {
          northStarMetric: visionData.northStar.metric,
          immatureProcesses: criticalImmatureSOPs.map(s => ({
            name: s.name,
            maturity: s.maturity,
            importance: s.importance
          }))
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E5SOPMetricMissingRule);
export default E5SOPMetricMissingRule;
```

### Task 6: Create E10 - Opportunity-Capability Match Rule

**Action:** Create rule detecting alignment between opportunities and capabilities
**Files:** src/lib/synthesis/rules/E10-opportunity-match.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E10-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E10 — Opportunity-Capability Match
 * Identifies when high-confidence opportunities align with existing strengths
 */
const E10OpportunityMatchRule: SynthesisRule = {
  id: 'E10-opportunity-capability-match',
  name: 'Opportunity-Capability Alignment',
  description: 'Finds opportunities that align with existing strengths',
  requiredTools: ['swot-analysis'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const swotData = context.tools['swot-analysis'] as {
      strengths?: { id: string; text: string; confidence: number }[];
      opportunities?: { id: string; text: string; confidence: number }[];
    } | undefined;

    if (!swotData?.strengths || !swotData?.opportunities) {
      return insights;
    }

    const highConfidenceOpps = swotData.opportunities.filter(o => o.confidence >= 4);
    const highConfidenceStrengths = swotData.strengths.filter(s => s.confidence >= 4);

    for (const opportunity of highConfidenceOpps) {
      const oppKeywords = opportunity.text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);

      for (const strength of highConfidenceStrengths) {
        const strengthKeywords = strength.text
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 3);

        // Check for keyword overlap
        const overlap = oppKeywords.filter(k =>
          strengthKeywords.some(sk => sk.includes(k) || k.includes(sk))
        );

        if (overlap.length > 0) {
          insights.push({
            id: generateInsightId(),
            ruleId: 'E10-opportunity-capability-match',
            type: 'opportunity',
            severity: 2,
            title: 'Strategic Alignment Found',
            description: `Your strength "${strength.text}" aligns well with opportunity "${opportunity.text}". This combination has high potential for success.`,
            recommendation: 'Consider prioritizing this opportunity since you have an existing capability advantage. Build a specific initiative around this alignment.',
            affectedTools: ['swot-analysis'],
            data: {
              strengthText: strength.text,
              opportunityText: opportunity.text,
              alignmentKeywords: overlap
            }
          });
        }
      }
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E10OpportunityMatchRule);
export default E10OpportunityMatchRule;
```

### Task 7: Create E11 - Strength Multiplication Rule

**Action:** Create rule detecting compounding advantages across dimensions
**Files:** src/lib/synthesis/rules/E11-strength-multiplication.ts
**Details:**

```typescript
import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E11-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E11 — Strength Multiplication
 * Identifies when multiple assessment areas show compounding strength
 */
const E11StrengthMultiplicationRule: SynthesisRule = {
  id: 'E11-strength-multiplication',
  name: 'Compounding Advantage',
  description: 'Detects multiplicative advantages across multiple dimensions',
  requiredTools: ['leadership-dna', 'ai-readiness', 'business-eq'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const leadershipData = context.tools['leadership-dna'] as {
      dimensions?: Record<string, { current: number }>;
    } | undefined;

    const aiData = context.tools['ai-readiness'] as {
      dimensions?: Record<string, number>;
    } | undefined;

    const eqData = context.tools['business-eq'] as {
      entries?: Array<{ dimensions: Record<string, number> }>;
    } | undefined;

    // Calculate strength indicators
    const strengths: { area: string; score: number }[] = [];

    // Leadership: check for high scores (>= 7)
    if (leadershipData?.dimensions) {
      Object.entries(leadershipData.dimensions).forEach(([key, val]) => {
        if (val.current >= 7) {
          strengths.push({ area: `Leadership: ${key}`, score: val.current });
        }
      });
    }

    // AI Readiness: check for high scores (>= 70)
    if (aiData?.dimensions) {
      Object.entries(aiData.dimensions).forEach(([key, val]) => {
        if (val >= 70) {
          strengths.push({ area: `AI: ${key}`, score: val });
        }
      });
    }

    // Business EQ: check latest entry for high scores (>= 70)
    if (eqData?.entries && eqData.entries.length > 0) {
      const latestEntry = eqData.entries[eqData.entries.length - 1];
      Object.entries(latestEntry.dimensions).forEach(([key, val]) => {
        if (val >= 70) {
          strengths.push({ area: `EQ: ${key}`, score: val });
        }
      });
    }

    // If 5+ high-scoring areas, it's a multiplicative advantage
    if (strengths.length >= 5) {
      const topStrengths = strengths
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      insights.push({
        id: generateInsightId(),
        ruleId: 'E11-strength-multiplication',
        type: 'strength',
        severity: 1,
        title: 'Compounding Advantages Detected',
        description: `You have ${strengths.length} areas scoring in the top tier across leadership, AI readiness, and emotional intelligence. These create multiplicative advantages: ${topStrengths.map(s => s.area).join(', ')}.`,
        recommendation: 'Leverage these compounding strengths by taking on more ambitious strategic initiatives. Your multi-dimensional strength position is rare and valuable.',
        affectedTools: ['leadership-dna', 'ai-readiness', 'business-eq'],
        data: {
          totalHighScores: strengths.length,
          topStrengths
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E11StrengthMultiplicationRule);
export default E11StrengthMultiplicationRule;
```

### Task 8: Create Rules Index

**Action:** Create index file to import all rules
**Files:** src/lib/synthesis/rules/index.ts
**Details:**

```typescript
// Import all synthesis rules - they self-register on import
import './E1-execution-gap';
import './E2-unmitigated-threat';
import './E3-burnout-risk';
import './E4-strength-leverage';
import './E5-sop-metric-missing';
import './E10-opportunity-match';
import './E11-strength-multiplication';

export { synthesisRuleRegistry } from '../ruleRegistry';
```

### Task 9: Update Main Synthesis Index

**Action:** Import rules index in main synthesis module
**Files:** src/lib/synthesis/index.ts
**Details:**

```typescript
export * from './types';
export { synthesisRuleRegistry } from './ruleRegistry';
import './rules'; // Import all rules to trigger registration
```

### Task 10: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] E1 rule triggers when execution < 6 AND pillars > capacity
- [ ] E2 rule triggers for high-confidence threats without roadmap tasks
- [ ] E3 rule triggers when readiness < 50% AND tasks exceed capacity
- [ ] E4 rule triggers for high-confidence strengths not in strategy
- [ ] E5 rule triggers when tracking metrics with immature SOPs
- [ ] E10 rule identifies opportunity-strength alignments
- [ ] E11 rule detects multiplicative advantages across dimensions
- [ ] All rules self-register through synthesisRuleRegistry
- [ ] Build completes successfully

## Must-Haves

- SYN-01: E1 — Execution Capability Gap rule
- SYN-02: E2 — Unmitigated Threat rule
- SYN-03: E3 — Burnout Risk rule
- SYN-04: E4 — Strength Leverage rule
- SYN-05: E5 — SOP Metric Missing rule
- SYN-06: E10 — Opportunity-Capability Match rule
- SYN-07: E11 — Strength Multiplication rule
- Self-registering rule pattern
